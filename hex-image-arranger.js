"use strict";

import fs from 'fs-extra';
import path from 'path';
import colors from 'colors';
import * as Hex from './hex.js';
import * as color_convert from './color-convert.js';
import {writeImage, getOutputImage} from './image-loader.js';

export {
  arrange,
}

async function arrange(settings, images, color_map, image_size) {


  const max_image_size = Math.max(image_size.width, image_size.height);
  const size = 0.52;

  const max_hex_pos = {
    x: size * Math.sqrt(3) * (image_size.width + 0.5 * (image_size.height & 1)),
    y: size * 3/2 * image_size.height,
  }

  let centering_padding = {
    x: (1.0 - max_hex_pos.x / max_image_size) / 2,
    y: (1.0 - max_hex_pos.y / max_image_size) / 2,
  }

  const image_datas = images.map(image => {
    const data = image.getContext('2d').getImageData(0, 0, image.width, image.height).data; 
    return {image, data}
  });

  var output = [];

  for (let x = 0; x < image_size.width; x++) {
    for (let y = 0; y < image_size.height; y++) {

      let colors = image_datas.map( image_data => {
        let index = (x + y * image_data.image.width) * 4;
        let rgb_obj = {
          r: image_data.data[index+0],
          g: image_data.data[index+1],
          b: image_data.data[index+2],
          a: image_data.data[index+3]
        };

        let argb = color_convert.objToARGB(rgb_obj);

        let color_key = color_map[argb];
        return color_key;
      });

      const hex_pos = {
        x: size * Math.sqrt(3) * (x + 0.5 * (y & 1)),
        y: size * 3/2 * y,
      }

      const scaled_hex_pos = {
        x: hex_pos.x / max_image_size,
        y: hex_pos.y / max_image_size,
      };

      const scaled_hex_pos_with_padding = {
        x: scaled_hex_pos.x + centering_padding.x,
        y: scaled_hex_pos.y + centering_padding.y,
      }

      output.push({
        x: scaled_hex_pos_with_padding.x,
        y: scaled_hex_pos_with_padding.y, 
        pixel_colors: colors,
      })

    }
  }

  return output;

}