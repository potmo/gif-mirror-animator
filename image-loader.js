"use strict";

import canvas from 'canvas';
const { createCanvas, loadImage } = canvas;
import fs from 'fs-extra';
import path from 'path';
import colors from 'colors';


export async function load(settings) {
  var images = []
	if (settings.input.atlas) {
		images = await readImageAsFrameAtlas(settings.input.atlas.path, 
										   settings.input.atlas.columns,
										   settings.input.atlas.rows);
	} else if (settings.input.image) {
		images = await Promise.all(settings.input.image.paths.map( async (path) => { 
			return await readImage(path);
		}));
	} else if (settings.input.image_and_rotate) {
		images = await Promise.all(settings.input.image_and_rotate.images.map( async (item) => { 
			return await readImageAndRotate(item.path, item.rotation);
		}));
	}

  if (settings.input.duplicate_frames) {
    console.log(`Looping frames ${settings.input.duplicate_frames} times`);
    images = Array.from({length: settings.input.duplicate_frames}, ()=> images).flat();
  }

  return images;

}

export async function readImage(path) {
	console.log(`loading image: ${path}`.yellow);

	let image = await loadImage(path);
	let output = getOutputImage(image.width, image.height);
	let canvas = output.getContext('2d');
	canvas.drawImage(image, 0, 0);

	return output;
}

async function readImageAndRotate(path, angle) {
	let input = await readImage(path);
	let output = getOutputImage(input.width, input.height);
	let context = output.getContext('2d');

	context.clearRect(0, 0 , output.width, output.height);
	context.save();
	context.translate(output.width/2,output.height/2);
	context.rotate(angle);
	context.drawImage(input,-input.width/2,-input.width/2);
	context.restore();

	return output;
}

export function getOutputImage(width, height, color) {
	color = color || {r:255, g: 255, b: 255, a: 0};
  const output = createCanvas(width, height)
  const context = output.getContext("2d")
  context.fillStyle = `rgba(${color.r},${color.g},${color.b},${color.a / 256})`;
  context.fillRect(0,0, width, height);
  return output;
}

async function readImageAsFrameAtlas(path, columns, rows) {

	console.log(`loading atlas: ${path}`.yellow);
	let input = await readImage(path);

	let outputs = Array
		.from({length: rows * columns}, (v, i) => getOutputImage(input.width / columns, input.height / rows))
		.map((image, i) => {
			let context = image.getContext('2d');
			let column = i % columns;
			let row = Math.floor(i / columns);
			context.drawImage(input, column * image.width, row * image.height, image.width, image.height, 0, 0, image.width, image.height);
			return image;
		})


	return outputs;
}

export async function writeImage(file, canvas) {
  console.log(`saved ${file}`.yellow);
  await writeImageSilent(file, canvas);
}

export async function writeImageSilent(file, canvas) {
  const buffer = await toBuffer(canvas);
  await fs.writeFile(path.join(path.resolve(), file), buffer);
}

async function toBuffer(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBuffer(function(err, buf){
      if (err) {
        reject(err);
        return;
      }
      resolve(buf);
    });
  });
}