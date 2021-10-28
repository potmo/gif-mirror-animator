"use strict";

import colors from 'colors';
import * as color_convert from './color-convert.js';

export {
  extractColorMap
}

function extractColorMap(settings) {
  return Object.keys(settings.input.fixed_palette.aim_positions).reduce((obj, key) => {
    let aim_position = settings.input.fixed_palette.aim_positions[key];
    let color = aim_position.color;
    obj[color] = key;
    return obj;
  }, {});
}