"use strict";

import fs from 'fs-extra';
import path from 'path';
import colors from 'colors';
import * as color_convert from './color-convert.js';
import * as image_loader from './image-loader.js';
import vector from './vector.js';
import {stipple} from './stipple.js';


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

  return {pixels, image_size: {width, height}};
}

export function circle(settings, mirrors) {
  const width = 100;
  const height = 100;

  const pixels = Array
    .from({length: mirrors})
    .map( (_, i, a) => (i / a.length) * Math.PI * 2)
    .map( angle => {
      return {
        x: width / 2 + Math.cos(angle) * width / 2,
        y: height / 2 + Math.sin(angle) * height / 2,
        color: {r:0, g: 0, b: 0, a: 255},
      }
    });

 
  return {pixels, image_size: {width, height}}; 
}


export function spiral(settings, mirrors, turns) {
  const width = 100;
  const height = 100;

  const pixels = Array
    .from({length: mirrors})
    .map( (_, i, a) => {
      return {
        angle: (i / a.length) * Math.PI * 2 * turns,
        t: i / a.length,
      }
    })
    .map( state => {
      return {
        x: width / 2 + Math.cos(state.angle) * width / 2 * state.t,
        y: height / 2 + Math.sin(state.angle) * height / 2 * state.t,
        color: {r:0, g: 0, b: 0, a: 255},
      }
    });

 
  return {pixels, image_size: {width, height}}; 
}


export function equidistantSpiral(settings) {

  var config = settings.input.arrangement.equidistant_spiral;

  const width = config.width;
  const height = config.height;

  let centerX = width/2;
  let centerY = height/2;
  let radius = width / 2 - 4;
  let coils = config.coils;

  var thetaMax = coils * 2 * Math.PI;
  var awayStep = radius / thetaMax;
  var chord = config.chord;

  var pixels = [];

  for (var theta = chord / awayStep; theta <= thetaMax; ) {
      var away = awayStep * theta;
      theta += chord / away;

      pixels.push({
        x: centerX + Math.cos ( theta ) * away, 
        y: centerY + Math.sin ( theta ) * away,
        color: {r:0, g: 0, b: 0, a: 255},
      });
  }
  
  return {pixels, image_size: {width, height}}; 

}

export async function stippling(settings) {
  let image = await image_loader.readImage(settings.input.arrangement.stippling.path);
  await image_loader.writeImage(path.join(settings.output.path, 'arrangement.png'), image);

  const input_context = image.getContext('2d');
  const input_data = input_context.getImageData(0, 0, image.width, image.height);

  let image_size = Math.max(image.width, image.height);

  const point_count = settings.input.arrangement.stippling.points;
  const iterations = [settings.input.arrangement.stippling.iterations];

  let stipled_points = stipple(input_data.data, image.width, image.height, point_count, iterations, settings.input.arrangement.stippling.invert)
    .points
    .reduce( (list, current, index) => {
      if (index % 2 == 0) {
        return list.concat([{x: current, y: null}]);
      }

      list[list.length-1].y = current;
      return list;
    }, []);

  
  const size = settings.input.arrangement.stippling.imaginary_size;

  let scaled_stipled_points = stipled_points.map(point => {
    return {
      x: point.x / image_size * size, 
      y: point.y / image_size * size,
      color: {r:255, g:255, b: 255, a: 255},
    }
  });

  return {
    pixels: scaled_stipled_points, 
      image_size: {
        width: size, 
        height: size
      }
    };
}

export function concentricCircles(settings) {
  const width = 100;
  const height = 100;
  let centerX = width/2;
  let centerY = height/2;

  let radius = width / 2 - 4;
  var chord = 2;
  var circles = Math.round(radius / chord);
  
  var pixels = [];

  for (var circle = 0; circle < circles; circle++) {
    var r = circle * radius / circles;
    var circomference = r * 2 * Math.PI;
    var mirrors_in_circle = Math.floor(circomference / chord);

    for (var i = 0; i < mirrors_in_circle; i++) {
      var angle = Math.PI * 2 / mirrors_in_circle * i;

      pixels.push({
        x: centerX + Math.cos( angle ) * r, 
        y: centerY + Math.sin( angle ) * r,
        color: {r:0, g: 0, b: 0, a: 255},
      });
    }
  }

  return {pixels, image_size: {width, height}}; 

}


