'use strict';

import colors from 'colors';
import vector from './vector.js';

export {
	generate,
}

function generate(reflections, wall, eye, wall_face_divisions) {
	const program = Array.from(createObjFile(reflections, wall, eye, wall_face_divisions)).join('\n');
	return program;
}

function * createObjFile(reflections, wall, eye, wall_face_divisions) {

  console.log('mirrors', reflections.length);

	var vertex = {current: 1};

  //#yield 'mtllib material.mtl';
  yield 's off';
  yield 'o mirror'

  var textures = getWallTextureMap(wall_face_divisions) 
  
  yield * convertTexturesToObj(textures);

  yield * convertMirrorsToObj(reflections, vertex);

  yield * convertWallToObj(wall, vertex, textures.wall_texture_ids);

  yield * convertEyeToObj(eye, vertex);

  yield * convertReflectionsToObj(reflections, vertex);

  yield * convertReflectionEllipsesToObj(reflections, vertex);

  yield * convertMirrorNormalsToObj(reflections, vertex);

  console.log(colors.green(`created mesh (.obj) file`));
}

function * convertTexturesToObj(textures) {
  for (var uv of textures.uv) {
    yield `vt ${uv.u.toFixed(5)} ${uv.v.toFixed(5)}`;
  } 
}

function getWallTextureMap(wall_face_divisions) {

  var output = {};

  output.uv = [
    {id: 1, u: 0, v: 1},
    {id: 2, u: 1, v: 1},
    {id: 3, u: 1, v: 0},
    {id: 4, u: 0, v: 0},
  ];

  var texture_id = output.uv[output.uv.length-1].id + 1;

  var grids = wall_face_divisions;
  var wall_texture_ids = Array.from({length: grids + 1}).fill(0).map( _ => Array.from({length: grids + 1}).fill(0));
  for (var i = 0; i < wall_texture_ids.length; i++) {
    for (var j = 0; j < wall_texture_ids[i].length; j++) {
      var u = i / grids;
      var v = j / grids;

      var id = texture_id++;
      output.uv.push({id, u, v});
      wall_texture_ids[i][j] = id;
    }
  }

  output.wall_texture_ids = wall_texture_ids;

  return output;
}

function * convertMirrorsToObj(reflections, vertex) {
  
  //#yield `usemtl mirror_face`;
  const mirrorFaces = reflections.map(r => r.mirror).map( mirror => getMirrorPolygons(mirror, vertex));

  // create vertices for the mirror
  for (const face of mirrorFaces) {
    yield * createMirrorVertices(face);
  }
  
  yield `g mirror_glass`;
  for (const face of mirrorFaces) {
    yield * createMirrorGlassFaces(face);
  }

  yield `g mirror_reflector`;
  for (const face of mirrorFaces) {
    yield * createMirrorReflectorFace(face);
  }
}

function getMirrorPolygons(mirror, vertex) {

  const globalUp = vector().globalUp;
  const globalRight = vector().globalRight;
  const globalDown = vector().globalDown;
  const right = globalUp.cross(mirror.normal).normalized().scale(mirror.width/2);
  const down = right.cross(mirror.normal).normalized().scale(mirror.height/2);


  const edges = 10;
	const bottom_vertices = enumerate(0, edges - 1)
		.map(i => Math.PI * 2 / edges * i - Math.PI / 2)
		.map(a => ({x: Math.cos(a) * 1, y: Math.sin(a) * 1}))
		.map(local_pos => mirror.pos.add(right.scale(local_pos.x)).add(down.scale(local_pos.y)))
		.map(pos => ({id: vertex.current++, pos}))

  const top_vertices = enumerate(0, edges - 1)
    .map(i => Math.PI * 2 / edges * i - Math.PI / 2)
    .map(a => ({x: Math.cos(a) * 1, y: Math.sin(a) * 1}))
    .map(local_pos => mirror.pos.add(right.scale(local_pos.x)).add(down.scale(local_pos.y)))
    // THE NORMALS ARE INVERTED SOMEHOW. THIS SHOULD NOT BE NEGATIVE TO GET TO THE TOP
    .map(pos => pos.add(mirror.normal.scale(mirror.thickness))) // TODO: THIS SHOULD BE PARAMETERIZED FROM SETTINGS. 
    .map(pos => ({id: vertex.current++, pos}));


  return {
      id: mirror.id,
      top_vertices,
      bottom_vertices,
    };
}


function * createMirrorVertices(face) {
  for (let vertex of face.bottom_vertices) {
		yield vertice(vertex.pos);
  }

  for (let vertex of face.top_vertices) {
    yield vertice(vertex.pos);
  }
}

function * createMirrorGlassFaces(mirror) {
	const top_verts = mirror.top_vertices.reverse().map((vert, i) => `${vert.id}/${i+1}`).join(' ');
  yield `f ${top_verts}`;

  const bottom_verts = mirror.bottom_vertices.map((vert, i) => `${vert.id}/${i+1}`).join(' ');
  yield `f ${bottom_verts}`;

  // sides
  const l = mirror.top_vertices.length;
  const tv = mirror.top_vertices.reverse();
  const bv = mirror.bottom_vertices;

  const sides = enumerate(0, l-1).map(i => {
    return `f ${tv[(i)%l].id}/1 ${tv[(i+1)%l].id}/2 ${bv[(i+1)%l].id}/3 ${bv[i%l].id}/4`
  }).join('\n');

  yield sides;
}

function * createMirrorReflectorFace(mirror) {
  const bottom_verts = mirror.bottom_vertices.reverse().map((vert, i) => `${vert.id}/${i+1}`).join(' ');
  yield `f ${bottom_verts}`;
}



function vertice(vector) {
  return `v ${vector.x.toFixed(5)} ${vector.y.toFixed(5)} ${vector.z.toFixed(5)}`;
}


function * convertMirrorNormalsToObj(reflections, vertex) {

  yield `g debug_mirror_normals`;
  const mirrors = reflections.map(r => r.mirror);
  for (let mirror of mirrors) {
    yield * convertMirrorNormalToObj(mirror, vertex);
  }
}

function * convertMirrorNormalToObj(mirror, vertex) {
  const normal = mirror.normal.scale(0.01);

  yield vertice(mirror.pos);
  yield vertice(mirror.pos.add(normal));
  yield `l ${vertex.current++} ${vertex.current++}`;

  const globalUp = vector().globalUp;
  const globalRight = vector().globalRight;
  const right = globalUp.cross(mirror.normal).normalized().scale(0.01);
  const up = globalRight.cross(mirror.normal).normalized().scale(0.01).negated();
  
  const p1 = mirror.pos;
  const p2 = mirror.pos.add(right.scale(0.3));
  const p3 = mirror.pos.add(up.scale(0.5));

  yield vertice(p1);
  yield vertice(p2);
  yield vertice(p3);

  let v1 = vertex.current++;
  let v2 = vertex.current++;
  let v3 = vertex.current++;
  yield `l ${v1} ${v2}`;
  yield `l ${v1} ${v3}`;


}

function * convertWallToObj(wall, vertex, wall_texture_ids) {

  const grids = wall_texture_ids.length - 1;
  var vertices = Array.from({length: grids + 1}).fill(0).map( _ => Array.from({length: grids + 1}).fill(0));

  yield `g wall`;

  for (var i = 0; i < grids + 1; i++) {
    for (var j = 0; j < grids + 1; j++) {
      var x = i / grids - 0.5;
      var y = j / grids - 0.5;
      const vert = vertice(wall.worldPosAtTextureCoord(x, y)); // lower left
      yield vert;
      var vertex_id = vertex.current++;
      vertices[i][j] = vertex_id;       
    }
  }

  for (var i = 0; i < grids; i++) {
    for (var j = 0; j < grids; j++) {
      var vertice_lower_left = vertices[i][j+1];
      var vertice_lower_right = vertices[i+1][j+1];
      var vertice_upper_right = vertices[i+1][j];
      var vertice_upper_left = vertices[i][j];

      var uv_lower_left = wall_texture_ids[i][j+1];
      var uv_lower_right = wall_texture_ids[i+1][j+1];
      var uv_upper_right = wall_texture_ids[i+1][j];
      var uv_upper_left = wall_texture_ids[i][j];

      yield `f ${vertice_lower_left}/${uv_lower_left} ${vertice_lower_right}/${uv_lower_right} ${vertice_upper_right}/${uv_upper_right} ${vertice_upper_left}/${uv_upper_left}`;
    }
  }

}

function * convertEyeToObj(eye, vertex) {
  const steps = 50;
  yield `g debug_eye`;
  //#yield `usemtl blue_line`;
  for (let i = 0; i < steps; i++) {
    const angle = Math.PI * 2 / steps * i;
    //const x = eye.pos.x + Math.cos(angle) * eye.size;
    //const y = eye.pos.y + Math.sin(angle) * eye.size;
    let pos = eye.pos.add(vector(Math.cos(angle), Math.sin(angle),0).scale(eye.size))
    yield vertice(pos);
    //yield `v ${x} ${y} ${eye.pos.z}`;
  }

  const segments = create(0, steps, ()=>{ return `${vertex.current++}`}).join(' ');
  yield `l ${segments}`;
}

function * convertReflectionsToObj(reflections, vertex) {
	yield `g debug_mirrorreflections`;
  //#yield `usemtl gray_line`;
  for (const reflection of reflections) {
    yield * convertMirrorReflectionToObj(reflection, vertex);
  }

	yield `g debug_eyereflections`;
  for (const reflection of reflections) {
    yield * convertEyeReflectionToObj(reflection, vertex);
  }
}

function * convertReflectionEllipsesToObj(reflections, vertex) {
  yield `g debug_mirrorreflectionellipses`;
  for (const reflection of reflections) {
    yield * convertEyeReflectionEllipseToObj(reflection, vertex);
  }
}

function * convertMirrorReflectionToObj(reflection, vertex) {
  //yield `v ${reflection.mirror.pos.x} ${reflection.mirror.pos.y} ${reflection.mirror.pos.z}`;
  yield vertice(reflection.mirror.pos);
  //yield `v ${reflection.target.x} ${reflection.target.y} ${reflection.target.z}`;
  yield vertice(reflection.target);
  yield `l ${vertex.current++} ${vertex.current++}`;
}

function * convertEyeReflectionToObj(reflection, vertex) {
  //yield `v ${reflection.eye.pos.x} ${reflection.eye.pos.y} ${reflection.eye.pos.z}`;
  yield vertice(reflection.eye.pos);
  //yield `v ${reflection.mirror.pos.x} ${reflection.mirror.pos.y} ${reflection.mirror.pos.z}`;
  yield vertice(reflection.mirror.pos);
  yield `l ${vertex.current++} ${vertex.current++}`;
}

function * convertEyeReflectionEllipseToObj(reflection, vertex) {
  
  if (!reflection.ellipse_points) {
    return;
  }

  for (var point of reflection.ellipse_points) {
    yield vertice(point);
  }
  let verts = reflection.ellipse_points.map( _ => `${vertex.current++}`).join(' ');
  yield `l ${verts}`;
}

function enumerate(from, to) {
  return Array(Math.abs(Math.max(to) - Math.min(from)) + 1)
        .fill()
        .map( (_, i , a) => from + (to - from) * (i / (a.length - 1)))
}

function create(from, to, callback) {
  let result = [];
  for (var i = from; i < to; i++) {
    result.push(callback(i));
  }
  return result;
}