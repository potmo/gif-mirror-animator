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

import * as color_convert from  './color-convert.js';
import {writeImage, writeImageSilent, getOutputImage} from './image-loader.js';

const rnd = seedrandom('This is the seed');

export async function map(settings, pixels, image_size) {

  const palette = await image_loader.readImage(settings.input.fixed_palette.path);

  const width = palette.width;
  const height = palette.height;

  const output = getOutputImage(palette.width, palette.height, {r: 255, g: 255, b: 255, a: 0});
  const context = output.getContext("2d");
  context.font = '12px serif';

  var mapping = pixels.map((pixel, i) => {

    const color_key = pixel.pixel_colors[0]; // just use first

    const num_pos = settings.input.fixed_palette.aim_positions[color_key].positions.length;
    const rand_pos = Math.floor(num_pos * rnd());
    const aim_position = settings.input.fixed_palette.aim_positions[color_key].positions[rand_pos];
    const aim_color = color_convert.toARGBObject(settings.input.fixed_palette.aim_positions[color_key].color);

    context.fillStyle = `rgba(${aim_color.r}, ${aim_color.g}, ${aim_color.b}, 1.0})`;
    context.strokeStyle = `rgba(0,0,0,1.0})`;
    context.beginPath();
    context.arc(aim_position.x, aim_position.y, 20, 0, Math.PI*2)
    context.fill();
    context.stroke();

    context.fillStyle = `rgba(0,0,0, 1.0})`;
    context.fillText(color_key, aim_position.x + 30, aim_position.y);
    
    return {
      mirror: {
        x: pixel.x - 0.5, // offset to be between -0.5 and 0.5
        y: pixel.y - 0.5,
      },
      palette: {
        x: aim_position.x / width - 0.5, // offset to be between -0.5 and 0.5
        y: aim_position.y / height - 0.5, // offset to be between -0.5 and 0.5
        colors: [aim_color],
      },
      row: 0,
      column: 0,
      string: color_key
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
    await writeImage(path.join(settings.output.path,'texture.png'), palette);
    await writeImage(path.join(settings.output.path,'sampling-positions.png'), output);
  }


  return mapping_conf;

}