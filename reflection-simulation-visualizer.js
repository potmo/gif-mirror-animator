'use strict';

import Canvas from 'canvas';
const Image = Canvas.Image;
import fs from  'fs-extra';
import path from  'path';
import colors from  'colors';
import vector from './vector.js';
import * as color_convert from  './color-convert.js';
import * as image_loader from './image-loader.js';


export {
  visualize,
  visualizeArrangement,
}

async function visualize(settings, reflections, wall) {

  const size = settings.output.simulation.ellipse_image_size;

  const ellipses = reflections
    .map(a => a.ellipse_points)
    .map( reflection_points => {
      const scaled_points = reflection_points
        .map( p => {
          return wall.textureCoordAtWorldPos(p);
        })
        .map(p => {
          return {x: size.width / 2 + p.x * size.width , y: size.height - (size.height / 2 + p.y * size.height)}
        });
      return scaled_points;
    });


  
  let output = await image_loader.getOutputImage(size.width, size.height, {r:0, g:0, b: 0, a: 255});

  const context = output.getContext("2d");

  context.fillStyle = `rgba(255,255,255,1.0)`;
  context.strokeStyle = `rgba(255,255,255,0.5)`;

  ellipses.forEach(points => {
    drawDot(context, points);                 
  });
  

  await image_loader.writeImage(path.join(settings.output.path, 'simulation', 'simulated_reflection.png'), output);
}

async function visualizeArrangement(settings, reflections, mirror_board) {
  const size = settings.output.simulation.mirror_image_size;
  const padding = {vertical: 150, horizontal: 150}
 
   const ellipses = reflections
    .map(a => a.mirror)
    .map(mirror => {
      const edges = 50;
      const right = vector().globalUp.cross(mirror.normal).normalized().scale(mirror.width/2);
      const down = right.cross(mirror.normal).normalized().scale(mirror.height/2);

      const vertices = enumerate(0, edges - 1)
        .map(i => Math.PI * 2 / edges * i - Math.PI / 2)
        .map(a => ({x: Math.cos(a) * 1, y: Math.sin(a) * 1}))
        .map(local_pos => mirror.pos.add(right.scale(local_pos.x)).add(down.scale(local_pos.y)))

      return vertices;
    })
    .map( points => {
      const scaled_points = points
      .map( v => {
        // move to origo
        return v.sub(mirror_board.center)  
      })
      .map( v => {
        return {
          x : mirror_board.widthVector.normalized().dot(v) / mirror_board.widthVector.mag(), 
          y: mirror_board.heightVector.normalized().dot(v) / mirror_board.heightVector.mag()
        };
      })
      .map(p => {
        return {
          x: padding.horizontal + size.width / 2 + p.x * size.width , 
          y: padding.vertical + size.height - (size.height / 2 + p.y * size.height)
        }
      });
      return scaled_points;
    });


  let frames = reflections[0].colors.length;
  let outputs = [];

  for (let i = 0; i < frames; i++) {
    let output = await image_loader.getOutputImage(size.width + padding.horizontal * 2, size.height + padding.vertical * 2, {r:255, g:255, b: 255, a: 0});  
    outputs.push(output);
  }
  
  for (var frame = 0; frame < frames; frame++) {
    const context = outputs[frame].getContext("2d");

    for (let i = 0; i < ellipses.length; i++) {
      let points = ellipses[i];
      let color = reflections[i].colors[frame];
      context.fillStyle = `rgba(${color.r},${color.g},${color.b},1)`;
      context.strokeStyle = `rgba(0,0,0,0.6)`;
      drawDot(context, points);
    }

    context.strokeStyle = `rgba(255,0,0, 0.5)`;
    drawSquare(context, padding.horizontal, padding.vertical, size.width, size.height)
  }

  
  
  for(let frame = 0; frame < frames; frame++) {
    await image_loader.writeImage(path.join(settings.output.path, 'simulation', `simulated_mirrors_${frame}.png`), outputs[frame]);  
  }
  
}

function drawSquare(context, x, y, width,height) {
  context.beginPath();
  context.moveTo(x, y);
  context.lineTo(x + width, y);
  context.lineTo(x + width, y + height);
  context.lineTo(x, y + height);
  context.lineTo(x, y);
  context.closePath();
  context.stroke();
  
}

function drawDot(context, points) {
  context.beginPath();
  context.moveTo(points[0].x, points[0].y);
  
  for (var i = 1; i < points.length; i++) {
    context.lineTo(points[i].x, points[i].y);
  }

  context.closePath();
  context.stroke();
  context.fill();
}

function enumerate(from, to) {
  return Array(Math.abs(Math.max(to) - Math.min(from)) + 1)
        .fill()
        .map( (_, i , a) => from + (to - from) * (i / (a.length - 1)))
}