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
  visualizeMirrorColorGroups,
  visualizeMirrorAngleDeviations,
  visualizeMirrorColorGroupsCenterAndOptimal,
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
  const ellipses = getMirrorEllipses(settings, reflections, mirror_board)


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

async function visualizeMirrorColorGroups(settings, reflections, mirror_board) {
  const size = settings.output.simulation.mirror_image_size;
  const padding = {vertical: 150, horizontal: 150}
  const ellipses = getMirrorEllipses(settings, reflections, mirror_board)

  const unique_color_sequences = reflections.map(reflection => reflection.color_keys)
                                            .filter((value, index, self) => self.indexOf(value) === index)

  
  let outputs = {};
  let mean_positions = {};
  let mirrors_per_color = {};

  for (let i = 0; i < unique_color_sequences.length; i++) {
    const key = unique_color_sequences[i];
    let output = await image_loader.getOutputImage(size.width + padding.horizontal * 2, size.height + padding.vertical * 2, {r:255, g:255, b: 255, a: 0});  
    outputs[key] = output;
    const context = output.getContext("2d");
    context.strokeStyle = `rgba(255,0,0, 0.5)`;
    drawSquare(context, padding.horizontal, padding.vertical, size.width, size.height)

    mean_positions[key] = {x:0, y:0};
    mirrors_per_color[key] = 0;
  }


  for (let i = 0; i < ellipses.length; i++) {
    const color_key = reflections[i].color_keys;
    const context = outputs[color_key].getContext("2d");
    let points = ellipses[i];
    context.fillStyle = `rgba(${255},${0},${0},1)`;
    context.strokeStyle = `rgba(0,0,0,0.6)`;
    drawDot(context, points);

    for (let j = 0; j < reflections[i].colors.length; j++) {
      const color = reflections[i].colors[j];
      context.strokeStyle = `rgba(0,0,0,0.0)`;
      context.fillStyle = `rgba(${color.r},${color.g},${color.b},1)`;
      drawSquareFilled(context, 0 + 20 * j, 0, 20, 20);
    }

    mirrors_per_color[color_key]++;
  }

  // calculate means
  for (let i = 0; i < reflections.length; i++){
    let pos = reflections[i].mirror.pos
    let scaled_pos = scaleFromVectorSpaceToPrintSpace(pos, mirror_board, padding, size);

    const color_key = reflections[i].color_keys;
    mean_positions[color_key].x += scaled_pos.x / mirrors_per_color[color_key];
    mean_positions[color_key].y += scaled_pos.y / mirrors_per_color[color_key];
  }

  // draw the mean
  for(let color_key of Object.keys(outputs)) {
    const context = outputs[color_key].getContext("2d");
    
    const pos = mean_positions[color_key];
    context.strokeStyle = `rgba(${0},${0},${255},1)`;
    drawCross(context, pos.x, pos.y, 20, 20);
  }
  

  for(let key of Object.keys(outputs)) {
    const output = outputs[key];
    await image_loader.writeImage(path.join(settings.output.path, settings.output.heatmaps.path, `heatmap_${key}.png`), output);  
  }

}

async function visualizeMirrorAngleDeviations(settings, reflections, mirror_board) {
  
  const size = settings.output.simulation.mirror_image_size;
  const padding = {vertical: 150, horizontal: 150}
  const outputs = {};


  const unique_color_sequences = reflections.map(reflection => reflection.color_keys)
                                            .filter((value, index, self) => self.indexOf(value) === index)

  for (let i = 0; i < unique_color_sequences.length; i++) {
    const key = unique_color_sequences[i];
    let output = await image_loader.getOutputImage(size.width + padding.horizontal * 2, size.height + padding.vertical * 2, {r:255, g:255, b: 255, a: 0});  
    outputs[key] = output;
    const context = output.getContext("2d");
    context.strokeStyle = `rgba(255,0,0, 0.5)`;
    drawSquare(context, padding.horizontal, padding.vertical, size.width, size.height)
  }

  const all_output = await image_loader.getOutputImage(size.width + padding.horizontal * 2, size.height + padding.vertical * 2, {r:255, g:255, b: 255, a: 0}); 
  const all_context = all_output.getContext("2d");
  all_context.strokeStyle = `rgba(255,0,0, 0.5)`;
  drawSquare(all_context, padding.horizontal, padding.vertical, size.width, size.height)

  const ellipses = getMirrorEllipses(settings, reflections, mirror_board)
  
  for (let i = 0; i < ellipses.length; i++) {
    const color_key = reflections[i].color_keys;
    const context = outputs[color_key].getContext('2d');
    const board_normal = vector(0,0,1); //TODO: maybe not hardcode this?
    const mirror_normal = reflections[i].mirror.normal;

    const deviation = board_normal.angleTo(mirror_normal);
    const deviation_scale = Math.abs(deviation / (Math.PI / 4)); // maximum here would be 90 degrees

    let points = ellipses[i];
    context.fillStyle = color_convert.toCssHeatmap(deviation_scale)//`rgba(${Math.round(255 * deviation_scale)},${0},${0},1)`;
    context.strokeStyle = `rgba(0,0,0,0.6)`;
    drawDot(context, points);

    all_context.fillStyle = color_convert.toCssHeatmap(deviation_scale)//`rgba(${Math.round(255 * deviation_scale)},${0},${0},1)`;
    all_context.strokeStyle = `rgba(0,0,0,0.6)`;
    drawDot(all_context, points);

  }

  for(let key of Object.keys(outputs)) {
    const output = outputs[key];
    await image_loader.writeImage(path.join(settings.output.path, settings.output.mirror_angle_deviations.path, `angle_deviations_${key}.png`), output);  
  }

  await image_loader.writeImage(path.join(settings.output.path, settings.output.mirror_angle_deviations.path, `angle_deviations_all.png`), all_output);  
  
}

async function visualizeMirrorColorGroupsCenterAndOptimal(settings, reflections, mirror_board) {
  const size = settings.output.simulation.mirror_image_size;
  const padding = {vertical: 150, horizontal: 150}
  const ellipses = getMirrorEllipses(settings, reflections, mirror_board)

  const unique_color_sequences = reflections.map(reflection => reflection.color_keys)
                                            .filter((value, index, self) => self.indexOf(value) === index)

  
  let outputs = {};
  let ellipses_by_group = {};
  let non_rotated_mirror_targets = {};
  let non_rotated_mirror_targets_means = {};

  for (let i = 0; i < unique_color_sequences.length; i++) {
    const key = unique_color_sequences[i];
    let output = await image_loader.getOutputImage(size.width + padding.horizontal * 2, size.height + padding.vertical * 2, {r:255, g:255, b: 255, a: 0});  
    outputs[key] = output;
    const context = output.getContext("2d");
    context.strokeStyle = `rgba(255,0,0, 0.5)`;
    drawSquare(context, padding.horizontal, padding.vertical, size.width, size.height)

    ellipses_by_group[key] = [];
    non_rotated_mirror_targets[key] = []
    non_rotated_mirror_targets_means[key] = vector(0,0,0);

    // Write the colors in the top
  }


  for (let i = 0; i < ellipses.length; i++) {
    const color_key = reflections[i].color_keys;
    ellipses_by_group[color_key].push({reflection: reflections[i], ellipse: ellipses[i]});
  }


  // calculate where the reflection would hit the colors if they were not angled
  for (let key of Object.keys(ellipses_by_group)) {
    let group_reflections = ellipses_by_group[key].map(g => g.reflection);
    for (let reflection of group_reflections) {
      let pos = reflection.mirror.pos;
      let eye = reflection.eye.pos;
      let normal = vector(0,0,1); // TODO: maybe not hardcode here
      let target_normal = reflection.target_normal;

      if (target_normal.mag() <= 0) throw new Error('The normal of the color field is all 0')

      let target_pos = reflection.target;

      let vector_to_mirror_edge = pos.sub(eye).normalized();
      let approaching_vector = vector_to_mirror_edge.reflect(normal);

      let point_of_hit = pos.instesectsPlane(approaching_vector, target_pos, target_normal);

      let scaled_pos = scaleFromVectorSpaceToPrintSpace(point_of_hit, mirror_board, padding, size);

      non_rotated_mirror_targets[key].push(scaled_pos);
    }
  }

  for (let key of Object.keys(non_rotated_mirror_targets)) {
    const total = non_rotated_mirror_targets[key]
                            .map(pos => ({x: pos.x, y: pos.y}))
                            .reduce( (curr, prev) => {
                              return {x: prev.x + curr.x, y: prev.y + curr.y}
                            }, {x:0, y:0})

    non_rotated_mirror_targets_means[key] = {
      x: total.x / non_rotated_mirror_targets[key].length, 
      y: total.y / non_rotated_mirror_targets[key].length
    }
                                          
  }

  for (let key of Object.keys(non_rotated_mirror_targets)) {
    const context = outputs[key].getContext('2d');
    context.strokeStyle = `rgba(${0},${255},${0},1)`;
    non_rotated_mirror_targets[key].forEach(pos => {
      drawCross(context, pos.x, pos.y, 10, 10);
    })

    const mean = non_rotated_mirror_targets_means[key];
    context.strokeStyle = `rgba(${255},${0},${255},1)`;
    drawCross(context, mean.x, mean.y, 10, 10);
    
  }


  for(let key of Object.keys(outputs)) {
    const output = outputs[key];
    await image_loader.writeImage(path.join(settings.output.path, settings.output.mirror_angle_deviations.path, `non_rotated_mirror_targets_${key}.png`), output);  
  }

}


function getMirrorEllipses(settings, reflections, mirror_board) {

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
      const scaled_points = points.map(point => scaleFromVectorSpaceToPrintSpace(point, mirror_board, padding, size));
      return scaled_points;
    });

    return ellipses;
}

function scaleFromVectorSpaceToPrintSpace(point, mirror_board, padding, size) {
   
  const moved_to_origo = point.sub(mirror_board.center)  

  const normalized = {
    x: mirror_board.widthVector.normalized().dot(moved_to_origo) / mirror_board.widthVector.mag(), 
    y: mirror_board.heightVector.normalized().dot(moved_to_origo) / mirror_board.heightVector.mag()
  };

  const scaled = {
    x: padding.horizontal + size.width / 2 + normalized.x * size.width , 
    y: padding.vertical + size.height - (size.height / 2 + normalized.y * size.height)
  }
      
  return scaled;   

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

function drawCross(context, x, y, width,height) {
  context.beginPath();
  context.moveTo(x - width/2, y - height/2);
  context.lineTo(x + width/2, y + height/2);
  context.closePath();
  context.moveTo(x + width/2, y - height/2);
  context.lineTo(x - width/2, y + height/2);
  context.closePath();
  context.stroke();
}

function drawSquareFilled(context, x, y, width,height) {
  context.beginPath();
  context.moveTo(x, y);
  context.lineTo(x + width, y);
  context.lineTo(x + width, y + height);
  context.lineTo(x, y + height);
  context.lineTo(x, y);
  context.closePath();
  context.stroke();
  context.fill();
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