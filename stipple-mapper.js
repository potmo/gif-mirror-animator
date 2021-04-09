'use strict';

import Canvas from 'canvas';
const Image = Canvas.Image;
import fs from  'fs-extra';
import path from  'path';
import colors from  'colors';
import GIFEncoder from  'gifencoder';
import cliProgress from  'cli-progress';
import seedrandom  from 'seedrandom';

import * as color_convert from  './color-convert.js';
import {writeImage, writeImageSilent, getOutputImage} from './image-loader.js';

const rnd = seedrandom('This is the seed');

export {
  map,
}

async function map(settings, mirrors, reflections) {

  // shuffle reflections array
  for (let i = reflections.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [reflections[i], reflections[j]] = [reflections[j], reflections[i]];
  }


  var mapping = mirrors.map((mirror, i) => {
    const aim_position = reflections[i];
    return {
      mirror: {
        x: mirror.x,
        y: mirror.y,
      },
      palette: {
        x: aim_position.x,
        y: aim_position.y,
      }
    };
  })


  const mapping_conf = {
    mapping,
  }

  return mapping_conf;
}