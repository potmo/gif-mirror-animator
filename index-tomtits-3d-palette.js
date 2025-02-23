'use strict';

import path from 'path';
import colors from 'colors';
import fs from 'fs-extra';
import * as three_dee_generator from './3d-generator.js';
import * as wall_generator from './flat-wall-generator.js'
import * as mirror_arranger from './predefined-3d-mirror-arranger.js';
import * as color_convert from  './color-convert.js';
import * as color_extractor from './color-extractor.js';
import * as image_loader from './image-loader.js';
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
  const images = await image_loader.load(settings);
  //const [left, right] = images;

  for (var i = 0; i < images.length / settings.input.duplicate_frames; i++) {
    await image_loader.writeImage(path.join(settings.output.path, `input_${i}.png`), images[i]);
  }

  console.log('Extract palette'.brightBlue);
  const {color_map, pairs} = color_extractor.extractColorMapPairs(images);

  console.log(color_map);

  console.log('Palette colors'.yellow);
  for (let color in color_map) {
    let key = color_map[color];
    console.log(key, color_convert.toARGBObject(color));
  }

  console.log('Pair count'.yellow);
  let count = pairs.reduce((prev, curr) => { 
    prev[curr] = prev[curr] == undefined ? 0 : prev[curr] + 1
    return prev;
  }, {});

  for (let pair in count) {
    console.log(pair, count[pair]);
  }

  settings.three_dee.mirror_board_diameter = settings.input.mirrors.width * (settings.three_dee.mirror_diameter + settings.three_dee.mirror_padding);

  console.log('Create world objects'.brightBlue);
  const world_objects = three_dee_generator.getWorld3DObjects(settings, wall_generator);


  console.log('Create reflections'.brightBlue);
  const reflections = Array.from(mirror_arranger.createReflectionsArrangement(settings, world_objects, pairs));


  //console.log(`Mirror diameter is ${settings.three_dee.mirror_board_diameter}`.blue);
  console.log('Generate 3d files'.brightBlue);
  await three_dee_generator.createSectionWithReflections(settings, world_objects, reflections);


/*
  //compute the angles
  const wall_normal = vector(0,0,1);
  let angles = reflections.map( (reflection) => {
    //console.log(reflection);
    let normal = reflection.mirror.normal//.withX(0).normalized();
    let angle = Math.acos(wall_normal.dot(normal)) * 180 / Math.PI;
    console.log(`${angle}° ${normal} ${wall_normal}`);
    return angle;
  })
  .sort(function(a, b){return a - b});

  for (let angle of angles) {
    console.log(angle);
  }
  */

  let normalStrings = reflections.map( (reflection) => {
    let fixed = reflection.mirror.normal.toFixed(4);
    let grid = reflection.mirror.grid;
    return `{"mirror": 2, "x": ${grid.x}, "y": ${grid.y}, "normal": {"x": ${fixed.x}, "y": ${fixed.y}, "z": ${fixed.z}}}`
  })
  .join(',')

  console.log(`[\n${normalStrings}\n]`);
  

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
        paths: [
          './images/tomtits_002/small-bw-smiley01.png',
          './images/tomtits_002/small-bw-smiley02.png',
        ], 
      },
      mirrors: {
        width: 55,
        height: 55,
      },
      fixed_palette: 
      {
        aim_positions: {        // HEAD DETERMINES DIR
          // for one color palette
          'BB': {color: color_convert.RGBAtoARGB(0xFF0000FF), world_position: vector(4.718/2 + 4.718 / 10 - 4.718 / 5 * 1, 1.5, 3.3)}, 
          'BA': {color: color_convert.RGBAtoARGB(0xFF00FFFF), world_position: vector(4.718/2 + 4.718 / 10 - 4.718 / 5 * 2, 1.5, 3.3)}, 
          'AB': {color: color_convert.RGBAtoARGB(0xFFFF00FF), world_position: vector(4.718/2 + 4.718 / 10 - 4.718 / 5 * 4, 1.5, 3.3)}, 
          'AA': {color: color_convert.RGBAtoARGB(0x00FF00FF), world_position: vector(4.718/2 + 4.718 / 10 - 4.718 / 5 * 3, 1.5, 3.3)}, 

          // three color palette
          'AAA': {color: color_convert.RGBAtoARGB(0xFF0000FF), world_position: vector(-1.479, -2.0 + 1.0 + 1.0 * 0, 3.3)}, 
          'AAB': {color: color_convert.RGBAtoARGB(0xFF00FFFF), world_position: vector(-1.479, -2.0 + 1.0 + 1.0 * 1, 3.3)}, 
          'ABA': {color: color_convert.RGBAtoARGB(0xFF00FFFF), world_position: vector(-1.479, -2.0 + 1.0 + 1.0 * 2, 3.3)}, 
          'ABB': {color: color_convert.RGBAtoARGB(0xFF00FFFF), world_position: vector(-1.479, -2.0 + 1.0 + 1.0 * 3, 3.3)}, 
          'BAA': {color: color_convert.RGBAtoARGB(0xFFFF00FF), world_position: vector(+1.479, -2.0 + 1.0 + 1.0 * 0, 3.3)}, 
          'BAB': {color: color_convert.RGBAtoARGB(0x00FF00FF), world_position: vector(+1.479, -2.0 + 1.0 + 1.0 * 1, 3.3)}, 
          'BBA': {color: color_convert.RGBAtoARGB(0x00FF00FF), world_position: vector(+1.479, -2.0 + 1.0 + 1.0 * 2, 3.3)}, 
          'BBB': {color: color_convert.RGBAtoARGB(0x00FF00FF), world_position: vector(+1.479, -2.0 + 1.0 + 1.0 * 3, 3.3)}, 

        
        },
        path: './images/tomtits_kaleidoscope/rainbow.png',
      },
      duplicate_frames: 1, 
    },
    output: {
      path: './output/tomtits/3d-palette-smiley-feb-5', // this is modified and the input name is added
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
      mirror_diameter: 0.024, // this is the diameter of the mirror
      mirror_padding: 0.000, // the padding between mirrors
      mirror_board_diameter: undefined, // declared later programmatically
      mirror_board_offset: vector(-1.9, 0, 0),
      wall_offset: vector(0.0, 0.0, 4.0),
      wall_rotation_scalar: 0.0, // scalar of full circle around up axis
      wall_vector: {
        up: vector(0,1,0),
        right: vector(1,0,0),
      },
      wall_width: 4,
      wall_height: 4,
      wall_face_divisions: 50,
      eye_offset: vector(1.0, -0.34, 2.9),

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