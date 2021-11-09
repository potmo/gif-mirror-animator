'use strict';

import Canvas from 'canvas';
const Image = Canvas.Image;
import fs from  'fs-extra';
import path from  'path';
import colors from  'colors';
import * as color_convert from  './color-convert.js';
import {writeImage, writeImageSilent, getOutputImage} from './image-loader.js';

export async function merge(images) {

  if (images.length !== 5) {
    throw new Error('There needs to be five input images. Neutral, up/down left/right');
  }


  let [neutral, up, down, left, right] = images.map(getPixels);
  
  
  let output = getOutputImage(neutral.length, neutral[0].length);
  let context = output.getContext('2d');

  const {always_on, always_off, up_on, down_on, left_on, right_on} = getColors();

  // neutral
  for (let x = 0; x < neutral.length; x++){
    for (let y = 0; y < neutral[x].length; y++){
      const argb = neutral[x][y];
      let color;

      switch(argb) {
        case always_on:
          color = always_on;
          break;
        case always_off:
          color = always_off;
          break;
        default:
          color = 0x00000000;
          break;
      }
      context.fillStyle = color_convert.toCSS(color);
      context.fillRect(x,y, 1, 1);
    }
  }

  // up down
  for (let x = 0; x < neutral.length; x++){
    for (let y = 0; y < neutral[x].length; y++){
      const argb_up = up[x][y];
      const argb_down = down[x][y];
      let color;

      if (argb_up == always_on && argb_down == always_on) {
        color = always_on;
      }
      else if (argb_up == always_on && argb_down == always_off) {
        color = up_on;
      }
      else if (argb_up == always_off && argb_down == always_off) {
        color = always_off;
      }
      else if (argb_up == always_off && argb_down == always_on) {
        color = down_on;
      }
      else {
        continue;
      }
     
      context.fillStyle = color_convert.toCSS(color);
      context.fillRect(x,y, 1, 1);
    }
  }

   // up down
  for (let x = 0; x < neutral.length; x++){
    for (let y = 0; y < neutral[x].length; y++){
      const argb_left = left[x][y];
      const argb_right = right[x][y];
      let color;

      if (argb_left == always_on && argb_right == always_on) {
        color = always_on;
      }
      else if (argb_left == always_on && argb_right == always_off) {
        color = left_on;
      }
      else if (argb_left == always_off && argb_right == always_off) {
        color = always_off;
      }
      else if (argb_left == always_off && argb_right == always_on) {
        color = right_on;
      }
      else {
        continue;
      }
     
      context.fillStyle = color_convert.toCSS(color);
      context.fillRect(x,y, 1, 1);
    }
  }


  return output;
}



export function getColors() {

  const always_on = 0x000000 | 0xFF000000;
  const always_off =  0xFFFFFF | 0xFF000000;
  const up_on = 0xFF0000 | 0xFF000000;
  const down_on =  0x0000FF | 0xFF000000;
  const left_on = 0x00FF00 | 0xFF000000;
  const right_on = 0xFF00FF | 0xFF000000;

  return {always_on, always_off, up_on, down_on, left_on, right_on};
}

function getPixels(image) {
  const width = image.width;
  const height = image.height;
  const context = image.getContext('2d');
  const image_data = context.getImageData(0, 0, width, height);
  const data = color_convert.imageDataToARGBObjectArray(image_data.data);

  const default_color = 0x00000000;

  let pixels = Array.from({length: width}).map(_ => Array.from({length: height}).fill(default_color));
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {

      const i = y * width + x;
      const color = data[i]
      const argb = color_convert.objToARGB(color);
  
      pixels[x][y] = argb;
    }
  }

  return pixels;

}