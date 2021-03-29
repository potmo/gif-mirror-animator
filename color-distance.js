"use strict";

import * as color_convert from './color-convert.js';

// using DeltaE on CIELab internally
//https://stackoverflow.com/questions/13586999/color-difference-similarity-between-two-values-with-js
function distance(rgbA, rgbB) {

	// check exact same
	if (rgbA.r == rgbB.r && rgbA.g == rgbB.g && rgbA.b == rgbB.b) {
		return 0;
	}

  let labA = color_convert.ARGBObjecToLab(rgbA);
  let labB = color_convert.ARGBObjecToLab(rgbB);
  let deltaL = labA.l - labB.l;
  let deltaA = labA.a - labB.a;
  let deltaB = labA.b - labB.b;
  let c1 = Math.sqrt(labA.a * labA.a + labA.b * labA.b);
  let c2 = Math.sqrt(labB.a * labB.a + labB.b * labB.b);
  let deltaC = c1 - c2;
  let deltaH = deltaA * deltaA + deltaB * deltaB - deltaC * deltaC;
  deltaH = deltaH < 0 ? 0 : Math.sqrt(deltaH);
  let sc = 1.0 + 0.045 * c1;
  let sh = 1.0 + 0.015 * c1;
  let deltaLKlsl = deltaL / (1.0);
  let deltaCkcsc = deltaC / (sc);
  let deltaHkhsh = deltaH / (sh);
  let i = deltaLKlsl * deltaLKlsl + deltaCkcsc * deltaCkcsc + deltaHkhsh * deltaHkhsh;
  return i < 0 ? 0 : Math.sqrt(i);
}



export {
	distance
};