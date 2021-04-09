"use strict";

import fs from 'fs-extra';
import path from 'path';
import colors from 'colors';
import * as color_convert from './color-convert.js';
import {writeImage, getOutputImage} from './image-loader.js';


export function convert(settings, image) {

  const width = image.width;
  const height = image.height;
  const input_context = image.getContext('2d');
  const input_data = input_context.getImageData(0, 0, width, height);
  let colors = color_convert.imageDataToARGBObjectArray(input_data.data);

  let pixels = colors.map( (color, i) => {
    let x = i % width;
    let y = Math.floor(i / width);
    return {color, x, y};
  })
  .filter(pixel => {
    return pixel.color.r == 255 && pixel.color.g == 255 && pixel.color.b == 255;
  })

  console.log(`Number of pixels in arrrangement: ${pixels.length}`.blue)

  return {pixels, image_size: {width, height}};
}
