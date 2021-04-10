'use strict';

import Canvas from 'canvas';
const Image = Canvas.Image;
import fs from  'fs-extra';
import path from  'path';
import colors from  'colors';
import cliProgress from  'cli-progress';
import vector from './vector.js';
import * as color_convert from  './color-convert.js';
import * as image_loader from './image-loader.js';


export {
  visualize,
}

async function visualize(settings, reflections, wall) {

  const size = settings.output.simulation.size;

  const ellipses = reflections
    .map(a => a.ellipse_points)
    .map( stipled_points => {
      const scaled_points = stipled_points
      .map( v => {
        // move to origo
        return v.sub(wall.center)  
      })
      .map( v => {
        return {x : wall.widthVector.normalized().dot(v) / wall.widthVector.mag(), y: wall.heightVector.normalized().dot(v) / wall.heightVector.mag()};
      })
      .map(p => {
        return {x: size.width / 2 + p.x * size.width , y: size.height - (size.height / 2 + p.y * size.height)}
      });
      return scaled_points;
    });


  
  let output = await image_loader.getOutputImage(size.width, size.height, {r:0, g:0, b: 0, a: 255});

  const context = output.getContext("2d");

  const color = {r: 255, g: 255, b:255, a: 255};
  context.fillStyle = `rgba(${color.r},${color.g},${color.b},${color.a})`;
  context.strokeStyle = `rgba(${color.r},${color.g},${color.b},${color.a})`;

  ellipses.forEach(points => {
    drawDot(context, points);                 
  });
  

  await image_loader.writeImage(path.join(settings.output.path, 'simulation', 'simulated_reflection.png'), output);
}

function drawDot(context, points) {
  
  //console.log('drawing', points)

  context.beginPath();
  context.moveTo(points[0].x, points[0].y);
  
  for (var i = 1; i < points.length; i++) {
    context.lineTo(points[i].x, points[i].y);
  }

  context.closePath();
  context.stroke();
  context.fill();
}