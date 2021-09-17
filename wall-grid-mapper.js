'use strict';

import Canvas from 'canvas';
const Image = Canvas.Image;
import fs from  'fs-extra';
import path from  'path';
import colors from  'colors';
import GIFEncoder from  'gifencoder';
import cliProgress from  'cli-progress';

import * as color_convert from  './color-convert.js';
import {writeImage, writeImageSilent, getOutputImage} from './image-loader.js';

export async function map(settings, pixels, sequences, sequence_keys, reverse_color_map, image_size, frames) {

	const unduplicated_frames = frames / settings.input.duplicate_frames;

	const width = settings.output.image.width;
	const height = settings.output.image.height;
	

	const output = getOutputImage(width, height, {r: 255, g: 255, b: 255, a: 0});
	const context = output.getContext("2d");
	const colors = sequence_keys.map(string => string.split('')
													 		.map( color => reverse_color_map[color])
													 		.map(color_convert.toARGBObject));

	const columns = settings.output.image.columns;
	const rows = Math.ceil(colors.length / columns);

	
	const row_height = height / rows;
	const column_width = width / columns;

	for (let row = 0; row < rows; row++) {
		
		for (let column = 0; column < columns; column++) {

			const x = column * column_width;
			const y = row * row_height;
			const index = row * columns + column;
			const color = colors[index][0]; // this should only have one frame hence the 0
			context.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, 1.0})`;
			context.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, 1.0})`;
			context.beginPath();
			context.rect(x, y, column_width, row_height);
			context.fill();
			context.stroke();
		}
	}

	const color_mapping = findColorMapping(pixels, sequences);

	const items = color_mapping.map( item => {
		const index = sequence_keys.indexOf(item.offset_key);
		const color = colors[index][0];
		
		const row = Math.floor(index / columns);
		const column = index - row * rows;

		const x = column * column_width + column_width / 2;
		const y = row_height * row + row_height / 2; 


		return {row, column, aim_position: {x,y}, string: item.string, color, colors: [color]};
	});
	

	var mapping = pixels.map((pixel, i) => {
		const item = items[i];
		const aim_position = item.aim_position;

		
		return {
			mirror: {
				x: pixel.x - 0.5, // offset to be between -0.5 and 0.5
				y: pixel.y - 0.5,
			},
			palette: {
				x: aim_position.x / width - 0.5, // offset to be between -0.5 and 0.5
				y: aim_position.y / height - 0.5, // offset to be between -0.5 and 0.5
				colors: item.colors,
			},
			row: item.row,
			column: item.column,
			string: item.string
		};
	})

	const mapping_conf = {
		mirror: {
			width: image_size.width,
			height: image_size.height,
		},
		palette: {
			width,
			height,
		},
		mapping,
	}

	if (settings.output.texture) {	
		await writeImage(path.join(settings.output.path,'texture.png'), output);
	}

	return mapping_conf;
}



function findColorMapping(pixels, sequences) {
	let stats = {};
	let result = pixels.map( pixel => {
		const pixel_string = pixel.pixel_colors.join('');
		let key = findKeyAndOffset(sequences, pixel_string);
		stats[key.offset_key] = (stats[key.offset_key] || 0) + 1;
		return key;
	});

	return result;
}


function findKeyAndOffset(sequences, pixel_string) {
	for (var key in sequences) {
		const offsets = sequences[key];
		for (let offset of offsets) {
			if (pixel_string === offset.string) {
				return {offset_key: key, string: offset.string, offset: offset.offset};
			}
		}
	}

	throw new Error(`Could not find key offset for "${pixel_string}"`);
}





