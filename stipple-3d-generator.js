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

async function generate(settings, mappings) {

  const eye_offset = settings.three_dee.eye_offset;

  const wall_width = settings.three_dee.wall_diameter;
  const wall_height = settings.three_dee.wall_diameter;
  const wall_position = vector(0,0,0).add(settings.three_dee.wall_offset);
  
  const wall_width_vector = vector(wall_width, 0, 0)
                                    .rotatedAroundY(Math.PI * 2 * settings.three_dee.wall_rotation_scalar, vector(0, 0, 0));
  const wall_height_vector = vector(0, wall_height, 0)
                                    .rotatedAroundY(Math.PI * 2 * settings.three_dee.wall_rotation_scalar, vector(0, 0, 0));
  const wall_normal = wall_width_vector.normalized().cross(wall_height_vector.normalized());                                    

  const wall = {
    upperLeft: wall_position.add(wall_width_vector.scale(-0.5)).add(wall_height_vector.scale(-0.5)),
    upperRight: wall_position.add(wall_width_vector.scale(0.5)).add(wall_height_vector.scale(-0.5)),
    lowerRight: wall_position.add(wall_width_vector.scale(0.5)).add(wall_height_vector.scale(0.5)),
    lowerLeft: wall_position.add(wall_width_vector.scale(-0.5)).add(wall_height_vector.scale(0.5)),
    widthVector: wall_width_vector,
    heightVector:  wall_height_vector,
    center: wall_position,
    normal: wall_normal,
  };


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
    const target = wall.center.add(wall.widthVector.scale(mapping.palette.x))
                              .add(wall.heightVector.scale(mapping.palette.y * -1));


    const mirrorPos = vector(0,0,0).add(mirror_board.widthVector.scale(mapping.mirror.x))
                                   .add(mirror_board.heightVector.scale(mapping.mirror.y * -1))
                                   .add(mirror.thicknessVector)

    const mirrorObj = createMirrorLookingAt(id++, mirrorPos, eye, target, mirror.widthVector.mag(), mirror.thicknessVector.mag());
    mirrors.push(mirrorObj);

    const ellipse_points = createReflectanceEllipsePoints(mirrorObj, eye.pos, target, wall.center, wall.normal);

    reflections.push({mirror: mirrorObj, target, eye, ellipse_points});
  }

  const rapidString = rapid.generate(mirrors, reflections, wall, eye);
  await saveFile(path.join(settings.output.path, `output.mod`), rapidString);

  const gcodeString = gcode.generate(mirrors, reflections, wall, eye);
  await saveFile(path.join(settings.output.path, `output.cnc`), gcodeString);

  const objString = objcode.generate(mirrors, reflections, wall, eye);
  await saveFile(path.join(settings.output.path, `output.obj`), objString);

  await reflection_visualizer.visualize(settings, reflections, wall);

  await reflection_visualizer.visualizeArrangement(settings, reflections, mirror_board);


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

function createReflectanceEllipsePoints(mirror, eye_pos, target_pos, wall_pos, wall_normal) {
  
  const right = vector().globalUp.cross(mirror.normal).normalized().scale(mirror.width/2);
  const down = right.cross(mirror.normal).normalized().scale(mirror.height/2);


  const edges = 50;
  const mirror_points = enumerate(0, edges - 1)
    .map(i => Math.PI * 2 / edges * i - Math.PI / 2)
    .map(a => ({x: Math.cos(a) * 1, y: Math.sin(a) * 1}))
    .map(local_pos => mirror.pos.add(right.scale(local_pos.x)).add(down.scale(local_pos.y)))

  // reflect the ray at all the edge of the mirror
  const ellipse_points = mirror_points.concat([mirror_points[0]]).map( pos => {
    let vector_to_mirror_edge = pos.sub(eye_pos).normalized();
    let approaching_vector = vector_to_mirror_edge.reflect(mirror.normal);
    let point_of_hit = pos.instesectsPlane(approaching_vector, wall_pos, wall_normal);
    return point_of_hit;
  });

  return ellipse_points;
}

function createMirrorLookingAt(id, mirrorPos, eye, target, size, thickness) {

  const normal = mirrorPos.normalReflectingBetweenPoints(eye.pos, target);

  return {
    pos: mirrorPos,
    normal: normal,
    width: size,
    height: size,
    thickness: thickness,
    id: id,
  }
}

function createReflectionCone(id, mirrorPos, eye, target, size) {

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

