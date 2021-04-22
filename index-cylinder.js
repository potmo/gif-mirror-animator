'use strict';

import path from 'path';
import colors from 'colors';
import fs from 'fs-extra';
import * as mapper from './cylinder-mapper.js';
import * as image_loader from './image-loader.js';
import * as three_dee_generator from './3d-generator.js';
import * as hex_converter from './hex-converter.js';
import * as sequence_builder from './sequence-builder.js';
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
  let images = await image_loader.load(settings);

  for (var i = 0; i < images.length / settings.input.duplicate_frames; i++) {
    await image_loader.writeImage(path.join(settings.output.path, `input_${i}.png`), images[i]);
  }

  console.log('Convert to hex'.brightBlue);
  let {frames, pixels, image_size, color_map} = await hex_converter.convert(settings, images);


  console.log('Build sequences'.brightBlue);
  let {sequences, sequence_keys, reverse_color_map} = await sequence_builder.build(settings, pixels, color_map, frames);

  console.log('Map to cylinder'.brightBlue);
  let mapping_conf = await mapper.map(settings, pixels, sequences, sequence_keys, reverse_color_map, image_size, frames);

  var arrangement_size = Math.max(mapping_conf.mirror.width, mapping_conf.mirror.height);

  console.log('Generate 3d files'.yellow);
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
      atlas: {
        path: './images/tea-sun-lager4.png', 
        columns: 3, 
        rows: 1,
      },
      
      /*
      image: {
        paths: [
          './images/bone-big.png', 
        ],
        invert: true,
        iterations: 2000,
      },*/
      /*image_and_rotate: {
        images: [
          { path: './images/fruits/fastfood1.png', rotation: Math.PI * 2 },
          { path: './images/fruits/fastfood2.png', rotation: Math.PI * 2 },
        ]
      }*/
      duplicate_frames: 4, 
    },
    output: {
      path: './output-cylinder', // this is modified and the input name is added
      simulation: {
        path: 'simulation',
        ellipse_image_size: {width: 1000, height: 1000},
        mirror_image_size: {width: 1000, height: 1000},
        hex: {enabled: false},
      },
      texture: true,
      obj: true,
      mod: true,
      cnc: true, 
      cylinder_image: {
        height: 1000,
        diameter_scalar: 0.3,
      }
    },
    three_dee: { // units in meters
      mirror_thickness: 0.001, 
      mirror_diameter: 0.0105, // this is the diameter of the mirror
      mirror_padding: 0.0025, // the padding between mirrors
      mirror_board_diameter: undefined, // declared later programmatically
      wall_offset: vector(1.0, 0.0, 1.0), //vector(2.00, 0.0, 2.00),
      wall_rotation_scalar: -0.375, // scalar of full circle around up axis
      wall_diameter: 2.0,//2.490, 
      eye_offset: vector(0, 0, 4.00),
    },
    optimization: {
      reuse_permutations: true,
      sort_sequnece: {
        algo: 'shannon', //none | shannon
        acending: true,
      },
      prune: {
        max_sequences: 40,//32
        comparator: 'color_distance', // 'color_distance' | 'sequence_string_distance'
        //min_usage: 4
      },
      pick_any_cycle: false,
    },
    print: {
      palette: true,
      color_map: true,
      reverse_color_map: true,
      sequence_count: false,
      sequence_occurencies: true,
      number_of_pixels: false,
      section_angles: true
    },
  }

  var input;
  if (settings.input.atlas) input = settings.input.atlas.path
  if (settings.input.image) input = settings.input.image.paths[0];
  if (settings.input.image_and_rotate) input = settings.input.image_and_rotate.images[0].path;

  let image_name = path.basename(input, path.extname(input));


  console.log(`adding ${image_name} to ${settings.output.path}`.gray)

  settings.output.path = path.join(settings.output.path, image_name);
  console.log(`modified output to ${settings.output.path}`.gray)

  return settings;
} 