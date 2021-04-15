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
  await image_loader.writeImage(path.join(settings.output.path, 'input.png'), reflection_image);

  var mirror_arrangement;

  switch (true) {
    case (!!settings.input.arrangement.image):
      let arrangement_image = await image_loader.readImage(settings.input.arrangement.image);
      await image_loader.writeImage(path.join(settings.output.path, 'arrangement.png'), arrangement_image);
      console.log('Convert arrangement'.brightBlue);
      mirror_arrangement = mirror_arranger.convert(settings, arrangement_image);
      break;

    case !!settings.input.arrangement.equidistant_spiral:
      mirror_arrangement = mirror_arranger.equidistantSpiral(settings);
      break;

    case !!settings.input.arrangement.stippling: 
      mirror_arrangement = await mirror_arranger.stippling(settings);
      break;

    default: 
      throw new Error('No input');
      break;
  
  }
  


  console.log(`Number of pixels in arrrangement: ${mirror_arrangement.pixels.length}`.blue)

  const input_context = reflection_image.getContext('2d');
  const input_data = input_context.getImageData(0, 0, reflection_image.width, reflection_image.height);

  let reflection_size = Math.max(reflection_image.width, reflection_image.height);
  let arrangement_size = Math.max(mirror_arrangement.image_size.width, mirror_arrangement.image_size.height);

  const point_count = mirror_arrangement.pixels.length;
  const iterations = [settings.input.image.iterations];

  let stipled_points = stipple(input_data.data, reflection_image.width, reflection_image.height, point_count, iterations, settings.input.image.invert)
    .points
    .reduce( (list, current, index) => {
      if (index % 2 == 0) {
        return list.concat([{x: current, y: null}]);
      }

      list[list.length-1].y = current;
      return list;
    }, []);

  

  let scaled_stipled_points = stipled_points.map(point => {
    return {
      x: (point.x - reflection_image.width / 2) / reflection_size, 
      y: (point.y - reflection_image.height / 2) / reflection_size
    }
  });

  
  let scaled_arrangement_points = mirror_arrangement.pixels.map(point => {
    return {
      x: (point.x - mirror_arrangement.image_size.width / 2) / arrangement_size, 
      y: (point.y - mirror_arrangement.image_size.height / 2) / arrangement_size,
    }
  });


  let mapping_conf = await stipple_mapper.map(settings, scaled_arrangement_points, scaled_stipled_points);

  console.log('Generate 3d files'.brightBlue);

  settings.three_dee.mirror_board_diameter = arrangement_size * (settings.three_dee.mirror_diameter + settings.three_dee.mirror_padding);

  await three_dee_generator.generate(settings, mapping_conf);
  
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
          './images/bone.png', 
        ],
        invert: true,
        iterations: 2000,
      },
      arrangement: {
        //image: './images/crab-text.png',
        
        /*
        equidistant_spiral: {
          width: 45,
          height: 45,
          coils: 15,
          chord: 1.5,
        },*/

        
        stippling: {
          path: './images/meat.png', 
          invert: true,
          iterations: 2000,
          points: 250,
          imaginary_size: 35
        }
        
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
        ellipse_image_size: {width: 1000, height: 1000},
        mirror_image_size: {width: 1000, height: 1000},
      },
      obj: true,
      mod: true,
      cnc: true, 
    },
    three_dee: { // units in meters
      mirror_thickness: 0.002, 
      mirror_diameter: 0.0105, // this is the diameter of the mirror
      mirror_padding: 0.0025, // the padding between mirrors
      mirror_board_diameter: undefined, // declared later programmatically
      wall_offset: vector(1.50, 0, 1.0),
      wall_rotation_scalar: -0.25, // scalar of full circle around up axis
      wall_diameter: 2.00, 
      eye_offset: vector(0.0, 0.0, 3.00),
    },
  }

  var input;
  if (settings.input.atlas) input = settings.input.atlas.path
  if (settings.input.image) input = settings.input.image.paths[0];
  if (settings.input.image_and_rotate) input = settings.input.image_and_rotate.images[0].path;

  let image_name = path.basename(input, path.extname(input));
  var arrangement_name

  switch(true) {

    case (!!settings.input.arrangement.image):
      arrangement_name = path.basename(settings.input.arrangement.image, path.extname(settings.input.arrangement.image));
      break;

    case (!!settings.input.arrangement.equidistant_spiral):
      arrangement_name = 'spiral';
      break;

    case (!!settings.input.arrangement.stippling):
      arrangement_name = path.basename(settings.input.arrangement.stippling.path, path.extname(settings.input.arrangement.stippling.path));
      break;

    default:
      arrangement_name = 'default';
      break;
  } 

  console.log(`adding ${image_name}_${arrangement_name} to ${settings.output.path}`.gray)

  settings.output.path = path.join(settings.output.path, image_name + '_' + arrangement_name);
  console.log(`modified output to ${settings.output.path}`.gray)

  return settings;
} 