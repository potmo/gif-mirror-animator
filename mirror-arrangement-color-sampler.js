"use strict";

import fs from 'fs-extra';
import path from 'path';
import colors from 'colors';
import * as Hex from './hex.js';
import * as color_convert from './color-convert.js';
import {writeImage, getOutputImage} from './image-loader.js';

export {
  sample,
}

async function sample(settings, pixels, color_map, images, image_size) {

  const colors = Object.values(color_map);

  const image_datas = images.map(image => {
    const data = image.getContext('2d').getImageData(0, 0, image.width, image.height).data; 
    return {image, data}
  });

  const max_image_size = Math.max(image_size.width, image_size.height);

  // this is the space in pixels that is required to make the result square
  // ie to push the image to the center
  let centering_padding = {
    x: max_image_size * (1.0 - image_size.width / max_image_size) / 2,
    y: max_image_size * (1.0 - image_size.height / max_image_size) / 2,
  }


  return pixels[0].map( pixel => {

    // scale to be in image coordinates and clamp within image
    // note that the mirror arrangement is centered on top of the sampled image
    let image_pos = {
      x: Math.round(Math.min(Math.max(pixel.x * max_image_size - centering_padding.x, 0), image_size.width-1)),
      y: Math.round(Math.min(Math.max(pixel.y * max_image_size - centering_padding.y, 0), image_size.height-1)),
    }

    let pixel_colors = image_datas.map(image_data => {
      let index = (image_pos.x + image_pos.y * image_data.image.width) * 4;
      let rgb_obj = {
        r: image_data.data[index+0],
        g: image_data.data[index+1],
        b: image_data.data[index+2],
        a: image_data.data[index+3]
      };
      let argb = color_convert.objToARGB(rgb_obj);

      if (rgb_obj.r === undefined || rgb_obj.g === undefined || rgb_obj.b === undefined || rgb_obj.a === undefined){
        throw new Error(`Could not sample color at index ${index}, ${image_pos.x}, ${image_pos.y}. ${pixel.x}, ${pixel.y}`);
      } 

      return color_map[argb];
    });

    return {
      x: pixel.x,
      y: pixel.y, 
      pixel_colors
    };

  })

  return pixels;
}