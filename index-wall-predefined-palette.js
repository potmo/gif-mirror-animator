'use strict';

import path from 'path';
import colors from 'colors';
import fs from 'fs-extra';
import * as mapper from './predifened-color-position-mapper.js';
import * as image_loader from './image-loader.js';
import * as three_dee_generator from './3d-generator.js';
import * as hex_converter from './hex-converter.js';
import * as mirror_arranger from './mirror-square-arranger.js';
import * as arrangement_color_sampler from './mirror-arrangement-color-sampler.js';

import * as hex_image_arranger from './hex-image-arranger.js'

import * as sequence_builder from './sequence-builder.js';
import * as wall_generator from './flat-wall-generator.js';
import * as color_extractor from './fixed-palette-color-extractor.js';
import * as image_size_extractor from './image-size-extractor.js';
import * as color_convert from './color-convert.js';
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

  //console.log('Convert to hex'.brightBlue);
  //let {frames, pixels} = await mirror_arranger.arrange(settings, images, color_map, image_size);

  //console.log('Colorize mirrors'.brightBlue);
  //let colored_pixels_old = await arrangement_color_sampler.sample(settings, pixels, color_map, images, image_size);

  console.log('Convert to colorized hex mirrors'.brightBlue);
  let colored_pixels = await hex_image_arranger.arrange(settings, images, color_map, image_size);



  console.log('Map to wall'.brightBlue);
  let mapping_conf = await mapper.map(settings, colored_pixels, image_size);

  var arrangement_size = Math.max(mapping_conf.mirror.width, mapping_conf.mirror.height);

  console.log('Generate 3d files'.yellow);
  settings.three_dee.mirror_board_diameter = arrangement_size * (settings.three_dee.mirror_diameter + settings.three_dee.mirror_padding);
  await three_dee_generator.generate(settings, mapping_conf, wall_generator);
  
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
        path: './images/pig.png', 
        columns: 1, 
        rows: 1,
      },

      fixed_palette: 
      {
        aim_positions: {
          'A': {color: 0x131c35 | 0xFF000000, positions: [{x: 1000-125, y: 1000-125}]},
          'B': {color: 0x344d74 | 0xFF000000, positions: [{x: 1000-375, y: 1000-125}]},
          'C': {color: 0x5089a3 | 0xFF000000, positions: [{x: 1000-625, y: 1000-125}]},
          'D': {color: 0x58a9b5 | 0xFF000000, positions: [{x: 1000-875, y: 1000-125}]},
          'E': {color: 0x6f0c06 | 0xFF000000, positions: [{x: 1000-125, y: 1000-375}]},
          'F': {color: 0xb14729 | 0xFF000000, positions: [{x: 1000-375, y: 1000-375}]},
          'G': {color: 0xe47c3f | 0xFF000000, positions: [{x: 1000-625, y: 1000-375}]},
          'H': {color: 0xf2c269 | 0xFF000000, positions: [{x: 1000-875, y: 1000-375}]},
          'I': {color: 0x9a0509 | 0xFF000000, positions: [{x: 1000-125, y: 1000-625}]},
          'J': {color: 0xc70506 | 0xFF000000, positions: [{x: 1000-375, y: 1000-625}]},
          'K': {color: 0xdb3722 | 0xFF000000, positions: [{x: 1000-625, y: 1000-625}]},
          'L': {color: 0xfb604d | 0xFF000000, positions: [{x: 1000-875, y: 1000-625}]},
          'M': {color: 0xffafe3 | 0xFF000000, positions: [{x: 1000-125, y: 1000-875}]},
          'N': {color: 0xffcff4 | 0xFF000000, positions: [{x: 1000-375, y: 1000-875}]},
          'O': {color: 0xffddfb | 0xFF000000, positions: [{x: 1000-625, y: 1000-875}]},
          'P': {color: 0xfff4ff | 0xFF000000, positions: [{x: 1000-875, y: 1000-875}]},
        },
        path: './output-wall-single-picture/rooster/texture.png',
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
      path: './output-wall-predefined', // this is modified and the input name is added
      simulation: {
        path: 'simulation',
        ellipse_image_size: {width: 1000, height: 1000},
        mirror_image_size: {width: 1000, height: 1000},
        hex: {
          enabled: false,
          width: 400,
          height: 400,
          mirror_size: 10,
        },
        frames: true,
      },
      texture: true,
      obj: true,
      mod: true,
      cnc: true, 
      image: {
        height: 1000,
        width: 1000,
        columns: 4,
      }
    },
    three_dee: { // units in meters
      mirror_thickness: 0.001, 
      mirror_diameter: 0.0105, // this is the diameter of the mirror
      mirror_padding: 0.0025, // the padding between mirrors
      mirror_board_diameter: undefined, // declared later programmatically
      wall_offset: vector(3, 0.0, 3.0), //vector(2.00, 0.0, 2.00),
      wall_rotation_scalar: -0.25, // scalar of full circle around up axis
      //wall_diameter: 4.0,
      wall_width: 3.5,
      wall_height: 3.0,
      wall_face_divisions: 50,
      eye_offset: vector(-3, -0.0, 3.00),

    },
    optimization: {
      reuse_permutations: true,
      sort_sequnece: {
        algo: 'none', //none | shannon
        acending: false,
      },
      prune: {
        max_sequences: 40,//32
        comparator: 'color_distance', // 'color_distance' | 'sequence_string_distance'
        //min_usage: 4
      },
      pick_any_cycle: false,
      shift_sequences: {
        /*0: +1,
        8: +2,
        9: +2,
        10: +2,*/
      },
      
      fixed_sequence_key_order: [
        'I', 'G', 'B', 'A',
        'J', 'E', 'D', 'F',
        'C', 'K', 'L', 'H',
        'M', 'N', 'P', 'O',
      ]
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