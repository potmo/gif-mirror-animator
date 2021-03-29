// Generated code -- http://www.redblobgames.com/grids/hexagons/
"use strict";



function Point(x, y) {
  return {
    x: x,
    y: y
  };
}

function Hex(q, r, s) {
  if (Math.round(q + r + s) !== 0) throw new Error("q + r + s must be 0");
  return {
    q: q,
    r: r,
    s: s
  };
}

function add(a, b) {
  return Hex(a.q + b.q, a.r + b.r, a.s + b.s);
}

function subtract(a, b) {
  return Hex(a.q - b.q, a.r - b.r, a.s - b.s);
}

function scale(a, k) {
  return Hex(a.q * k, a.r * k, a.s * k);
}

function rotate_left(a) {
  return Hex(-a.s, -a.q, -a.r);
}

function rotate_right(a) {
  return Hex(-a.r, -a.s, -a.q);
}

var directions = [Hex(1, 0, -1), 
                  Hex(1, -1, 0), 
                  Hex(0, -1, 1), 
                  Hex(-1, 0, 1), 
                  Hex(-1, 1, 0), 
                  Hex(0, 1, -1)];

function direction(dir) {
  return directions[dir];
}

function neighbor(hex, dir) {
  return add(hex, direction(dir));
}

var diagonals = [Hex(2, -1, -1), Hex(1, -2, 1), Hex(-1, -1, 2), Hex(-2, 1, 1), Hex(-1, 2, -1), Hex(1, 1, -2)];

function diagonal_neighbor(hex, dir) {
  return add(hex, diagonals[dir]);
}

function length(hex) {
  return (Math.abs(hex.q) + Math.abs(hex.r) + Math.abs(hex.s)) / 2;
}

function distance(a, b) {
  return length(subtract(a, b));
}

function move(from, dist, dir) {
  return add(from, scale(direction(dir), dist));
}

function round(h) {
  var qi = Math.round(h.q);
  var ri = Math.round(h.r);
  var si = Math.round(h.s);
  var q_diff = Math.abs(qi - h.q);
  var r_diff = Math.abs(ri - h.r);
  var s_diff = Math.abs(si - h.s);
  if (q_diff > r_diff && q_diff > s_diff) {
    qi = -ri - si;
  } else
  if (r_diff > s_diff) {
    ri = -qi - si;
  } else {
    si = -qi - ri;
  }
  return Hex(qi, ri, si);
}

function lerp(a, b, t) {
  return Hex(a.q * (1 - t) + b.q * t, a.r * (1 - t) + b.r * t, a.s * (1 - t) + b.s * t);
}

function linedraw(a, b) {
  var N = distance(a, b);
  var a_nudge = Hex(a.q + 0.000001, a.r + 0.000001, a.s - 0.000002);
  var b_nudge = Hex(b.q + 0.000001, b.r + 0.000001, b.s - 0.000002);
  var results = [];
  var step = 1.0 / Math.max(N, 1);
  for (var i = 0; i <= N; i++) {
    results.push(round(lerp(a_nudge, b_nudge, step * i)));
  }
  return results;
}

function ring(center, radius) {
  var results = []
  if (radius <= 0) throw new Error("radius must be > 0");
  var hex = add(center, scale(direction(4), radius));
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < radius; j++) {
      results.push(hex)
      hex = neighbor(hex, i)
    }
  }

  return results
}

function spiral_fill(center, radius) {
  let results = [center];
  for (let k = 1; k < radius; k++) {
    results.push(...ring(center, k));
  }
  return results
}

function spiral_fill_circle(center, radius) {
  // add twice as much radius as we have to
  let results = [center];
  for (let k = 1; k < radius * 2 ; k++) {
    results.push(...ring(center, k));
  }

  // trim off the overhangs
  let layout = Layout(layout_pointy, {x: 0.5, y: 0.5}, {x: radius, y: radius});
  results = results.filter(hex => {
    let pixel = to_pixel(layout, hex);

    let dist = Math.sqrt(Math.pow(pixel.x - radius, 2) + Math.pow(pixel.y - radius, 2));
    //console.log(pixel, radius, distance(hex, center), dist);
    //return true;
    return dist < radius * 0.7;//0.8659;
  });

  return results
}


function spiral(center, radius, skip) {
  let results = [center];
  for (let k = 2; k < radius; k += skip) {
    let hex = add(center, scale(direction(4), k));
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < k; j++) {
        if (!(i == 0 && j < skip)) {
          results.push(hex);
        }
        hex = neighbor(hex, i);
      }
    }
    for (let s = 0; s < skip; s++) {
      results.push(hex)
      hex = neighbor(hex, 5);
    }
  }

  // trim off the overhangs
  results = results.filter(hex => distance(hex, center) < radius);

  return results
}

function wedge(center, radius, dir) {
  var results = [center]
  for (let k = 1; k < radius; k++) {
    var hex = add(center, scale(direction(dir), k));
    for (let j = 0; j < k; j++) {
      results.push(hex)
      hex = neighbor(hex, (dir + 2) % 6);
    }
  }

  return results
}

function zoom(center, radius, skip) {
  let results = [];
  let hex = add(center, scale(direction(4), radius - 1));
  for (let k = 0; k < radius; k += skip) {
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < k; j++) {
        results.push(hex);
        hex = neighbor(hex, i);
      }
    }
  }
  return results
}


function OffsetCoord(col, row) {
  return {
    col: col,
    row: row
  };
}

var EVEN = 1;
var ODD = -1;

function qoffset_from_cube(offset, h) {
  var col = h.q;
  var row = h.r + (h.q + offset * (h.q & 1)) / 2;
  return OffsetCoord(col, row);
}

function qoffset_to_cube(offset, h) {
  var q = h.col;
  var r = h.row - (h.col + offset * (h.col & 1)) / 2;
  var s = -q - r;
  return Hex(q, r, s);
}

function roffset_from_cube(offset, h) {
  var col = h.q + (h.r + offset * (h.r & 1)) / 2;
  var row = h.r;
  return OffsetCoord(col, row);
}

function roffset_to_cube(offset, h) {
  var q = h.col - (h.row + offset * (h.row & 1)) / 2;
  var r = h.row;
  var s = -q - r;
  return Hex(q, r, s);
}



function Orientation(f0, f1, f2, f3, b0, b1, b2, b3, start_angle) {
  return {
    f0: f0,
    f1: f1,
    f2: f2,
    f3: f3,
    b0: b0,
    b1: b1,
    b2: b2,
    b3: b3,
    start_angle: start_angle
  };
}



function Layout(orientation, size, origin) {
  return {
    orientation: orientation,
    size: size,
    origin: origin
  };
}

var layout_pointy = Orientation(Math.sqrt(3.0), Math.sqrt(3.0) / 2.0, 0.0, 3.0 / 2.0, Math.sqrt(3.0) / 3.0, -1.0 / 3.0, 0.0, 2.0 / 3.0, 0.5);
var layout_flat = Orientation(3.0 / 2.0, 0.0, Math.sqrt(3.0) / 2.0, Math.sqrt(3.0), 2.0 / 3.0, 0.0, -1.0 / 3.0, Math.sqrt(3.0) / 3.0, 0.0);

function to_pixel(layout, h) {
  var M = layout.orientation;
  var size = layout.size;
  var origin = layout.origin;
  var x = (M.f0 * h.q + M.f1 * h.r) * size.x;
  var y = (M.f2 * h.q + M.f3 * h.r) * size.y;
  return Point(x + origin.x, y + origin.y);
}

function pixel_to_hex(layout, p) {
  var M = layout.orientation;
  var size = layout.size;
  var origin = layout.origin;
  var pt = Point((p.x - origin.x) / size.x, (p.y - origin.y) / size.y);
  var q = M.b0 * pt.x + M.b1 * pt.y;
  var r = M.b2 * pt.x + M.b3 * pt.y;
  return Hex(q, r, -q - r);
}

function corner_offset(layout, corner) {
  var M = layout.orientation;
  var size = layout.size;
  var angle = 2.0 * Math.PI * (M.start_angle - corner) / 6;
  return Point(size.x * Math.cos(angle), size.y * Math.sin(angle));
}

function polygon_corners(layout, h) {
  var corners = [];
  var center = to_pixel(layout, h);
  for (var i = 0; i < 6; i++) {
    var offset = corner_offset(layout, i);
    corners.push(Point(center.x + offset.x, center.y + offset.y));
  }
  return corners;
}


export {

  Point,

  Hex,
  add,
  subtract,
  scale,
  rotate_left,
  rotate_right,
  directions,
  direction,
  neighbor,
  diagonals,
  diagonal_neighbor,
  length,
  distance,
  round,
  lerp,
  linedraw,
  move,

  ring,
  spiral_fill,
  spiral_fill_circle,
  spiral,
  wedge,
  zoom,

  OffsetCoord,
  EVEN,
  ODD,
  qoffset_from_cube,
  qoffset_to_cube,
  roffset_from_cube,
  roffset_to_cube,

  Orientation,

  Layout,
  layout_pointy,
  layout_flat,
  to_pixel,
  pixel_to_hex,
  corner_offset,
  polygon_corners,

}