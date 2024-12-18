'use strict';

import path from 'path';
import colors from 'colors';
import fs from 'fs-extra';
import * as three_dee_generator from './3d-generator.js';
import * as wall_generator from './flat-wall-generator.js'
import * as mirror_arranger from './kaleidoscope-mirror-arranger.js';
import * as color_convert from  './color-convert.js';
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

  settings.three_dee.mirror_board_diameter = settings.input.mirrors.width * (settings.three_dee.mirror_diameter + settings.three_dee.mirror_padding);

  console.log('Create world objects'.brightBlue);
  const world_objects = three_dee_generator.getWorld3DObjects(settings, wall_generator);

  console.log(world_objects);

  console.log('Create reflections'.brightBlue);
  const reflections = Array.from(mirror_arranger.createReflectionsArrangement(settings, world_objects));
 
  // compute the mirror size
  

  //console.log(`Mirror diameter is ${settings.three_dee.mirror_board_diameter}`.blue);
  console.log('Generate 3d files'.brightBlue);

  await three_dee_generator.createSectionWithReflections(settings, world_objects, reflections);

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
      image: {
        paths: ['./images/tomtits_kaleidoscope/rainbow.png'], 
      },
      mirrors: {
        width: 80,
        height: 80,
      },
      fixed_palette: 
      {
        aim_positions: {        // HEAD DETERMINES DIR
          // for two color palette
          'AA': {color: 0xFF000000, positions: [{x: 300, y: 400 / 4 / 2}]}, 
          'BA': {color: 0xFFFFFFFF, positions: [{x: 300, y: 400 / 4 / 2 + 400 / 4}]}, 
          'AB': {color: 0xFFFF0000, positions: [{x: 300, y: 400 / 4 / 2 + (400 / 4) * 2}]}, 
          'BB': {color: 0xFF00FF00, positions: [{x: 300, y: 400 / 4 / 2 + (400 / 4) * 3}]}, 

          // for one color palette
          'A': {color: color_convert.RGBAtoARGB(0xFF0000FF), positions: [{x: 100, y: 100}]}, 
          'B': {color: color_convert.RGBAtoARGB(0xFF00FFFF), positions: [{x: 300, y: 100}]}, 
          'C': {color: color_convert.RGBAtoARGB(0xFFFF00FF), positions: [{x: 500, y: 100}]}, 
          'D': {color: color_convert.RGBAtoARGB(0x00FF00FF), positions: [{x: 100, y: 300}]}, 
          'E': {color: color_convert.RGBAtoARGB(0x0000FFFF), positions: [{x: 300, y: 300}]},         
          'F': {color: color_convert.RGBAtoARGB(0x00FFFFFF), positions: [{x: 500, y: 300}]}, 
        },
        path: './images/tomtits_kaleidoscope/rainbow.png',
      },
      duplicate_frames: 1, 
    },
    output: {
      path: './output/tomtits/kaleidoscope', // this is modified and the input name is added
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
      palette: {
        path: './palette',
        width: 1024,
        height: 1024,
        columns: 4,
        rows: 3,
      },
      heatmaps: {
        path: './heatmaps'
      },
      mirror_angle_deviations: {
        path: './image-deviations'
      },
    },
    three_dee: { // units in meters
      mirror_thickness: 0.001, 
      mirror_diameter: 0.03, // this is the diameter of the mirror
      mirror_padding: 0.0025, // the padding between mirrors
      mirror_board_diameter: undefined, // declared later programmatically
      wall_offset: vector(0.0, 0.0, 4.0),
      wall_rotation_scalar: 0.0, // scalar of full circle around up axis
      wall_vector: {
        up: vector(0,1,0),
        right: vector(1,0,0),
      },
      wall_width: 4,
      wall_height: 4,
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
      section_angles: true,
      reflection_visualizations: false,
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