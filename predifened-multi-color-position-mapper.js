'use strict';

import Canvas from 'canvas';
const Image = Canvas.Image;
import fs from  'fs-extra';
import path from  'path';
import colors from  'colors';
import GIFEncoder from  'gifencoder';
import cliProgress from  'cli-progress';
import seedrandom  from 'seedrandom';
import * as image_loader from './image-loader.js';
import * as three_dee_generator from './3d-generator.js';

import * as color_convert from  './color-convert.js';
import {writeImage, writeImageSilent, getOutputImage, writeText} from './image-loader.js';

const rnd = seedrandom('This is the seed');

export async function map(settings, wall_generator, pixels, image_size) {

  const palette_size = settings.input.fixed_palette.size;
  await printPalette(settings);


  const world_objects = three_dee_generator.getWorld3DObjects(settings, wall_generator);


  var mapping = pixels.map((pixel, i) => {

    const color_key = pixel.pixel_colors;
    const aim_colors = settings.input.fixed_palette.aim_positions[color_key].colors.map(color => color_convert.toARGBObject(color));
   
    const scaled_pixel_position = {
      x: pixel.x - 0.5, // offset to be between -0.5 and 0.5
      y: pixel.y - 0.5,
    };

    const scaled_aim_position = findBestAimPosition(settings, world_objects, palette_size, scaled_pixel_position, color_key)
    
    return {
      mirror: scaled_pixel_position,
      palette: {
        x: scaled_aim_position.x, // offset to be between -0.5 and 0.5
        y: scaled_aim_position.y, // offset to be between -0.5 and 0.5
        colors: aim_colors,
      },
      row: 0,
      column: 0,
      string: color_key,
    };
  })

  const mapping_conf = {
    mirror: {
      width: image_size.width,
      height: image_size.height,
    },
    palette: {
      width: palette_size.width,
      height: palette_size.height,
    },
    mapping,
  }


  return mapping_conf;

}


async function createPalette() {

}


function findBestAimPosition(settings, world_objects, palette_size, scaled_pixel_position, color_key) {


  let best_index = 0; 
  let best_angle_difference = Number.MAX_VALUE;
  let best_aim_position = null;
  let best_scaled_aim_position = null;

  // TODO: Might not be the best to just do this
  //if (color_convert.toARGBObject(settings.input.fixed_palette.aim_positions[color_key].colors[0]).a === 0) {
  //  return scaled_pixel_position;
  //}


  for (let index = 0; index < settings.input.fixed_palette.aim_positions[color_key].positions.length; index++) {

    const aim_position = settings.input.fixed_palette.aim_positions[color_key].positions[index];
    const scaled_aim_position = {
      x: aim_position.x / palette_size.width - 0.5, // offset to be between -0.5 and 0.5
      y: aim_position.y / palette_size.height - 0.5, // offset to be between -0.5 and 0.5
    }

    const three_dee = three_dee_generator.convertTo3DWorldCoordinates(settings, 
                                                                      world_objects, 
                                                                      scaled_pixel_position, 
                                                                      scaled_aim_position, 
                                                                      colors, 
                                                                      color_key);
    const mirror = three_dee_generator.createMirrorLookingAt(0, 
                                                             three_dee.mirror.pos, 
                                                             world_objects.eye.pos, 
                                                             three_dee.target.pos, 
                                                             three_dee.mirror.width.mag(), 
                                                             three_dee.mirror.thickness.mag());

    //const angle_difference = mirror.normal.dot(world_objects.mirror_board.normal);
    const angle_difference = world_objects.mirror_board.normal.angleTo(mirror.normal)

    if (angle_difference <= best_angle_difference) {
      best_angle_difference = angle_difference;
      best_aim_position = aim_position;
      best_scaled_aim_position = scaled_aim_position;
    }
  }

  return best_scaled_aim_position;

}

async function printPalette(settings) {

  const palette_size = settings.input.fixed_palette.size;
  const circle_diameter = settings.input.fixed_palette.circle_diameter;
  const output = getOutputImage(palette_size.width, palette_size.height, {r: 255, g: 255, b: 255, a: 0});
  const context = output.getContext("2d");
  context.font = '12px serif';

  let svg =  `<svg width="${settings.input.fixed_palette.size.width}" height="${settings.input.fixed_palette.size.height}" xmlns="http://www.w3.org/2000/svg" version="1.1">`;

   svg += `<rect x="0" y="0" width="${settings.input.fixed_palette.size.width}" height="${settings.input.fixed_palette.size.height}" stroke="red" fill-opacity="0.0" stroke-opacity="1.0"/>`;

  for (const color_key of Object.keys(settings.input.fixed_palette.aim_positions)) {

    const colors = settings.input.fixed_palette.aim_positions[color_key].colors.map(color => color_convert.toARGBObject(color));
    for (const aim_position of settings.input.fixed_palette.aim_positions[color_key].positions) {

      const pie_size = Math.PI * 2 / colors.length;
      const start_rotation = Math.PI / 2;
      for (let i = 0; i < colors.length; i++) {

        const aim_color = colors[i];
        const start_angle = start_rotation + pie_size * i;
        const end_angle = start_rotation + pie_size * (i + 1);

        context.fillStyle = color_convert.ARGBObjectToCSS(aim_color);
        context.strokeStyle = color_convert.toCSS(0xAA000000);
        context.beginPath();
        context.arc(aim_position.x, aim_position.y, circle_diameter / 2, start_angle, end_angle)
        context.fill();
        context.stroke();

        svg +=  `<circle cx="${aim_position.x}" cy="${aim_position.y}" r="${settings.input.fixed_palette.circle_diameter/2}" fill-opacity="0.0" stroke="black"/>`;

        //context.fillStyle = `rgba(0,0,0, 1.0})`;
        //context.fillText(color_key, aim_position.x + 30, aim_position.y);
      }

    }
  }

  svg += `</svg>`

  if (settings.output.texture) {  
    await writeImage(path.join(settings.output.path,'texture.png'), output);
  }

  if (settings.output.svg) {  
    await writeText(path.join(settings.output.path,'texture.svg'), svg, {encoding: 'utf8'});  
  }
}