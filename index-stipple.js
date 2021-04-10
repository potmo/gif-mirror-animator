'use strict';

import path from 'path';
import colors from 'colors';
import fs from 'fs-extra';
import * as image_loader from './image-loader.js';
import {stipple} from './stipple.js';
import * as mirror_arranger from './mirror-arranger.js';
import * as stipple_mapper from './stipple-mapper.js';
import * as three_dee_generator from './stipple-3d-generator.js';
import vector from './vector.js';

run()
  .then(()=>{
    console.log('done'.green);
    alertTerminal();
    return process.exit(0);
  })
  .catch((err)=>{
    console.error(`${err.stack}`.red);
    return process.exit(1);
  });

function alertTerminal(){
  console.log("\x07");
}


async function run() {
  const settings = getSettings();
  await prepareOutputDir(settings);


  console.log('Load images'.brightBlue);
  let reflection_image = await image_loader.readImage(settings.input.image.paths[0]);
  let arrangement_image = await image_loader.readImage(settings.input.arrangement.image);
  await image_loader.writeImage(path.join(settings.output.path, 'input.png'), reflection_image);
  await image_loader.writeImage(path.join(settings.output.path, 'arrangement.png'), arrangement_image);

  console.log('Convert arrangement'.brightBlue);
  let mirror_arrangement = mirror_arranger.convert(settings, arrangement_image);

  const input_context = reflection_image.getContext('2d');
  const input_data = input_context.getImageData(0, 0, reflection_image.width, reflection_image.height);

  let reflection_size = Math.max(reflection_image.width, reflection_image.height);
  let arrangement_size = Math.max(arrangement_image.width, arrangement_image.height);

  const point_count = mirror_arrangement.pixels.length;
  const iterations = [settings.output.simulation.iterations];
  const scale = settings.output.simulation.scale;
  const point_size = settings.output.simulation.point_size;

  let stipled_points = stipple(input_data.data, reflection_image.width, reflection_image.height, point_count, iterations, settings.input.image.invert)
    .points
    .reduce( (list, current, index) => {
      if (index % 2 == 0) {
        return list.concat([{x: current, y: null}]);
      }

      list[list.length-1].y = current;
      return list;
    }, []);

  //console.log(stipled_points)


  let reflection_output = await image_loader.getOutputImage(reflection_image.width * scale, reflection_image.height * scale, {r:0, g:0, b: 0, a: 255});
  const reflection_context = reflection_output.getContext("2d");

  const color = {r: 255, g: 255, b:255, a: 255};
  reflection_context.fillStyle = `rgba(${color.r},${color.g},${color.b},${color.a})`;
  reflection_context.strokeStyle = `rgba(${color.r},${color.g},${color.b},${color.a})`;

  stipled_points.map(p => ({x: p.x * scale, y: p.y*scale})).forEach(point => drawDot(reflection_context, point, point_size));

  await image_loader.writeImage(path.join(settings.output.path, 'simulation', 'reflection.png'), reflection_output);


  let arrangement_output = await image_loader.getOutputImage(arrangement_image.width * scale, arrangement_image.height * scale, {r:0, g:0, b: 0, a: 255});
  const arrangement_context = arrangement_output.getContext("2d");

  arrangement_context.fillStyle = `rgba(${color.r},${color.g},${color.b},${color.a})`;
  arrangement_context.strokeStyle = `rgba(${color.r},${color.g},${color.b},${color.a})`;

  mirror_arrangement
    .pixels
    .map( pixel => {return {x: pixel.x * scale, y: pixel.y * scale}})
    .forEach(point => drawDot(arrangement_context, point, point_size));

  await image_loader.writeImage(path.join(settings.output.path, settings.output.simulation.path, 'arrangement.png'), arrangement_output);

  // normalize size

  let scaled_stipled_points = stipled_points.map(point => {
    return {
      x: (point.x - reflection_image.width / 2) / reflection_size, 
      y: (point.y - reflection_image.height / 2) / reflection_size
    }
  });

  
  let scaled_arrangement_points = mirror_arrangement.pixels.map(point => {
    return {
      x: (point.x - arrangement_image.width / 2) / arrangement_size, 
      y: (point.y - arrangement_image.height / 2) / arrangement_size
    }
  });


  let mapping_conf = await stipple_mapper.map(settings, scaled_arrangement_points, scaled_stipled_points);

  console.log('Generate 3d files'.brightBlue);

  await three_dee_generator.generate(settings, mapping_conf, arrangement_size);
  
}

function drawDot(context, position, radius) {
  
  const num_points = 15;
  let points = Array.from({length: num_points}, (v, i, a) => i / num_points)
  .map(a => a * Math.PI * 2)
  .map(a => {
    return {
      x: position.x + Math.cos(a) * radius, 
      y: position.y + Math.sin(a) * radius,
    }
  }) 

  context.beginPath();
  context.moveTo(points[0].x, points[0].y);
  
  for (var i = 1; i < points.length; i++) {
    context.lineTo(points[i].x, points[i].y);
  }

  context.closePath();
  context.stroke();
  context.fill();
}

async function prepareOutputDir(settings) {
  const output_dir = path.join(path.resolve(), settings.output.path);
  await fs.remove(output_dir);
  await fs.mkdirs(output_dir);

  const simulation_dir = path.join(output_dir, settings.output.simulation.path);
  await fs.mkdirs(simulation_dir);
  
  console.log(colors.yellow(`refreshed ${output_dir}`));
  await fs.writeFile(path.join(output_dir, 'settings.json'), JSON.stringify(settings, null, '  '));
  console.log(colors.yellow(`saved settings.js`));
}


function getSettings() {
  let settings =  {
    input: {
      /*atlas: {
        path: './images/fruits/potato-tomato.png', 
        columns: 2, 
        rows: 1,
      },
      */
      image: {
        paths: [
          './images/crab.png', 
        ],
        invert: true,
      },
      arrangement: {
        image: './images/crab-text.png',
      },
      /*image_and_rotate: {
        images: [
          { path: './images/fruits/fastfood1.png', rotation: Math.PI * 2 },
          { path: './images/fruits/fastfood2.png', rotation: Math.PI * 2 },
        ]
      }*/
      duplicate_frames: 1, 
    },
    output: {
      path: './output-stipple', // this is modified and the input name is added
      simulation: {
        path: 'simulation',
        iterations: 5000,
        scale: 3.0,
        point_size: 2,
        size: {width: 1000, height: 1000},
      },
      obj: true,
      mod: true,
      cnc: true, 
    },
    three_dee: { // units in meters
      mirror_thickness: 0.002, 
      mirror_diameter: 0.0105, // this is the diameter of the mirror
      mirror_padding: 0.0025, // the padding between mirrors
      wall_offset: vector(1.50, 0, 2.0),
      wall_rotation_scalar: -0.25, // scalar of full circle around up axis
      wall_diameter: 3.00, 
      eye_offset: vector(-2.50, 0, 2.00),
    },
  }

  var input;
  if (settings.input.atlas) input = settings.input.atlas.path
  if (settings.input.image) input = settings.input.image.paths[0];
  if (settings.input.image_and_rotate) input = settings.input.image_and_rotate.images[0].path;

  let image_name = path.basename(input, path.extname(input));
  let arrangement_name = path.basename(settings.input.arrangement.image, path.extname(settings.input.arrangement.image));

  console.log(`adding ${image_name}_${arrangement_name} to ${settings.output.path}`.gray)

  settings.output.path = path.join(settings.output.path, image_name + '_' + arrangement_name);
  console.log(`modified output to ${settings.output.path}`.gray)

  return settings;
} 