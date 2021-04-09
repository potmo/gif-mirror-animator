function imageDataToARGBObjectArray(imageData) {
  let output = [];

  for (var i = 0; i < imageData.length; i += 4) {
    let r = imageData[i + 0];
    let g = imageData[i + 1];
    let b = imageData[i + 2];
    let a = imageData[i + 3];
    output.push({a, r, g, b});
  }
  return output;
}

function toHexString(color) {
	  color >>>= 0;
	  return '0x' + `00000000${color.toString(16)}`.slice(-8);
   // var b = color & 0xFF,
   //     g = (color & 0xFF00) >>> 8,
   //     r = (color & 0xFF0000) >>> 16,
   //     a = ( (color & 0xFF000000) >>> 24 ) / 255 ;
   // return `0x${a.toString(16)}${r.toString(16)}${g.toString(16)}${b.toString(16)}`;
}

function ABGRtoARGB(abgr) {
	// first shift zero to the right to get unsigned int
	const red = ((abgr >>> 0) & 0x000000FF) >>> 0;
	const green = ((abgr >>> 0) & 0x0000FF00) >>> 8;
	const blue = ((abgr  >>> 0) & 0x00FF0000) >>> 16;
	const alpha = ((abgr  >>> 0) & 0xFF000000) >>> 24;
	return (alpha << 24 | red << 16 | green << 8 | blue) >>> 0;
}

function objToARGB(obj) {
	return (obj.a << 24 | obj.r << 16 | obj.g << 8 | obj.b) >>> 0;	
}

function ARGBtoABGR(argb) {
	// first shift zero to the right to get unsigned int
	const red = ((argb >>> 0) & 0x00FF0000) >>> 16;
	const green = ((argb >>> 0) & 0x0000FF00) >>> 8;
	const blue = ((argb  >>> 0) & 0x000000FF) >>> 0;
	const alpha = ((argb  >>> 0) & 0xFF000000) >>> 24;
	return (alpha << 24 | blue << 16 | green << 8 | red) >>> 0;
}

function toARGBObject(argb) {
	const a = ((argb  >>> 0) & 0xFF000000) >>> 24;
	const r = ((argb >>> 0) & 0x00FF0000) >>> 16;
	const g = ((argb >>> 0) & 0x0000FF00) >>> 8;
	const b = ((argb  >>> 0) & 0x000000FF) >>> 0;
	return {a, r, g, b};
}

function paramsToHex(a,r,g,b) {
	let color = (a << 24) | (r << 16) | (g << 8) | (b << 0)
	return toHexString(color);
}

function paramsToCss(a,r,g,b) {
	let color = (a << 24) | (r << 16) | (g << 8) | (b << 0)
	return toCSS(color);
}

function ARGBObjecToLab(rgb){
  let r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255, x, y, z;
  r = (r > 0.04045) ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = (g > 0.04045) ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = (b > 0.04045) ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
  x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
  y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000;
  z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
  x = (x > 0.008856) ? Math.pow(x, 1/3) : (7.787 * x) + 16/116;
  y = (y > 0.008856) ? Math.pow(y, 1/3) : (7.787 * y) + 16/116;
  z = (z > 0.008856) ? Math.pow(z, 1/3) : (7.787 * z) + 16/116;
  return {l: (116 * y) - 16, a: 500 * (x - y), b: 200 * (y - z)};
}


function ARGBObjectToHexString(obj) {
	let color = (obj.a << 24) | (obj.r << 16) | (obj.g << 8) | (obj.b << 0)
	return toHexString(color);
}

function toCSS(argb) {
	const color = toARGBObject(argb);
	return `rgba(${color.r},${color.g},${color.b},${color.a})`;
}

function toConsoleString(color, string) {
  let obj = toARGBObject(color);
  return "\x1B[48;2;"+obj.r+";"+obj.g+";"+obj.b+"m" + string + '\x1B[49m';
}

export {
  imageDataToARGBObjectArray,
  toConsoleString,
  toHexString,
  ABGRtoARGB,
  ARGBtoABGR,
  toARGBObject,
  toCSS,
  ARGBObjectToHexString,
  paramsToHex,
  paramsToCss,
  objToARGB,
  ARGBObjecToLab
}