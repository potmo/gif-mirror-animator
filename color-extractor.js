"use strict";

import colors from 'colors';
import * as color_convert from './color-convert.js';

export function extractColorMap(images) {

  var colors = [];
  for (var image of images) {
    let context = image.getContext('2d');
    var p = context.getImageData(0, 0, image.width, image.height).data; 
    for (i = 0; i < p.length; i += 4) {
      let color = color_convert.objToARGB({r: p[i+0],  g: p[i+1], b: p[i+2], a: p[i+3]}); 
      if (!colors.includes(color)) {
          colors.push(color);
      }
    }

  }

  var color_map = {};
  var color_names = "ABCDEFGHIJKLMNOPQRSTUVWXYZÅÄÖ1234567890".split('');

  if (color_names.length < colors.length) {
    throw new Error('Too frew color names for all the colors');
  }
  for (var i = 0; i < colors.length; i++) {
    color_map[colors[i]] = color_names[i];
  }

  return color_map;
}

export function extractColorMapPairs(images) {

  const color_map = extractColorMap(images);

  

  let image_colors = images.map(image => {
    let context = image.getContext('2d');
    var p = context.getImageData(0, 0, image.width, image.height).data; 
    let pixels = [];
    for (let i = 0; i < p.length; i += 4) {
      let color = color_convert.objToARGB({r: p[i+0],  g: p[i+1], b: p[i+2], a: p[i+3]}); 
      let color_key = color_map[color];
      pixels.push(color_key);
    }
    return pixels;
  }); 


  let pairs = [];
  for (let i = 0; i < image_colors[0].length; i++) {
    let pair = image_colors.map( color_array => color_array[i] ).join('');
    pairs.push(pair);
  }



  return {
    pairs,
    color_map,
  };

}