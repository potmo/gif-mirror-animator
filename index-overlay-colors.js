'use strict';

import path from 'path';
import colors from 'colors';
import fs from 'fs-extra';
import * as mapper from './predifened-multi-color-position-mapper.js';
import * as image_loader from './image-loader.js';
import * as three_dee_generator from './3d-generator.js';
import * as hex_converter from './hex-converter.js';
import * as mirror_arranger from './mirror-square-arranger.js';
import * as arrangement_color_sampler from './mirror-arrangement-color-sampler.js';

import * as hex_image_arranger from './hex-multi-image-arranger.js'

import * as sequence_builder from './sequence-builder.js';
import * as wall_generator from './flat-wall-generator.js';
import * as color_extractor from './fixed-palette-multi-color-extractor.js';
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
  const reverse_color_map = color_extractor.extractReverseColorMap(settings);

  console.log('Extract size'.brightBlue);
  const image_size = image_size_extractor.extractSize(images);
  const arrangement_size = Math.max(image_size.width, image_size.height);
  settings.three_dee.mirror_board_diameter = arrangement_size * (settings.three_dee.mirror_diameter + settings.three_dee.mirror_padding);

  console.log('Convert to colorized hex mirrors'.brightBlue);
  let colored_pixels = await hex_image_arranger.arrange(settings, images, reverse_color_map, image_size);

  console.log('Color sequences'.brightBlue);
  const stats = colored_pixels
                .reduce((obj, curr) => {
                  let key = curr.pixel_colors;
                  if (obj[key]) {
                    obj[key].count++;
                    obj[key].pixels.push({x: curr.x, y: curr.y});
                  } else {
                    let colors = reverse_color_map[curr.pixel_colors];
                    let colors_strings = colors.map(color => color_convert.toConsoleString(color, ` `))
                    let hex_strings = colors.map(color => color_convert.toHexString(color))

                    obj[key] = {
                        key,
                        count: 1, 
                        colors, 
                        colors_strings,
                        hex_strings,
                        pixels: [{x: curr.x, y: curr.y}]
                      }
                  }
                  return obj;
                }, {})


  Object.values(stats)
        .sort((a,b) => b.count - a.count)
        .map((obj,i) => `${i}\t${obj.key} ${obj.colors_strings.join('')} ${obj.hex_strings.join(' ')} ${obj.count}`)
        .forEach(a => console.log(a))


  console.log('Map to wall'.brightBlue);
  let mapping_conf = await mapper.map(settings, wall_generator, colored_pixels, image_size);

  

  console.log('Generate 3d files'.yellow);
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

  const heat_map_dir = path.join(output_dir, settings.output.heatmaps.path);
  await fs.mkdirs(heat_map_dir);

  const mirror_angle_deviations_dir = path.join(output_dir, settings.output.mirror_angle_deviations.path);
  await fs.mkdirs(mirror_angle_deviations_dir);
  
  console.log(colors.yellow(`refreshed ${output_dir}`));
  await fs.writeFile(path.join(output_dir, 'settings.json'), JSON.stringify(settings, null, '  '));
  console.log(colors.yellow(`saved settings.js`));
}

function makeAimPositionPattern(fixed_palette) {


  const other_color_aims = Object.values(fixed_palette.aim_positions)
    .map(a => a.positions)
    .reduce((prev, curr) => prev.concat(curr), [])
  
  for(let x = 0; x < fixed_palette.size.width; x += fixed_palette.size.width / fixed_palette.additional_palette.rows) {
    for(let y = 0; y < fixed_palette.size.height; y += fixed_palette.size.height / fixed_palette.additional_palette.columns) {
      let too_close = other_color_aims.filter((aim) => {
        const dist = Math.sqrt(Math.pow(x - aim.x, 2) + Math.pow(y - aim.y, 2), 2);
        return dist < fixed_palette.additional_palette.min_distance;
      });
      if (too_close.length === 0) {
        fixed_palette.aim_positions['GY'].positions.push({x,y});  
      }
    }
  }
  return fixed_palette;
}


function getSettings() {
  let settings =  {
    input: {
      atlas: {
        path: './images/optim/party.png', 
        columns: 2, 
        rows: 1,
      },

      fixed_palette: makeAimPositionPattern(
      {
        aim_positions: {

          'YW': {colors: [0xfff000 | 0xFF000000, 0xfff000 | 0xFF000000], positions: [{x: 961, y: 332}, {x: 460, y: 310}, {x: 1250, y: 844}]},
          'GN': {colors: [0x09c900 | 0xFF000000, 0x09c900 | 0xFF000000], positions: [{x: 333, y: 666}, {x: 600 ,y:432}, {x: 1354, y: 506}]},
          'BK': {colors: [0x000000 | 0xFF000000, 0x000000 | 0xFF000000], positions: [{x: 1273, y: 389}, {x: 288, y: 500}, {x: 700, y: 791}, {x: 1560, y: 600}]},
          'RD': {colors: [0xdc0000 | 0xFF000000, 0xdc0000 | 0xFF000000], positions: [{x: 400, y: 430}, {x: 472, y: 724}, {x: 612, y: 574}, {x: 1498, y: 298}, {x: 946, y: 842}, {x: 1250, y: 700}]},
          'WT': {colors: [0xffffff | 0xFF000000, 0xffffff | 0xFF000000], positions: [{x: 500, y: 430}, {x: 812, y: 574}]},
          'BE': {colors: [0x003f89 | 0xFF000000, 0x003f89 | 0xFF000000], positions: [{x: 1055, y: 645}, {x: 800, y: 858}, {x:1352,y:881}]},
          'GY': {colors: [0x000000 | 0x00000000, 0x000000 | 0x00000000], positions: [] },
        },
        circle_diameter: 100,
        size: {
          width: 1760, 
          height: 1014,
        },
        additional_palette: {
          rows: 17,
          columns: 10,
          min_distance: 50,
        }
        //path: './images/optim/wave-guy-palette.png',
      },
      ),
      
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
      path: './output-overlay-colors', // this is modified and the input name is added
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
      heatmaps: {
        path: 'heatmaps'
      },
      mirror_angle_deviations: {
        path: 'mirror_angle_deviations'
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
      wall_offset: vector(0.0, 0.0, 0.20), //vector(2.00, 0.0, 2.00),
      wall_rotation_scalar: -0.0, // scalar of full circle around up axis
      //wall_diameter: 4.0,
      wall_width: 1.76,
      wall_height: 1.01,
      wall_face_divisions: 50,
      eye_offset: vector(0.0, 0.0, 2.00),

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