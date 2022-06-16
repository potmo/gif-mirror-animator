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

async function visualize(settings, reflections, wall, mirror_board) {

  //const size = settings.output.simulation.ellipse_image_size;
  const size = settings.output.simulation.mirror_image_size;
  const padding = {vertical: 150, horizontal: 150}

  const ellipses = reflections
    .map(a => a.ellipse_points)
    .map( reflection_points => {
      const scaled_points = reflection_points
        //.map( p => {
        //  return wall.textureCoordAtWorldPos(p);
        //})
        .map(pos => {
          return scaleFromVectorSpaceToPrintSpace(pos, mirror_board, padding, size);
          //return {x: size.width / 2 + p.x * size.width , y: size.height - (size.height / 2 + p.y * size.height)}
        });
      return scaled_points;
    });


  let output = await image_loader.getOutputImage(size.width + padding.horizontal * 2, size.height + padding.vertical * 2, {r:0, g:0, b: 0, a: 255});  

  const context = output.getContext("2d");


  context.fillStyle = `rgba(255,255,255,0.05)`;
  context.strokeStyle = `rgba(255,255,255,0.0)`;

  ellipses.forEach(points => {
    drawDot(context, points);                 
  });


  const board = {
    upper_left: scaleFromVectorSpaceToPrintSpace(vector(-settings.three_dee.wall_width/2, settings.three_dee.wall_height/2, 0), mirror_board, padding, size),
    upper_right: scaleFromVectorSpaceToPrintSpace(vector(settings.three_dee.wall_width/2, settings.three_dee.wall_height/2, 0), mirror_board, padding, size),
    lower_left: scaleFromVectorSpaceToPrintSpace(vector(-settings.three_dee.wall_width/2, -settings.three_dee.wall_height/2, 0), mirror_board, padding, size),
    lower_right: scaleFromVectorSpaceToPrintSpace(vector(settings.three_dee.wall_width/2, -settings.three_dee.wall_height/2, 0), mirror_board, padding, size),
  }
  context.strokeStyle = `rgba(255,0,255,1.0)`;
  context.beginPath()
  context.moveTo(board.upper_left.x, board.upper_left.y);
  context.lineTo(board.upper_right.x, board.upper_right.y);
  context.lineTo(board.lower_right.x, board.lower_right.y);
  context.lineTo(board.lower_left.x, board.lower_left.y);
  context.lineTo(board.upper_left.x, board.upper_left.y);
  context.stroke();
  

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

    const board = {
      upper_left: scaleFromVectorSpaceToPrintSpace(vector(-settings.three_dee.wall_width/2, settings.three_dee.wall_height/2, 0), mirror_board, padding, size),
      upper_right: scaleFromVectorSpaceToPrintSpace(vector(settings.three_dee.wall_width/2, settings.three_dee.wall_height/2, 0), mirror_board, padding, size),
      lower_left: scaleFromVectorSpaceToPrintSpace(vector(-settings.three_dee.wall_width/2, -settings.three_dee.wall_height/2, 0), mirror_board, padding, size),
      lower_right: scaleFromVectorSpaceToPrintSpace(vector(settings.three_dee.wall_width/2, -settings.three_dee.wall_height/2, 0), mirror_board, padding, size),
    }
    context.strokeStyle = `rgba(255,0,255,1.0)`;
    context.beginPath()
    context.moveTo(board.upper_left.x, board.upper_left.y);
    context.lineTo(board.upper_right.x, board.upper_right.y);
    context.lineTo(board.lower_right.x, board.lower_right.y);
    context.lineTo(board.lower_left.x, board.lower_left.y);
    context.lineTo(board.upper_left.x, board.upper_left.y);
    context.stroke();

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

  const max_angle = Math.PI / 4;
  
  for (let i = 0; i < ellipses.length; i++) {
    const color_key = reflections[i].color_keys;
    const context = outputs[color_key].getContext('2d');
    const board_normal = mirror_board.normal;
    const mirror_normal = reflections[i].mirror.normal;

    const deviation = board_normal.angleTo(mirror_normal);
    const deviation_scale = Math.min(1.0, Math.abs(deviation / max_angle)); // maximum here would be 90 degrees
    const heatmap_color = color_convert.toCssHeatmap(deviation_scale);

    let points = ellipses[i];
    context.fillStyle = heatmap_color;
    context.strokeStyle = `rgba(0,0,0,0.6)`;
    drawDot(context, points);

    all_context.fillStyle = heatmap_color;
    all_context.strokeStyle = `rgba(0,0,0,0.6)`;
    drawDot(all_context, points);

  }

  const legend_squares = 10;
  for (var i = 0; i < legend_squares; i++) {

    for (let context of Object.values(outputs).map(c => c.getContext('2d'))) {
      context.fillStyle = color_convert.toCssHeatmap(i / legend_squares);
      drawSquare(context, 0, 20 + 20 * i, 20, 20);
      context.fill() 
      context.font = '12px serif';
      context.fillStyle = 'rgba(0,0,0,1)'
      context.fillText(`${((i/legend_squares)*max_angle*180/Math.PI).toFixed(2)}°`, 30, 20 + 20 * i);
    }
     
    all_context.fillStyle = color_convert.toCssHeatmap(i / legend_squares);
    drawSquare(all_context, 0, 20 + 20 * i, 20, 20);
    all_context.fill()
    all_context.font = '12px serif';
    all_context.fillStyle = 'rgba(0,0,0,1)'
    all_context.fillText(`${((i/legend_squares)*max_angle*180/Math.PI).toFixed(2)}°`, 30, 20 + 20 * i);


  }

  for(let key of Object.keys(outputs)) {
    const output = outputs[key];
    await image_loader.writeImage(path.join(settings.output.path, settings.output.mirror_angle_deviations.path, `angle_deviations_${key}.png`), output);  
  }

  await image_loader.writeImage(path.join(settings.output.path, settings.output.mirror_angle_deviations.path, `angle_deviations_all.png`), all_output);  
  
}

async function visualizeMirrorColorGroupsCenterAndOptimal(settings, reflections, mirror_board) {
  const unique_color_sequences = reflections.map(reflection => reflection.color_keys)
                                            .filter((value, index, self) => self.indexOf(value) === index);
  const size = settings.output.simulation.mirror_image_size;
  const padding = {vertical: 150, horizontal: 150}

  const eye_offsets = [
    vector(-0.8, 0, 0),
    vector(-0.7, 0, 0),
    vector(-0.6, 0, 0),
    vector(-0.5, 0, 0),
    vector(-0.4, 0, 0),
    vector(-0.3, 0, 0),
    vector(-0.2, 0, 0),
    vector(-0.1, 0, 0),
    vector(0.0, 0, 0),
    vector(0.1, 0, 0),
    vector(0.2, 0, 0),
    vector(0.3, 0, 0),
    vector(0.4, 0, 0),
    vector(0.5, 0, 0),
    vector(0.6, 0, 0),
    vector(0.7, 0, 0),
    vector(0.8, 0, 0),
  ]

  let outputs = {};       
  for (let i = 0; i < unique_color_sequences.length; i++) {
    const key = unique_color_sequences[i];
    let output = await image_loader.getOutputImage(size.width + padding.horizontal * 2, size.height + padding.vertical * 2, {r:255, g:255, b: 255, a: 0});  
    outputs[key] = output;
    const context = output.getContext("2d");
    context.strokeStyle = `rgba(255,0,0, 0.5)`;
    drawSquare(context, padding.horizontal, padding.vertical, size.width, size.height)
  }     

  const mirror_targets = eye_offsets.map(eye_offset => {
    return getNonRotatedMirrorTargetsFromEyePosition(settings, reflections, mirror_board, padding, size, eye_offset);
  })


  for (let key of unique_color_sequences) {

    const targets = mirror_targets.map( mirror_target => {
      return {
        position: mirror_target.non_rotated_mirror_targets[key],
        mean: mirror_target.non_rotated_mirror_targets_means[key],
      }
    })

    const context = outputs[key].getContext('2d');

    // Note that this is a bit of a strange loop.
    // targets contains all eye positions
    // that in turn contains all the target positions per sequence_color
    context.strokeStyle = `rgba(${100},${100},${255},1)`;
    for (let j = 0; j < targets[0].position.length; j++){
      context.beginPath();
      context.moveTo(targets[0].position[j].x, targets[0].position[j].y);

      for (let i = 0; i < targets.length; i++) {
        const pos = targets[i].position[j];
        context.lineTo(pos.x, pos.y);  
      }

      context.stroke()  
    }

    for (let j = 0; j < targets[0].position.length; j++){
      for (let i = 0; i < targets.length; i++) {
        const pos = targets[i].position[j];
        drawCross(context, pos.x, pos.y, 3, 3);
      }
    }
    

    
    context.strokeStyle = `rgba(${0},${255},${0},1)`;
    const normal_position = Math.round(targets.length/2) - 1;
    targets[normal_position].position.forEach(pos => {
      drawCross(context, pos.x, pos.y, 10, 10);
    })

    const mean = targets[normal_position].mean;
    context.strokeStyle = `rgba(${255},${0},${255},1)`;
    drawCross(context, mean.x, mean.y, 10, 10);

  }


  for(let key of Object.keys(outputs)) {
    const output = outputs[key];
    await image_loader.writeImage(path.join(settings.output.path, settings.output.mirror_angle_deviations.path, `non_rotated_mirror_targets_${key}.png`), output);  
  }                                                                            

}

function getNonRotatedMirrorTargetsFromEyePosition(settings, reflections, mirror_board, padding, size, eye_offset) {
  

  const unique_color_sequences = reflections.map(reflection => reflection.color_keys)
                                            .filter((value, index, self) => self.indexOf(value) === index)

  
  let reflections_by_group = {};
  let non_rotated_mirror_targets = {};
  let non_rotated_mirror_targets_means = {};

  for (let i = 0; i < unique_color_sequences.length; i++) {
    const key = unique_color_sequences[i];
    reflections_by_group[key] = [];
    non_rotated_mirror_targets[key] = []
    non_rotated_mirror_targets_means[key] = vector(0,0,0);

    // Write the colors in the top
  }

  for (let i = 0; i < reflections.length; i++) {
    const color_key = reflections[i].color_keys;
    reflections_by_group[color_key].push(reflections[i]);
  }


  // calculate where the reflection would hit the colors if they were not angled
  for (let key of Object.keys(reflections_by_group)) {
    for (let reflection of reflections_by_group[key]) {
      let pos = reflection.mirror.pos;
      let eye = reflection.eye.pos.add(eye_offset);
      let normal = mirror_board.normal; 
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

  return {non_rotated_mirror_targets, non_rotated_mirror_targets_means};

  
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