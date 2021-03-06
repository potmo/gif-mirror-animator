'use strict';

import path from 'path';
import colors from 'colors';
import fs from 'fs-extra';
import * as disc_mapper from './disc-mapper.js';
import * as image_loader from './image-loader.js';
import * as hex_converter from './hex-converter.js';
import * as sequence_builder from './sequence-builder.js';
import * as three_dee_generator from './3d-generator.js';
import * as wall_generator from './flat-wall-generator.js'
import * as color_extractor from './color-extractor.js'
import * as image_size_extractor from './image-size-extractor.js';
import vector from './vector.js';

run()
  .then(()=>{
    console.log('done'.green);
    return process.exit(0);
  })
  .catch((err)=>{
    console.error(`${err.stack}`.red);
    return process.exit(1);
  });



 async function run(iteration) {
  
  const settings = getSettings();

  await prepareOutputDir(settings);

  await fs.writeFile(path.join(path.resolve(), path.join(settings.output.path, 'settings.json')), JSON.stringify(settings, null, '  '));
  console.log(colors.yellow(`saved settings.js`));


  console.log('Load images'.brightBlue);
  let images = await image_loader.load(settings);

  console.log('Save input images'.brightBlue);
  for (var i = 0; i < images.length / settings.input.duplicate_frames; i++) {
    await image_loader.writeImage(path.join(settings.output.path, `input_${i}.png`), images[i]);
  }
  
  console.log('Extract palette'.brightBlue);
  let color_map = color_extractor.extractColorMap(images);

  console.log('Extract size'.brightBlue);
  let image_size = image_size_extractor.extractSize(images);

  console.log('Convert to hex'.brightBlue);
  let {frames, pixels} = await hex_converter.convert(settings, images, color_map, image_size);

  console.log('Build sequences'.brightBlue);
  let {sequences, sequence_keys, reverse_color_map} = await sequence_builder.build(settings, pixels, color_map, frames);

  console.log('Map to disc'.brightBlue);
  let mapping_conf = await disc_mapper.map(settings, pixels, sequences, sequence_keys, reverse_color_map, image_size, frames);


  console.log('Generate 3d files'.brightBlue);
  const arrangement_size = Math.max(image_size.width, image_size.height);
  settings.three_dee.mirror_board_diameter = arrangement_size * (settings.three_dee.mirror_diameter + settings.three_dee.mirror_padding);
  await three_dee_generator.generate(settings, mapping_conf, wall_generator);

  var hole_size_measurement = settings.three_dee.disc_diameter * (settings.output.disc_image.hole_size / settings.output.disc_image.width);
  console.log(`Disc section thickness: ${(settings.three_dee.disc_diameter - hole_size_measurement) / sequence_keys.length / 2}`.green);
  console.log(`Hole size radius: ${hole_size_measurement / 2}`.green)
  console.log(`Disc sections: ${sequence_keys.length}`.green)
  console.log(`Frames: ${frames}`.green);
  console.log(`Colors: ${Object.keys(reverse_color_map).length}`.green);

 }

 async function prepareOutputDir(settings) {
  const output_dir = path.join(path.resolve(), settings.output.path);
  await fs.remove(output_dir);
  await fs.mkdirs(output_dir);

  
  
  console.log(colors.yellow(`refreshed ${output_dir}`));
  await fs.writeFile(path.join(output_dir, 'settings.json'), JSON.stringify(settings, null, '  '));
  console.log(colors.yellow(`saved settings.js`));
}




 function getSettings() {
  let settings =  {
    input: {
      atlas: {
        path: './images/tea-sun-lager5.png', 
        columns: 3, 
        rows: 1,
      },
      /*image: {
        paths: [
          './images/fruits/fastfood1.png', 
          './images/fruits/fastfood2.png',
        ],
      },
      /*image_and_rotate: {
        images: [
          { path: './images/fruits/fastfood1.png', rotation: Math.PI * 2 },
          { path: './images/fruits/fastfood2.png', rotation: Math.PI * 2 },
        ]
      }*/
      duplicate_frames: 4, 
    },
    output: {
      path: './output', // this is modified and the input name is added
      simulation: {
        gif: {
          width: 500,
          height: 500,
          frame_delay: 300,
          rotate: false,
        },
        discs: false,
        frames: true,
        hex: {
          enabled: true,
          width: 500,
          height: 500,
          mirror_size: 2.5,
        },
        ellipse_image_size: { 
          width: 1000,
          height: 1000,
        },
        mirror_image_size: {
          width: 1000, 
          height: 1000
        },
        max_deviation_from_optimal: 0,
        frame_number_scaling: 1,
      },
      disc_mappings: true,
      disc_image: {
        width: 2048,
        height: 2048,
        helix_shift: 0.03,//1.2, // shifting every circle % of section arc length
        hole_size: 0,
      },
      svg: true,
      obj: true,
      mod: true,
      cnc: true, //TODO: Maybe these should have a scaling here instead
    },
    three_dee: {
      mirror_thickness: 0.001, 
      mirror_diameter: 0.0105, // this is the diameter of the mirror
      mirror_padding: 0.0025, // the padding between mirrors
      mirror_board_diameter: undefined, // this is set programatically later
      wall_offset: vector(0.5, 0, 0.500),
      wall_rotation_scalar: -0.25, // scalar of full circle around up axis
      wall_diameter: 1.0, 
      eye_offset: vector(-1.0, 0, 1.00),
      wall_face_divisions: 10,
    },
    optimization: {
      reuse_permutations: true,
      sort_sequnece: {
        algo: 'shannon', //none | shannon
        acending: true,
      },
      prune: {
        max_sequences: 100,//32
        comparator: 'color_distance', // 'color_distance' | 'sequence_string_distance'
        //min_usage: 4
      },
      pick_any_cycle: false,
      shift_sequences: {
        /*0: +1,
        8: +2,
        9: +2,
        10: +2,*/
      }
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