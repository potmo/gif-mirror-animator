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
  createReflectionSetupForMirror,
  getWorld3DObjects,
  convertTo3DWorldCoordinates,
  createMirrorLookingAt,
  createSection,
  createSectionWithReflections,
}

async function generate(settings, mappings, wall_generator) {

  const world_objects = getWorld3DObjects(settings, wall_generator);

  await createSection(settings, world_objects, mappings.mapping);
}

async function createSection(settings, world_objects, mappings) {

  const reflections = createReflections(settings, world_objects, mappings);
  return await createSectionWithReflections(settings, world_objects, reflections);

}

async function createSectionWithReflections(settings, world_objects, reflections) {
  //const rapidString = rapid.generate(reflections, wall, eye);
  //await saveFile(path.join(settings.output.path, `output.mod`), rapidString);

  //const gcodeString = gcode.generate(reflections, world_objects.wall, world_objects.eye);
  //await saveFile(path.join(settings.output.path, `output.cnc`), gcodeString);

  console.log(JSON.stringify(reflections[0], null, 2));

  const objString = objcode.generate(reflections, world_objects.wall, world_objects.eye, settings.three_dee.wall_face_divisions);
  await saveFile(path.join(settings.output.path, `output.obj`), objString);

  await reflection_visualizer.visualize(settings, reflections, world_objects.wall, world_objects.mirror_board);

  await reflection_visualizer.visualizeArrangement(settings, reflections, world_objects.mirror_board);

  await reflection_visualizer.visualizeMirrorColorGroups(settings, reflections, world_objects.mirror_board);

  await reflection_visualizer.visualizeMirrorAngleDeviations(settings, reflections, world_objects.mirror_board);

  await reflection_visualizer.visualizeMirrorColorGroupsCenterAndOptimal(settings, reflections, world_objects.mirror_board);


  printSize(reflections)


}

function createReflections(settings, world_objects, mappings) {

  const reflections = mappings.map((mapping,id) => {
    return createReflectionSetupForMirror(settings, world_objects, id, mapping.mirror, mapping.palette, mapping.palette.colors, mapping.string);
  })
  
  return reflections;
  
}

function createReflectionSetupForMirror(settings, world_objects, id, mirror_pixel_pos, target_palette_pos, colors, color_keys) {

  const three_dee = convertTo3DWorldCoordinates(settings, world_objects, mirror_pixel_pos, target_palette_pos, colors, color_keys);

  const mirror = createMirrorLookingAt(id++, 
                                      three_dee.mirror.pos, 
                                      world_objects.eye.pos, 
                                      three_dee.target.pos, 
                                      three_dee.mirror.width.mag(), 
                                      three_dee.mirror.thickness.mag());

  const ellipse_points = createReflectanceEllipsePoints(mirror, world_objects.eye.pos, three_dee.target, world_objects.wall);


  const reflection = {
    mirror: mirror, 
    target: three_dee.target.pos, 
    target_normal: three_dee.target.normal, 
    eye: world_objects.eye, 
    ellipse_points: ellipse_points, 
    colors: three_dee.mirror.colors.colors, 
    color_keys: three_dee.mirror.colors.key,
  };


  return reflection;

}

function getWorld3DObjects(settings, wall_generator) {

  let wall = wall_generator.getWall(settings)                                 

  const mirror_board = {
    widthVector: vector(settings.three_dee.mirror_board_diameter, 0, 0),
    heightVector: vector(0, settings.three_dee.mirror_board_diameter, 0),
    center: vector(0,0,0),
    normal: vector(0,0,1),
  }

  const eye = {
    pos: vector(0,0,0).add(settings.three_dee.eye_offset), 
    size: 0.1
  }

  return {
    eye, 
    mirror_board,
    wall
  }

}

function convertTo3DWorldCoordinates(settings, world_objects, mirror_pixel_pos, target_palette_pos, colors, color_keys) {

  const mirror_board = {
    widthVector: vector(settings.three_dee.mirror_board_diameter, 0, 0),
    heightVector: vector(0, settings.three_dee.mirror_board_diameter, 0),
    center: vector(0,0,0),
  }

  const eye = {
    pos: vector(0,0,0).add(settings.three_dee.eye_offset), 
    size: 0.1
  };


  const mirror_pos = vector(0,0,0).add(mirror_board.widthVector.scale(mirror_pixel_pos.x))
                                  .add(mirror_board.heightVector.scale(mirror_pixel_pos.y * -1))
                                  .add(vector(0, 0, -settings.three_dee.mirror_thickness))


  const mirror = {
    width: vector(settings.three_dee.mirror_diameter, 0, 0),
    height: vector(0, settings.three_dee.mirror_diameter, 0),
    thickness: vector(0, 0, -settings.three_dee.mirror_thickness),
    pos: mirror_pos,
    colors: {key: color_keys, colors},
  }

  const target = {
    pos: world_objects.wall.worldPosAtTextureCoord(target_palette_pos.x, target_palette_pos.y * -1),
    normal: world_objects.wall.worldNormalAtTextureCoord(target_palette_pos.x, target_palette_pos.y * -1),
  }

  return {
    mirror,
    target,
  }

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

function createMirrorLookingAt(id, mirrorPos, eye_pos, target, size, thickness) {

  const normal = mirrorPos.normalReflectingBetweenPoints(eye_pos, target);

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

