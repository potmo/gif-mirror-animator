"use strict";

import fs from 'fs-extra';
import path from 'path';
import colors from 'colors';

export {
  extractSize
}

function extractSize(images) {
  let width = Math.min(...images.map((a)=> a.width));
  let height = Math.min(...images.map((a)=> a.height));
  return {width, height};
}