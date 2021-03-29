"use strict";

import fs from 'fs-extra';
import path from 'path';
import colors from 'colors';
import * as Hex from './hex.js';
import * as color_convert from './color-convert.js';
import {writeImage, getOutputImage} from './image-loader.js';

export {
	convert,
}

async function convert(settings, images) {
	var {width, height} = extractSize(images);
	let {color_map} = extractColorMap(images, width, height);
	const color_array = Object.keys(color_map);



	const sampled_images = images.map( (raw) => createSampledImage(width, height, raw));
		
	if (settings.print.palette) {
		console.log('Palette');
		Object.keys(color_map).forEach(color => {
			let hexColor = color_convert.toHexString(color);
			let name = color_map[color];
			let rgbColor = color_convert.toARGBObject(color);
			console.log(color_convert.toConsoleString(color, '  ') + `${hexColor} ${name}`.green)
		});
	}
	
	const pixel_images = sampled_images.map(image => getPixelsForWorld(image, width, height, color_map));

	var pixels = pixel_images[0].map((pixel, i) => {
		const pixel_colors = pixel_images.map( image => image[i].color);
		const x = pixel.x;
		const y = pixel.y;
		return {
			pixel_colors,
			x,
			y,
		};
	});

  // make it round
  // this is the apothem witch is the radius of a 
  // circle inscribed in a hexagon that is incribed in a circle with diameter 1
  // this is basically cutting off the corners of the hexagon and making it into a circle
  /*
  let max_dist = Math.sqrt(3) / 4; 
  pixels = pixels.filter(pixel => {
    let dist = Math.sqrt(Math.pow(pixel.x - 0.5, 2) + Math.pow(pixel.y - 0.5 ,2));
    return dist < 0.5//0.374;//max_dist;
  });
  */

	if (settings.output.simulation.hex.enabled) {
		let output_path = path.join(settings.output.path, 'hex');
		await fs.remove(output_path);
		await fs.mkdirs(output_path);

		for (let i = 0; i < sampled_images.length; i++) {
			const image = sampled_images[i];
			let hex_image = renderWorld(image, 
										color_map, 
										settings);
			await writeImage(path.join(output_path, `${i}.png`), hex_image);
		}
	}

	return {frames: sampled_images.length, pixels, image_size: {width, height}, color_map};
}


function extractSize(images) {
	let width = Math.min(...images.map((a)=> a.width));
	let height = Math.min(...images.map((a)=> a.height));
	return {width, height};
}

function extractColorMap(images, width, height) {

	var colors = [];
	for (var image of images) {
		let context = image.getContext('2d');
		var p = context.getImageData(0, 0, image.width, image.height).data; 
		for (i = 0; i < p.length; i += 4) {
			let color = color_convert.objToARGB({r: p[i+0],  g: p[i+1], b: p[i+2], a: p[i+3]});	
			if (!colors.includes(color)) {
					colors.push(color);
			}
		}

	}

	var color_map = {};
	var color_names = "ABCDEFGHIJKLMNOPQRSTUVWXYZÅÄÖ1234567890".split('');
	for (var i = 0; i < colors.length; i++) {
		color_map[colors[i]] = color_names[i];
	}

	return {color_map};
	
}

function createSampledImage( width, height, image) {

	const world = {hexes: {}};
	const origo = Hex.Hex(0,0,0);
	const middle = Hex.move(origo, 0, 5);

	const hex_positions = Hex.spiral_fill_circle(middle, width / 2); // do a little bit more than radius. Then remove to circle later
	const positions = hex_positions.map(hex => Hex.roffset_from_cube(1, hex));


	const min = positions.reduce((best,pos) => {
		return {
			row: Math.min(best.row, pos.row),
			col: Math.min(best.col, pos.col),
		}
	}, {col: Number.MAX_VALUE, row: Number.MAX_VALUE})

	const adjusted_positions = positions.map(pos => {
		return {
			col: pos.col + Math.abs(min.col),
			row: pos.row + Math.abs(min.row),
		}
	});

	let context = image.getContext('2d');
	let p = context.getImageData(0, 0, image.width, image.height).data; 
	const colors = positions.map((pos, i) => { // adjusted_position
		//let abgr = image.getAt(pos.col, pos.row) >>> 0;
		//let argb = color_convert.ABGRtoARGB(abgr);
    
    var col = pos.col + image.width/2;
    var row = pos.row + image.height/2;
    //col = Math.max(0,Math.min(col, image.width-1));
    //row = Math.max(0,Math.min(row, image.height-1));
		let index = (col + row * image.width) * 4;
		var argb = color_convert.objToARGB({r: p[index+0],  g: p[index+1], b: p[index+2], a: p[index+3]});	

    if (col < 0 || col > image.width - 1 || row < 0 || row > image.height - 1) {
      argb = 0xFFFF0000;
    }
		return {
			hex: hex_positions[i],
			color: argb,
		}
	});

	colors.forEach(({hex, color}) => storeHex(world, hex, color));

	return world;

}

function* createSpaceImage(color_map, width, height, background) {

	const frames = 36;

	const red = color_map[1];
	const yellow = color_map[2];
	const blue = color_map[0];

	const colors = [yellow, red];
	const origo = Hex.Hex(0,0,0);
	const middle = Hex.move(origo, 0, 5);

	const ring = Hex.ring(origo, width / 2 - 1);

	const background_image = getSortedWorldArray(background);

	let particles = Array(600)
										.fill()
										.map( i => {
											const ring_id = Math.round(Math.random() * (ring.length - 1));
											const end_hex = ring[ring_id];
											const line = Hex.linedraw(origo, end_hex);
											const offset = Math.floor(Math.random() * line.length);
											const color_id = Math.round(Math.random() * (colors.length-1));
											const color = colors[color_id];
											return {line, color, offset};
										});


	for (let i = 0; i < frames; i++) {
		const world = {hexes: {}};

		//background_image.forEach(({hex, color}) => storeHex(world, hex, color));
		Hex.spiral_fill(middle, width/2)
	  	.forEach(hex => storeHex(world, hex, blue));

		particles.map( obj => {
			const offset = i / frames;
			const hex = obj.line[ Math.round(obj.offset + obj.line.length * offset) % (obj.line.length) ];
			const color = obj.color;
			return {hex, color};
		})
		.forEach(({hex, color}) => storeHex(world, hex, color));

		yield world;
	}

}


function getPixelsForWorld(world, width, height, color_map) {
	const layout = Hex.Layout(Hex.layout_pointy, {x: 0.5, y: 0.5}, {x: width/2, y: height/2});
	return getSortedWorldArray(world)
					.map( hex => {
						const pos = Hex.to_pixel(layout, hex.hex);
						//console.log(pos);
						return {
							x: pos.x / width,
							y: pos.y / height,
							color: color_map[hex.color],
						};
					});
}

function renderWorld(world, color_map, settings) {
	const reverse_color_map = Object.keys(color_map)
		.reduce( (map, color) => {
			map[color_map[color]] = color;
			return map;
		}, {});

	const {width, height, mirror_size} = settings.output.simulation.hex;
	const output = getOutputImage(width, height, {r: 255, g: 255, b: 255, a: 255});
	const layout = Hex.Layout(Hex.layout_pointy, {x: mirror_size, y: mirror_size}, {x: width/2, y: height/2});
	const context = output.getContext("2d");

	getSortedWorldArray(world).forEach( hex => drawHex(context, layout, hex.hex, hex.color))

	return output;
}

function getSortedWorldArray(world) {
	let output = [];
	const q_keys = Object.keys(world.hexes).sort();
	for (let q_key of q_keys) {
		const q = world.hexes[q_key];

		const r_keys = Object.keys(q || {}).sort();
		for (let r_key of r_keys) {
			const r = world.hexes[q_key][r_key];

			const s_keys = Object.keys(r || {}).sort();
			for (let s_key of s_keys) {
				const s = world.hexes[q_key][r_key][s_key];
				output.push(s);
			}
		}
	}

	const min_max = output
	.map(a => Hex.roffset_from_cube(1, a))
	.reduce((best, curr) => {
		return {
			min: Math.min(best.min, curr.row),
			max: Math.max(best.max, curr.row),
		}
	}, {min: Number.MAX_VALUE, max: Number.MIN_VALUE});

	const width = Math.abs(min_max.min) + Math.abs(min_max.max);

	return output.sort((a_cube,b_cube) => {
		const a = Hex.roffset_from_cube(1, a_cube);
		const b = Hex.roffset_from_cube(1, b_cube);
		return (a.col * width + a.row) - (b.col * width + b.row);
	})
}

function storeHex(world, hex, color) {
	world.hexes[hex.q] = world.hexes[hex.q] || {};
	world.hexes[hex.q][hex.r] = world.hexes[hex.q][hex.r] || {};
	world.hexes[hex.q][hex.r][hex.s] = world.hexes[hex.q][hex.r][hex.s] || null;
	world.hexes[hex.q][hex.r][hex.s] = {hex, color};
}

function drawHex(context, layout, hex, color) {

	let corners = Hex.polygon_corners(layout, hex);
	//console.log(color, color_convert.toCSS(color));

	context.fillStyle = color_convert.toCSS(color);
	context.strokeStyle = color_convert.toCSS(0xFF000000);

  context.beginPath();

  let corner = corners.pop();
  context.moveTo(corner.x, corner.y);

  for (const c of corners) {
  	context.lineTo(c.x, c.y);
  }

  context.closePath();
  context.stroke();
  context.fill();
}

function enumerate(from, to) {
	return Array(Math.abs(Math.max(to) - Math.min(from)) + 1)
				.fill()
				.map( (_, i , a) => from + (to - from) * (i / (a.length - 1)))
}

Array.prototype.peek = function(callback) {
	callback(this);
	return this;
}

Array.prototype.peekEach = function(callback) {
	this.forEach(callback);
	return this;
}




