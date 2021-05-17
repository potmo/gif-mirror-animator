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

export {
  map,
}

async function map(settings, pixels, sequences, sequence_keys, reverse_color_map, image_size, frames) {

	const {width, height} = settings.output.disc_image;
	const output = getOutputImage(width, height, {r: 255, g: 255, b: 255, a: 0});
	const context = output.getContext("2d");
	const colors = sequence_keys.map(string => string.split('')
													 		.map( color => reverse_color_map[color])
													 		.map(color_convert.toARGBObject));



	const center_x = 0;
	const center_y = 0;
	const radius = 0.5;

	if (settings.print.section_angles) {
		console.log(`Section Angles`.yellow)
	}

	var slices = [];
	for (let circle = 0; circle < colors.length; circle++) {

		if (settings.print.section_angles) {
			console.log(`Section ${circle}`)
		}
		
		for (let section = 0; section < colors[circle].length; section++) {

			const color = colors[circle][section];
			const slice = getSlice(settings, circle, section, colors.length, colors[circle].length, radius, center_x, center_y);

			let color_int = color_convert.objToARGB(color);
			console.log(`  ${section} ${color_convert.toConsoleForeground(color_int, '█')}: ${(slice.start_angle * 180 / Math.PI).toFixed(2)}° to ${(slice.end_angle * 180 / Math.PI).toFixed(2)}°. ø ${(slice.inner_radius / radius).toFixed(2)} to ø ${(slice.outer_radius / radius).toFixed(2)}`.gray)

			const middle = getMiddleOfSlice(settings, circle, section, colors.length, colors[circle].length, radius, center_x, center_y);
			//drawSlice(context, slice, color);

			slices.push({color, slice});
			//drawCircle(context, middle, {r:0, g:255, b:0, a:255});
		}
	}

	for (var slice of slices) {
		drawSlice(settings, context, slice.slice, slice.color);
	}

	const discSvg = Array.from(drawSlicesSvg(settings, slices)).join('\n');


	const color_mapping = findColorMapping(pixels, sequences);

	if (settings.optimization.pick_any_cycle) {
		console.log('Picking random section for cycling sequences'.red);
	}

	const circle_positions = color_mapping.map( item => {
		const circle = sequence_keys.indexOf(item.offset_key);
		
		var section = colors[circle].length - item.offset;	
		
		// when there is a cycle in the colors we can randomize where to
		// start in that cycle
		var rand = 0;
		if (settings.optimization.pick_any_cycle) {
			let cycle = findShortestCycle(item.string);
			rand = cycle * Math.round(Math.random() * 20);
		}else {
			rand = 0;
		}
		section = (section + rand) % colors[circle].length;

		
		const color = colors[circle][section];
		return {circle, section, string: item.string, color};
	});

	let middle_positions = circle_positions.map( item => {
		return getMiddleOfSlice(settings, item.circle, item.section, colors.length, colors[item.circle].length, radius, center_x, center_y);
	});

	var mapping = pixels.map((pixel, i) => {
		const circle_pos = circle_positions[i];
		const aim_position = middle_positions[i];
		return {
			mirror: {
				x: pixel.x - 0.5,
				y: pixel.y - 0.5,
			},
			palette: {
				x: aim_position.x,
				y: aim_position.y,
			},
			circle: circle_pos.circle,
			section: circle_pos.section,
			string: circle_pos.string
		};
	})

	// simulate that the mirrors are off
	if (settings.output.simulation.max_deviation_from_optimal) {
		console.log(`Adding simulated mirror noise with ${settings.output.simulation.max_deviation_from_optimal}`.red)
		const max_deviation_from_optimal = settings.output.simulation.max_deviation_from_optimal;
		mapping = mapping.map((map,i) => {
			const aim_position = middle_positions[i];

			var noiseX = aim_position.x + Math.random() * max_deviation_from_optimal / 2 - max_deviation_from_optimal;
			var noiseY = aim_position.y + Math.random() * max_deviation_from_optimal / 2 - max_deviation_from_optimal;

			// make sure it doesn't drift off screen
			noiseX = Math.max(0, Math.min(width, noiseX));
			noiseY = Math.max(0, Math.min(height, noiseY));

			map.palette = {x: noiseX / width, y: noiseY / height};

			return map;
		})
	}

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

	if (settings.output.disc_image) {	
		await writeImage(path.join(settings.output.path,'disc.png'), output);
	}

	if (settings.output.disc_mappings) {
		await saveText(path.join(settings.output.path,'straight-disc-mappings.json'), JSON.stringify(mapping_conf, null, ' '), {encoding: 'utf8'});	
	}
	
	if (settings.output.simulation.gif) {
		await drawSimulation(settings, path.join(settings.output.path, 'simulation'), frames, output, mapping );	
	}

	if (settings.output.svg) {	
		await saveText(path.join(settings.output.path,'disc.svg'), discSvg, {encoding: 'utf8'});	
	}

	return mapping_conf;
}

function findShortestCycle(string) {
	for (var n = 1; n < string.length+1; n++) {
		var candidate = string.slice(0, n);
		var num_slices = string.length / n;
		if (num_slices != Math.floor(string.length / n)) {
			continue;
		}
		var slices = Array.from({length: num_slices}, (v,i) => i * n).map(i => string.slice(i, i+n))

		if (slices.filter(a => a == candidate).length == slices.length) {
			return n;
		}
	}
}

async function drawSimulation(settings, dir, frames, disc_image, mapping) {

	console.log(`draw simulation with frame scaling ${settings.output.simulation.frame_number_scaling}`.gray);
	const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
 
	await fs.remove(dir);
	await fs.mkdirs(dir);

	const simulation_size = settings.output.simulation.gif;
	const encoder = new GIFEncoder(simulation_size.width, simulation_size.height);

	encoder.createReadStream().pipe(fs.createWriteStream(path.join(dir, 'simulation.gif')));
	encoder.start();
	encoder.setRepeat(0);   // 0 for repeat, -1 for no-repeat
	encoder.setDelay(settings.output.simulation.gif.frame_delay);  // frame delay in ms
	encoder.setQuality(1); // image quality. 10 is default (1 is best.

	let total_frames = frames * settings.output.simulation.frame_number_scaling;
	bar1.start(total_frames-1, 0);
	for (var i = 0; i < total_frames; i++){
		let angular_offset = Math.PI * 2 / total_frames * i;

		let {image, disc} = drawSimulationFrame(settings, disc_image, mapping, angular_offset, simulation_size, encoder);
		bar1.update(i);
		
		if (settings.output.simulation.frames) {
			await fs.mkdirs(path.join(dir, 'frames'));
			await writeImageSilent(path.join(dir, 'frames', `${i}.png`), image); // saving each frame as a png	
		}
		
		if (settings.output.simulation.discs) {
			await fs.mkdirs(path.join(dir, 'discs'));
			await writeImageSilent(path.join(dir, 'discs', `${i}.png`), disc); // save each disc and the hitpoints
		}
	}


	encoder.finish();
	bar1.stop();

	if (settings.output.simulation.frames) {
		console.log(`saved simulation frames to ${path.join(dir, 'frames')}`.yellow);
	}

	if (settings.output.simulation.discs) {
		console.log(`saved simulation discs to ${path.join(dir, 'discs')}`.yellow);
	}

	if (settings.output.simulation.gif) {
		console.log(`saved simulation gif to ${dir}`.yellow);
	}

}

function drawSimulationFrame(settings, disc_image, mappings, angular_offset, simulation_size, gif_encoder) {

	

	const output_image = getOutputImage(simulation_size.width, simulation_size.height, {r: 100, g: 100, b: 100, a: 255});
	const output_disc = getOutputImage(disc_image.width, disc_image.height, {r: 100, g: 100, b: 100, a: 255});
	

	const context = output_image.getContext('2d');
	const disc_image_context = disc_image.getContext('2d')
	const output_disc_context = output_disc.getContext('2d');
	output_disc_context.drawImage(disc_image, 0, 0);

	let mirror_pivot = {x: simulation_size.width / 2, y: simulation_size.height / 2};

	for (let mapping of mappings) {

		var pivot = {x: 0.0, y: 0.0}
		// rotate
		var palette_angular_offset = angular_offset;// + -20 + Math.PI * 2 / 360 * Math.random() * 40;
		let rotated_palette_point = {
			x: Math.cos(palette_angular_offset) * (mapping.palette.x - pivot.x) - Math.sin(palette_angular_offset) * (mapping.palette.y - pivot.y) + pivot.x,
  		y: Math.sin(palette_angular_offset) * (mapping.palette.x - pivot.x) + Math.cos(palette_angular_offset) * (mapping.palette.y - pivot.y) + pivot.y,
		}

		var palette_point = {
			x: disc_image.width / 2 + rotated_palette_point.x * disc_image.width, 
			y: disc_image.height / 2 + rotated_palette_point.y * disc_image.height
		};


		var p = disc_image_context.getImageData(palette_point.x, palette_point.y, 1, 1).data; 

		let color = {r: p[0],  g: p[1], b: p[2], a: p[3]};

		let pos = {
			x: simulation_size.width / 2 + mapping.mirror.x * simulation_size.width,
			y: simulation_size.height / 2 + mapping.mirror.y * simulation_size.height,
		}

		
		let rotated_pos;

		if (settings.output.simulation.gif.rotate) {
			rotated_pos = {
				x: Math.cos(-angular_offset) * (pos.x - mirror_pivot.x) - Math.sin(-angular_offset) * (pos.y - mirror_pivot.y) + mirror_pivot.x,
	  		y: Math.sin(-angular_offset) * (pos.x - mirror_pivot.x) + Math.cos(-angular_offset) * (pos.y - mirror_pivot.y) + mirror_pivot.y,
			}
		} else {
			rotated_pos = pos;
		}

		drawCircle(context, rotated_pos, color)
		drawCircle(output_disc_context, palette_point, {r:0, g:255, b:0, a:0.5});
	}

	// draw point to see how the disc spins (can simplify a bit)
	let color = {r: 255,  g: 255, b: 255, a: 255};
	let pos = {x: simulation_size.width / 2, y: 50};
	let rotated_pos = {
		x: Math.cos(-angular_offset) * (pos.x - mirror_pivot.x) - Math.sin(-angular_offset) * (pos.y - mirror_pivot.y) + mirror_pivot.x,
		y: Math.sin(-angular_offset) * (pos.x - mirror_pivot.x) + Math.cos(-angular_offset) * (pos.y - mirror_pivot.y) + mirror_pivot.y,
	}
	drawCircle(context, rotated_pos, color)

	gif_encoder.addFrame(context);

	return {image: output_image, disc: output_disc};

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


function drawSlice(settings, context, slice, color) {
	context.fillStyle = `rgba(${color.r},${color.g},${color.b},${color.a})`;
	context.strokeStyle = `rgba(${color.r},${color.g},${color.b},${color.a})`;

	let points = Array.from(getSlicePoints(settings, slice));

  context.beginPath();
  context.moveTo(points[0].x, points[0].y);
  
  for (var i = 1; i < points.length; i++) {
  	context.lineTo(points[i].x, points[i].y);
  }

  context.closePath();
  context.stroke();
  context.fill();
}

function* drawSlicesSvg(settings, slices) {
	yield `<svg width="${settings.output.disc_image.width}" height="${settings.output.disc_image.height}">`;
	for (let slice of slices) {
		yield *drawSliceSvg(settings, slice.slice, slice.color);	
	}
	yield `</svg>`
}

function* drawSliceSvg(settings, slice, color) {
	
	let points = Array.from(getSlicePoints(settings, slice))
								.map(a => `${a.x.toFixed(4)}, ${a.y.toFixed(4)}`)
								.join(' ')
	yield `<polyline points="${points}" style="fill:rgb(${color.r}, ${color.g}, ${color.b});stroke:black;stroke-width:1" />`
	
}

function *getSlicePoints(settings, slice) {
	let {center_x, center_y, start_angle, end_angle, inner_radius, outer_radius} = slice;
	
	// scale to image sizes
	center_x = settings.output.disc_image.width / 2 + center_x * settings.output.disc_image.width;
	center_y = settings.output.disc_image.height / 2 + center_y * settings.output.disc_image.height;
	inner_radius = settings.output.disc_image.height * inner_radius;
	outer_radius = settings.output.disc_image.height * outer_radius;


	let intermediate_angle_steps = 100;
	yield {x: center_x + Math.cos(start_angle) * inner_radius, 
				 y: center_y + Math.sin(start_angle) * inner_radius};
	yield {x: center_x + Math.cos(start_angle) * outer_radius, 
		     y: center_y + Math.sin(start_angle) * outer_radius};

	let intermediate_angle_step = 1 / intermediate_angle_steps;
	for (var i = 0; i <= intermediate_angle_steps; i++) {
		let intermediate_angle = start_angle + (end_angle - start_angle) * intermediate_angle_step * i;
		yield {x: center_x + Math.cos(intermediate_angle) * outer_radius,
					 y: center_y + Math.sin(intermediate_angle) * outer_radius};
	}

	yield {x: center_x + Math.cos(end_angle) * inner_radius,
				 y: center_y + Math.sin(end_angle) * inner_radius};

	for (var i = 0; i <= intermediate_angle_steps; i++) {
		let intermediate_angle = start_angle + (end_angle - start_angle) * (1-intermediate_angle_step * i); 
		yield {x: center_x + Math.cos(intermediate_angle) * inner_radius, 
					 y: center_y + Math.sin(intermediate_angle) * inner_radius};
	}

}

function getMiddleOfSlice(settings, circle, section, num_circles, num_sections, radius, center_x, center_y) {
	const slice = getSlice(settings, circle, section, num_circles, num_sections, radius, center_x, center_y);
	const angle = slice.start_angle + (slice.end_angle - slice.start_angle) / 2;
	const distance = slice.inner_radius + (slice.outer_radius - slice.inner_radius) / 2;
	const x = center_x + Math.cos(angle) * distance;
	const y = center_y + Math.sin(angle) * distance;
	return {x,y};
}

function getSlice(settings, circle, section, num_circles, num_sections, radius, center_x, center_y) {

	const hole = settings.output.disc_image.hole_size / 2; // hole is diameter
	const helix_shift = Math.PI * 2 / num_sections * circle * settings.output.disc_image.helix_shift;
	const start_angle = Math.PI * 2 / num_sections * section + helix_shift;
	const end_angle = Math.PI * 2 / num_sections * (section + 1) + helix_shift;
	const inner_radius = hole + (radius - hole) / num_circles * (circle);
	const outer_radius = hole + (radius - hole) / num_circles * (circle + 1);
	return {center_x, center_y, start_angle, end_angle, inner_radius, outer_radius};
}

function drawCircle(context, position, color) {
	context.fillStyle = `rgba(${color.r},${color.g},${color.b},${color.a})`;
	context.strokeStyle = '#FF000000';

	context.beginPath();
	context.arc(position.x, position.y, 2, 0, Math.PI * 2, false);
	context.closePath();
	context.stroke();
	context.fill();
}



async function saveText(file, string) {
  await fs.writeFile(path.join(path.resolve(), file), string);
  console.log(`saved ${file}`.yellow);
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



