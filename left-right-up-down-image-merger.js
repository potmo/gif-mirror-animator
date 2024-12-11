'use strict';

import Canvas from 'canvas';
const Image = Canvas.Image;
import fs from  'fs-extra';
import path from  'path';
import colors from  'colors';
import * as color_convert from  './color-convert.js';
import {writeImage, writeImageSilent, getOutputImage} from './image-loader.js';

export async function merge(images) {

  if (images.length !== 2) {
    throw new Error('There needs to two images');
  }


  let [left, right] = images.map(getPixels);

  const width = left.length;
  const height = left[0].length;
  
  
  let output = getOutputImage(width, height);
  let context = output.getContext('2d');

  const on = color_convert.objToARGB({a: 255, r: 0, g: 0, b: 0});
  const off = color_convert.objToARGB({a: 255, r: 255, g: 255, b: 255});

  // first we figure out the alphabet which is the tuple of up down pairs


  // left
  for (let x = 0; x < width; x++){
    for (let y = 0; y < height; y++){
      const left_color = left[x][y];
      const right_color = right[x][y];

      let color = getColor(left_color == off, right_color == off);
    
      context.fillStyle = color_convert.toCSS(color);
      context.fillRect(x,y, 1, 1);

    }
  }


  return output;
}

function getColors() {
  return [
    0x000000 | 0xFF000000,
    0xFF0000 | 0xFF000000,
    0xFFFFFF | 0xFF000000,
    0x00FF00 | 0xFF000000,
  ];
}

export function getLetters() {
  return [
      'B', 
      'R', 
      'W', 
      'G',
    ];
}

function getLetterFromColor(color) {
  let index = getColors().indexOf(color);
  if (index < 0) {
    throw new Error(`color does not exist ${color}`);
  }

  const letters = getLetters();

  return letters[index];

}

export async function getTransitionPairs(image1, image2) {
  const colors = getColors();

  const image_1_pixels = getPixels(image1);
  const image_2_pixels = getPixels(image2);

  const width = image_1_pixels.length;
  const height = image_1_pixels[0].length;

  let output = {};

  // left
  for (let x = 0; x < width; x++){
    for (let y = 0; y < height; y++){
      const color1 = image_1_pixels[x][y];
      const color2 = image_2_pixels[x][y];

      const letter1 = getLetterFromColor(color1);
      const letter2 = getLetterFromColor(color2);
    
      const transition = `${letter1}${letter2}`
      output[transition] = (output[transition] ?? 0) + 1;

    }
  }
  

  return output;

}

function getColor(up_on, down_on) {
  const pair = up_on | (down_on << 1);
  let colors = getColors()

  switch (pair) {  
    case 0b00:
      return colors[0];
    case 0b01:
      return colors[1];
    case 0b11:
      return colors[2];
    case 0b10:
      return colors[3];
  }
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