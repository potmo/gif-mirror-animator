"use strict";

import fs from 'fs-extra';
import path from 'path';
import colors from 'colors';
import * as Hex from './hex.js';
import * as color_convert from './color-convert.js';
import {writeImage, getOutputImage} from './image-loader.js';

export {
  arrange,
  arrangeInSquarePattern
}

async function arrangeInSquarePattern(settings, images, color_map, image_size) {
  let pixels = [];
  for (let y = 0; y < image_size.height; y++) {
    for (let x = 0; x < image_size.width; x++) {
      const pos = {
        x: x / image_size.width,
        y: y / image_size.height,
      }
      pixels.push(pos);
    }
  }


  // duplicate arrangement for each frame since they are all the same
  let image_pixels = Array.from({length: images.length}).map( _=> pixels);

  return {frames: images.length, pixels: image_pixels}; 
}

async function arrange(settings, images, color_map, image_size) {
  let pixels = [];
  let x = 0;
  let y = 0;
  let scaled_hex_pos;

  const max_image_size = Math.max(image_size.width, image_size.height);

  // this is the space, in normal units, that is required to make the result square
  // ie to push the image to the center
  let centering_padding = {
    x: (1.0 - image_size.width / max_image_size) / 2,
    y: (1.0 - image_size.height / max_image_size) / 2,
  }


  outer: while(true) {
    inner: while(true) {

      // convert to hex coordinates so that every other is offset
      const size = 0.52;
      const hex_pos = {
        x: size * Math.sqrt(3) * (x + 0.5 * (y & 1)),
        y: size * 3/2 * y,
      }

      const centered_hex_pos = {
        x: centering_padding.x / max_image_size,
        y: centering_padding.y / max_image_size,
      }

      scaled_hex_pos = {
        x: hex_pos.x / max_image_size,
        y: hex_pos.y / max_image_size,
      };

      if (scaled_hex_pos.x > image_size.width / max_image_size) {
        x = 0;
        y++;
        break inner;
      } else if (scaled_hex_pos.y > image_size.height / max_image_size) {
         break outer;
      }

      let scaled_hex_pos_with_padding = {
        x: scaled_hex_pos.x + centering_padding.x,
        y: scaled_hex_pos.y + centering_padding.y,
      }
      
      pixels.push(scaled_hex_pos_with_padding);
      x++;

    }   
  }

  // duplicate arrangement for each frame since they are all the same
  let image_pixels = Array.from({length: images.length}).map( _=> pixels);

  return {frames: images.length, pixels: image_pixels};
}