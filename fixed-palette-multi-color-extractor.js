"use strict";

import colors from 'colors';
import * as color_convert from './color-convert.js';

export {
  extractReverseColorMap
}

function extractReverseColorMap(settings) {
  const reverse_color_map = {}
  for (const key of Object.keys(settings.input.fixed_palette.aim_positions)){
    reverse_color_map[key] = settings.input.fixed_palette.aim_positions[key].colors;
  }
  return reverse_color_map;
}