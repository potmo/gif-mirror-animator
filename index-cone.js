'use strict';

import path from 'path';
import colors from 'colors';
import fs from 'fs-extra';
import * as mapper from './predifened-color-position-mapper.js';
import * as image_loader from './image-loader.js';
import * as three_dee_generator from './3d-generator.js';
import * as hex_converter from './hex-converter.js';
import * as sequence_builder from './sequence-builder.js';
import * as wall_generator from './cone-wall-generator.js'
import * as color_extractor from './fixed-palette-color-extractor.js';
import * as image_size_extractor from './image-size-extractor.js';
import * as mirror_arranger from './mirror-disc-arranger.js';
import * as arrangement_color_sampler from './mirror-arrangement-color-sampler.js';
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


  console.log('Extract palette'.brightBlue);
  const color_map = color_extractor.extractColorMap(settings);

  console.log('Extract size'.brightBlue);
  let image_size = image_size_extractor.extractSize(images);

  console.log('Convert to hex'.brightBlue);
  let {frames, pixels} = await mirror_arranger.arrange(settings, images, color_map, image_size);

  console.log('Colorize mirrors'.brightBlue);
  let colored_pixels = await arrangement_color_sampler.sample(settings, pixels, color_map, images, image_size);

  console.log('Map to wall'.brightBlue);
  let mapping_conf = await mapper.map(settings, colored_pixels, image_size);

  var arrangement_size = Math.max(mapping_conf.mirror.width, mapping_conf.mirror.height);

  console.log('Generate 3d files'.yellow);
  settings.three_dee.mirror_board_diameter = arrangement_size * (settings.three_dee.mirror_diameter + settings.three_dee.mirror_padding);
  await three_dee_generator.generate(settings, mapping_conf, wall_generator);

/*

  console.log('Extract palette'.brightBlue);
  let color_map = color_extractor.extractColorMap(images);

  console.log('Extract size'.brightBlue);
  let image_size = image_size_extractor.extractSize(images);

  console.log('Convert to hex'.brightBlue);
  let {frames, pixels} = await hex_converter.convert(settings, images, color_map, image_size);

  console.log('Build sequences'.brightBlue);
  let {sequences, sequence_keys, reverse_color_map} = await sequence_builder.build(settings, pixels, color_map, frames);

  console.log('Map to cylinder'.brightBlue);
  let mapping_conf = await mapper.map(settings, pixels, sequences, sequence_keys, reverse_color_map, image_size, frames);

  var arrangement_size = Math.max(mapping_conf.mirror.width, mapping_conf.mirror.height);

  console.log('Generate 3d files'.yellow);
  settings.three_dee.mirror_board_diameter = arrangement_size * (settings.three_dee.mirror_diameter + settings.three_dee.mirror_padding);
  await three_dee_generator.generate(settings, mapping_conf, wall_generator);

  */
  
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
        path: './images/up-down-cone.png', 
        columns: 1, 
        rows: 1,
      },

       fixed_palette: 
      {
        aim_positions: {                                                             // HEAD DETERMINES DIR
          'A': {color: 0xFF0000 | 0xFF000000, positions: [{x: 100 + 200 * 3, y: 100}, {x: 100 + 200 * 7, y: 100}]}, // vertical always on
          'B': {color: 0x0000FF | 0xFF000000, positions: [{x: 100 + 200 * 1, y: 100}, {x: 100 + 200 * 5, y: 100}]}, // vertical always off
          'C': {color: 0x00FF00 | 0xFF000000, positions: [{x: 100 + 200 * 3, y: 100}, {x: 100 + 200 * 7, y: 100}]}, // horizontal always on
          'D': {color: 0xFF00FF | 0xFF000000, positions: [{x: 100 + 200 * 1, y: 100}, {x: 100 + 200 * 5, y: 100}]}, // horizontal always off
          'E': {color: 0xF0000F | 0xFF000000, positions: [{x: 100 + 200 * 0, y: 100}]}, // vertical up on
          'F': {color: 0x0F00F0 | 0xFF000000, positions: [{x: 100 + 200 * 4, y: 100}]}, // vertical down on
          'G': {color: 0x00F000 | 0xFF000000, positions: [{x: 100 + 200 * 2, y: 100}]}, // horizontal left on
          'H': {color: 0x000F00 | 0xFF000000, positions: [{x: 100 + 200 * 6, y: 100}]}, // horizontal right on
        },
        path: './images/texture-for-up-down-cone.png',
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
      duplicate_frames: 1, 
    },
    output: {
      path: './output-cone', // this is modified and the input name is added
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
        diameter_scalar: 2.0, // this is multiplied with three_dee.wall_diameter or output.cylinder_image.height to get width
        diameter_scalar_top: 1.0, // this is to make the wall a cone
      }
    },
    three_dee: { // units in meters
      mirror_thickness: 0.001, 
      mirror_diameter: 0.0105, // this is the diameter of the mirror
      mirror_padding: 0.0025, // the padding between mirrors
      mirror_board_diameter: undefined, // declared later programmatically
      wall_offset: vector(0.0, 0.0, 0.25), //vector(2.00, 0.0, 2.00),
      wall_rotation_scalar: 0.0, // scalar of full circle around up axis
      wall_roll_scalar: -112.5 / 360, // scalar of full rotation around rolling axis
      wall_diameter: 0.5,//2.490, 
      wall_face_divisions: 50,
      eye_offset: vector(0, 0, 3.00),

    },
    optimization: {
      reuse_permutations: false,
      sort_sequnece: {
        algo: 'none', //none | shannon
        acending: true,
      },
      /*prune: {
        max_sequences: 40,//32
        comparator: 'color_distance', // 'color_distance' | 'sequence_string_distance'
        //min_usage: 4
      },*/
      pick_any_cycle: false,
      /*
      shift_sequences: { // note: this shifts left
        0:  0,
        1:  2,
        2:  0,
        3:  0,
        4:  0,
        5:  0,
        6:  0,
        7:  0,
        8:  2,
        9:  2,
      },
      fixed_sequence_order: [ // note: this happens after shifting sequences
        0,
        3,
        2,
        5,
        8,
        7,
        9,
        6,
        4,
        1,
      ]*/
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