'use strict';

import fs from 'fs-extra';
import path from 'path';
import colors from 'colors';
import vector from './vector.js';
import * as rapid from './rapid-generator.js';
import * as gcode from './gcode-generator.js';
import * as objcode from './obj-generator.js';
import * as reflection_visualizer from './reflection-simulation-visualizer.js'


export {
  generate,
}

async function generate(settings, mappings, wall_generator) {

  let wall = wall_generator.getWall(settings)                                 
  
  const eye_offset = settings.three_dee.eye_offset;



  const mirror_diameter = settings.three_dee.mirror_diameter;
  const mirror_padding = settings.three_dee.mirror_padding;
  const mirror_thickness = settings.three_dee.mirror_thickness;
  const mirror_board_diameter = settings.three_dee.mirror_board_diameter;

  const mirror = {
    widthVector: vector(mirror_diameter, 0, 0),
    heightVector: vector(0, mirror_diameter, 0),
    thicknessVector: vector(0, 0, -mirror_thickness)
  }

  const mirror_board = {
    widthVector: vector(mirror_board_diameter, 0, 0),
    heightVector: vector(0, mirror_board_diameter, 0),
    center: vector(0,0,0),
  }

  const eye_position = vector(0,0,0).add(eye_offset);

  const eye = {pos: eye_position, size: 0.1};

  await createSection(settings, wall, mirror, mirror_board, eye, mappings.mapping);
}

async function createSection(settings, wall, mirror, mirror_board, eye, mappings) {

  // Note that all positions are sclars between -0.5 to 0.5

  let mirrors = [];
  let reflections = [];
  let id = 0;

  for (let mapping of mappings) {
    /*const target = wall.center.add(wall.widthVector.scale(mapping.palette.x))
                              .add(wall.heightVector.scale(mapping.palette.y * -1));*/

    const target_pos = wall.worldPosAtTextureCoord(mapping.palette.x, mapping.palette.y * -1)
    const target_normal = wall.worldNormalAtTextureCoord(mapping.palette.x, mapping.palette.y * -1);

    const target = {pos: target_pos, normal: target_normal}

    const mirrorPos = vector(0,0,0).add(mirror_board.widthVector.scale(mapping.mirror.x))
                                   .add(mirror_board.heightVector.scale(mapping.mirror.y * -1))
                                   .add(mirror.thicknessVector)

    const mirrorObj = createMirrorLookingAt(id++, mirrorPos, eye, target.pos, mirror.widthVector.mag(), mirror.thicknessVector.mag());
    mirrors.push(mirrorObj);

    // TODO: This should be changed
    const ellipse_points = createReflectanceEllipsePoints(mirrorObj, eye.pos, target, wall);

    const colors = mapping.palette.colors || [{r:255, g:255, b: 255, a: 255}];

    reflections.push({mirror: mirrorObj, target: target.pos, target_normal, eye, ellipse_points, colors, color_keys: mapping.string});
  }

  const rapidString = rapid.generate(mirrors, reflections, wall, eye);
  await saveFile(path.join(settings.output.path, `output.mod`), rapidString);

  const gcodeString = gcode.generate(mirrors, reflections, wall, eye);
  await saveFile(path.join(settings.output.path, `output.cnc`), gcodeString);

  const objString = objcode.generate(mirrors, reflections, wall, eye, settings.three_dee.wall_face_divisions);
  await saveFile(path.join(settings.output.path, `output.obj`), objString);

  await reflection_visualizer.visualize(settings, reflections, wall);

  await reflection_visualizer.visualizeArrangement(settings, reflections, mirror_board);

  await reflection_visualizer.visualizeMirrorColorGroups(settings, reflections, mirror_board);

  await reflection_visualizer.visualizeMirrorAngleDeviations(settings, reflections, mirror_board);

  await reflection_visualizer.visualizeMirrorColorGroupsCenterAndOptimal(settings, reflections, mirror_board);

  

  printSize(reflections)


}

function printSize(reflections) {
  let positions = reflections.map(r => r.mirror);
  let max_x = Math.max(...positions.map(p=>p.pos.x + p.width/2));
  let min_x = Math.min(...positions.map(p=>p.pos.x - p.width/2));

  let max_y = Math.max(...positions.map(p=>p.pos.y + p.height/2));
  let min_y = Math.min(...positions.map(p=>p.pos.y - p.height/2));

  console.log(`Mirrors width: ${max_x - min_x}, height: ${max_y - min_y}`.brightBlue)
}

function createReflectanceEllipsePoints(mirror, eye_pos, target, wall) {

  const right = vector().globalUp.cross(mirror.normal).normalized().scale(mirror.width/2);
  const down = right.cross(mirror.normal).normalized().scale(mirror.height/2);


  const edges = 50;
  const mirror_points = enumerate(0, edges - 1)
    .map(i => Math.PI * 2 / edges * i - Math.PI / 2)
    .map(a => ({x: Math.cos(a) * 1, y: Math.sin(a) * 1}))
    .map(local_pos => mirror.pos.add(right.scale(local_pos.x)).add(down.scale(local_pos.y)))

  // reflect the ray at all the edge of the mirror
  // this is a approximation by creating a plane at the point where the center of the ray hits the wall
  // and then the circle around that ray is calculated by intersecting them with the plane
  const ellipse_points = mirror_points.concat([mirror_points[0]]).map( pos => {
    let vector_to_mirror_edge = pos.sub(eye_pos).normalized();
    let approaching_vector = vector_to_mirror_edge.reflect(mirror.normal);
    let point_of_hit = pos.instesectsPlane(approaching_vector, target.pos, target.normal);
    return point_of_hit;
  });

  return ellipse_points;
}

function createMirrorLookingAt(id, mirrorPos, eye, target, size, thickness) {

  const normal = mirrorPos.normalReflectingBetweenPoints(eye.pos, target);

  return {
    pos: mirrorPos,
    normal,
    width: size,
    height: size,
    thickness,
    id: id,
  }
}

async function saveFile(file, string) {
  console.log(colors.yellow(`saved ${file}`));
  await fs.writeFile(path.join(path.resolve(), file), string);
}

async function loadJSONFile(file) {
  const content = await fs.readFile(path.join(path.resolve(), file));
  return JSON.parse(content);
}

function enumerate(from, to) {
  return Array(Math.abs(Math.max(to) - Math.min(from)) + 1)
        .fill()
        .map( (_, i , a) => from + (to - from) * (i / (a.length - 1)))
}

