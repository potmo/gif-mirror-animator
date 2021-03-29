'use strict';
const color_convert = require('./color-convert');
const colors = require('colors');
const PNGImage = require('pngjs-image');
const fs = require('fs-extra');
const path = require('path');


async function load(color_map, folder) {
	console.log(`reading images from ${folder}`);
	const images = await loadImages(folder);
	const width = images[0].getWidth();
	const height = images[0].getHeight()
	let pixels = [];
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			let pixel_colors = [];
			for (let image of images) {
				// this returns ABGR color
				let abgr = image.getAt(x, y) >>> 0;
				let argb = color_convert.ABGRtoARGB(abgr);

				let char = color_map[argb];
				if (char !== undefined) {
					pixel_colors.push(char);
				} else {
					throw new Error(`ARGB: ${color_convert.toHexString(argb)} ABGR: ${color_convert.toHexString(abgr)}  is not in color map ${Object.keys(color_map).map(color_convert.toHexString).join(', ')}`);
				}
			}

			const obj = {
				x: x / width,
				y: y / height,
				pixel_colors,
			}

			pixels.push(obj);
		}
	}

	const subsequence_length = images.length;

	return {
		subsequence_length,
		pixels,
		image_size: {
			width, height
		}
	};
}

async function loadImages(dir) {

	const files = await fs.readdir(dir);

	const loads = files
		.sort()
		.map( file => path.join(dir, file))
		.filter(file => path.extname(file) === '.png')
		.map( file => readImage(file));

	const images = await Promise.all(loads)
	return images;
}

async function readImage(path) {
	return new Promise((resolve, reject) => {
		PNGImage.readImage(path, function (err, image) {
    	if (err) return reject(err);
    	if (!image) return reject(new Error('No image'));
			resolve(image);
		});
	});
}


module.exports = {
	load,
}