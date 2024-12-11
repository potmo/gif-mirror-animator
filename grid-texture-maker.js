'use strict';

import fs from 'fs-extra';
import path from 'path';
import colors from 'colors';
import {writeImage, writeImageSilent, getOutputImage} from './image-loader.js';
import * as color_convert from  './color-convert.js';

export async function createTexture(settings, color_map) {


  if (!Object.hasOwn(settings.output, 'palette')) {
    throw new Error('must have output.palette in settings');
  }

  if (settings.output.palette.rows * settings.output.palette.columns != Object.keys(color_map).length) {
    throw new Error('rows times columns must be the same as number of colors in color_map');
  }


  const output = getOutputImage(settings.output.palette.width, settings.output.palette.height, {r: 255, g: 255, b: 255, a: 0});
  const context = output.getContext("2d");
  const rows = settings.output.palette.rows;
  const columns = settings.output.palette.columns;
  const color_keys = Object.values(color_map);
  const colors = Object.keys(color_map);
  const column_width = settings.output.palette.width / settings.output.palette.columns;
  const row_height = settings.output.palette.height / settings.output.palette.rows;


  let aim_positions = {};

  for (let row = 0; row < rows; row++) {
    
    for (let column = 0; column < columns; column++) {

      const x = column * column_width;
      const y = row * row_height;
      const index = row * columns + column;

      const color = colors[index];
      const colorObj = color_convert.toARGBObject(color);
      const color_key = color_keys[index];

      aim_positions[color_key] = {
        color: color,
        positions: [{x: x + column_width / 2, y: y + row_height / 2}],
      };

      

      context.fillStyle = `rgba(${colorObj.r}, ${colorObj.g}, ${colorObj.b}, 1.0})`;
      context.strokeStyle = `rgba(${colorObj.r}, ${colorObj.g}, ${colorObj.b}, 1.0})`;
      context.beginPath();
      context.rect(x, y, column_width, row_height);
      context.fill();
      context.stroke();
    }
  }

  if (settings.output.palette.path) {  
    console.log('Printing palette'.green);
    const response = {
      path: path.join(settings.output.path, settings.output.palette.path, 'texture.png'),
      aim_positions: aim_positions,
    }
    await writeImage(response.path, output);
    return response;
  } else {
    throw new Error('no output path for palette');
  }

}
