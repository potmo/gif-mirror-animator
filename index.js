'use strict';

const path = require('path');

const colors = require('colors');
const disc_mapper = require('./disc-mapper');
const vector = require('./vector');

const image_loader = require('./image-loader');
const hex_converter = require('./hex-converter');
const sequence_builder = require('./sequence-builder');
const three_dee_generator = require('./3d-generator');

run()
  .then(()=>{
    console.log('done'.green);
    return process.exit(0);
  })
  .catch((err)=>{
    console.error(`${err.stack}`.red);
    return process.exit(1);
  });


 async function run() {
  
  const settings = getSettings();

  console.log('Load images'.brightBlue);
  let images = await image_loader.load(settings);

  console.log('Convert to hex'.brightBlue);
  let {frames, pixels, image_size, color_map} = await hex_converter.convert(settings, images);

  console.log('Build sequences'.brightBlue);
  let {sequences, sequence_keys, reverse_color_map} = await sequence_builder.build(settings, pixels, color_map, frames);

  console.log('Map to disc'.brightBlue);
  let mapping_conf = await disc_mapper.map(settings, pixels, sequences, sequence_keys, reverse_color_map, image_size, frames);

  console.log('Generate 3d files'.brightBlue);
  await three_dee_generator.generate(settings, mapping_conf);

  var hole_size_measurement = settings.three_dee.disc_diameter * (settings.output.disc_image.hole_size / settings.output.disc_image.width);
  console.log(`Disc section thickness: ${(settings.three_dee.disc_diameter - hole_size_measurement) / sequence_keys.length / 2}`.green);
  console.log(`Hole size radius: ${hole_size_measurement / 2}`.green)
  console.log(`Disc sections: ${sequence_keys.length}`.green)
  console.log(`Frames: ${frames}`.green);
  console.log(`Colors: ${Object.keys(reverse_color_map).length}`.green);

 }


 function getSettings() {
  let settings =  {
    input: {
      atlas: {
        path: './images/fruits/potato-tomato.png', 
        columns: 2, 
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
      duplicate_frames: 3, 
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
        max_deviation_from_optimal: 0,
        frame_number_scaling: 1,
      },
      disc_mappings: true,
      disc_image: {
        width: 2048,
        height: 2048,
        helix_shift: 1.2, // shifting every circle % of section arc length
        hole_size: 0,
      },
      svg: true,
      obj: true,
      mod: true,
      cnc: true, //TODO: Maybe these should have a scaling here instead
    },
    three_dee: {
      scale: 0.01, // dimensions in cm below this with this setting. Scaling it up to M for the output
      width_mirror_units: 90, //110 // the number of mirror pixels width
      height_mirror_units: 90,//110 // the number of mirror pixels height
      mirror_thickness: 0.2, 
      mirror_size: 1.05, // this is the diameter of the mirror
      mirror_padding: 0.25, // the padding between mirrors
      disc_offset: vector(150, 0, 200.0),
      disc_rotation_scalar: -0.25, // scalar of full circle around up axis
      disc_diameter: 249.0, 
      eye_offset: vector(-250, 0, 200.0),
    },
    optimization: {
      reuse_permutations: true,
      sort_sequnece: {
        algo: 'shannon', //none | shannon
        acending: true,
      },
      prune: {
        max_sequences: 10,//32
        comparator: 'color_distance', // 'color_distance' | 'sequence_string_distance'
        //min_usage: 4
      },
      pick_any_cycle: true,
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

  let project_name = path.basename(input, path.extname(input));
  console.log(`adding ${project_name} to ${settings.output.path}`.yellow)

  settings.output.path = path.join(settings.output.path, project_name);
  console.log(`modified output to ${settings.output}`.yellow)

  return settings;
 }