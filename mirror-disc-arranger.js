"use strict";

import fs from 'fs-extra';
import path from 'path';
import colors from 'colors';
import * as Hex from './hex.js';
import * as color_convert from './color-convert.js';
import {writeImage, getOutputImage} from './image-loader.js';
import * as square_arranger from './mirror-square-arranger.js'

export {
  arrange,
}

async function arrange(settings, images, color_map, image_size) {


  let {frames, pixels} = await square_arranger.arrange(settings, images, color_map, image_size);

  let pixels_on_disc = pixels.map( p => {
    return p.filter( pixel => {
      return Math.pow(pixel.x - 0.5, 2) + Math.pow(pixel.y - 0.5, 2) < Math.pow(0.33, 2)
    });
  });

  return {frames, pixels: pixels_on_disc};
}