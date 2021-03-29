const fs = require('fs-extra')
const path = require('path');
const colors = require('colors');
const vector = require('./vector');
const rapid = require('./rapid-generator');
const gcode = require('./gcode-generator');
const objcode = require('./obj-generator');

module.exports = {
  generate,
}

/*
run()
  .then(()=>{
    console.log(colors.green('done'))
  })
  .catch((err)=>{
    console.error(colors.red(err.stack));
    return process.exit(1);
  });
  


async function run() {

  const mappings = await loadJSONFile('output/straight-disc-mappings.json');
  await generate(mappings);
}
*/

async function generate(settings, mappings) {

  console.log('Creating 3d files with settings')
  console.log(` scale: ${settings.three_dee.scale}`.gray);
  console.log(` width_mirror_units: ${settings.three_dee.width_mirror_units}`.gray);
  console.log(` height_mirror_units: ${settings.three_dee.height_mirror_units}`.gray);
  console.log(` mirror_thickness: ${settings.three_dee.mirror_thickness}`.gray);
  console.log(` mirror_size: ${settings.three_dee.mirror_size}`.gray);
  console.log(` mirror_padding: ${settings.three_dee.mirror_padding}`.gray);
  console.log(` disc_distance: ${settings.three_dee.disc_distance}`.gray);
  console.log(` eye_distance: ${settings.three_dee.eye_distance}`.gray);
  console.log(` disc_diameter: ${settings.three_dee.disc_diameter}`.gray);

  const scale = settings.three_dee.scale; //0.01;
  const width = settings.three_dee.width_mirror_units;
  const height = settings.three_dee.height_mirror_units;
  const thickness = settings.three_dee.mirror_thickness * scale;
  const mirror_size = settings.three_dee.mirror_size * scale;
  const mirror_padding = settings.three_dee.mirror_padding * scale;
  
  const sectionSize = mappings.mirror.width; // can be less. Is the number of pixels per section


  //TODO:


  // IT SEEMS LIKE THE MIRROR NORMALS ARE INVERTED

  //

  const dimentions = {width, height, mirror_size, padding: mirror_padding, thickness};

  const eye_offset = settings.three_dee.eye_offset.scale(scale);

  const photowallWidth = settings.three_dee.disc_diameter * scale; // could be mappings.palette.width but lets skip that for now
  const photowallHeight = settings.three_dee.disc_diameter * scale;

  const photowall_position = /*vector(width * (mirror_size + mirror_padding) * 0.5, 
                                    height * (mirror_size + mirror_padding) * 0.5, 
                                    0)*/
                                vector(0,0,0).add(settings.three_dee.disc_offset.scale(scale));
  
  
  const photowall_width_vector = vector(photowallWidth, 0, 0)
                                    .rotatedAroundY(Math.PI * 2 * settings.three_dee.disc_rotation_scalar, vector(0, 0, 0));
  const photowall_height_vector = vector(0, photowallHeight, 0)
                                    .rotatedAroundY(Math.PI * 2 * settings.three_dee.disc_rotation_scalar, vector(0, 0, 0));

  const photowall = {
    upperLeft: photowall_position.add(photowall_width_vector.scale(-0.5)).add(photowall_height_vector.scale(-0.5)),
    upperRight: photowall_position.add(photowall_width_vector.scale(0.5)).add(photowall_height_vector.scale(-0.5)),
    lowerRight: photowall_position.add(photowall_width_vector.scale(0.5)).add(photowall_height_vector.scale(0.5)),
    lowerLeft: photowall_position.add(photowall_width_vector.scale(-0.5)).add(photowall_height_vector.scale(0.5)),
    widthVector: photowall_width_vector,
    heightVector:  photowall_height_vector,
  };

  const mirror = {
    widthVector: vector(width, 0, 0).scale(mirror_size + mirror_padding),
    heightVector: vector(0, height, 0).scale(mirror_size + mirror_padding),
    thicknessVector: vector(0, 0, -thickness),
    upperLeft: vector(0, 0, 0),
  }

  const eye_position = /*vector(width * (mirror_size + mirror_padding) * 0.5, 
                              height * (mirror_size + mirror_padding) * 0.5, 
                              0)*/
                        vector(0,0,0)
                          .add(eye_offset);
  const eye = {pos: eye_position, size: 1 * scale};

  await createSection(settings, photowall, mirror, dimentions, eye, mappings.mapping);
}

async function createSection(settings, photowall, mirror, dimentions, eye, mappings) {

  let mirrors = [];
  let reflections = [];
  let id = 0;

  for (let mapping of mappings) {
    const target = photowall.upperLeft.add(photowall.widthVector.scale(mapping.palette.x))
                                      .add(photowall.heightVector.scale(mapping.palette.y));
/*
    let x = id % 7;
    let y = Math.floor(id / 7);

    const target = photowall.upperLeft.add(photowall.widthVector.scale(0.4))
                                      .add(photowall.heightVector.scale(0.4))
                                      .add(photowall.widthVector.scale(0.2).scale(x / 7))
                                      .add(photowall.heightVector.scale(0.2).scale(y  / 7))*/

    const mirrorPos = mirror.upperLeft.add(mirror.widthVector.scale(mapping.mirror.x))
                                      .add(mirror.heightVector.sub(mirror.heightVector.scale(mapping.mirror.y)))
                                      .add(mirror.thicknessVector)
                                      .add(mirror.widthVector.scale(-0.5))
                                      .add(mirror.heightVector.scale(-0.5))

    const mirrorObj = createMirrorLookingAt(id++, mirrorPos, eye, target, dimentions.mirror_size);
    mirrors.push(mirrorObj);
    reflections.push({mirror: mirrorObj, target, eye});
  }

  const rapidString = rapid.generate(mirrors, reflections, photowall, eye, dimentions);
  await saveFile(path.join(settings.output.path, `output.mod`), rapidString);

  const gcodeString = gcode.generate(mirrors, reflections, photowall, eye, dimentions);
  await saveFile(path.join(settings.output.path, `output.cnc`), gcodeString);

  const objString = objcode.generate(mirrors, reflections, photowall, eye, dimentions);
  await saveFile(path.join(settings.output.path, `output.obj`), objString);

  
  let l = mirrors.length;
  let {0 : minX, [l - 1] : maxX} = mirrors.sort((a,b) => a.pos.x - b.pos.x).map((a) => a.pos.x);
  let {0 : minY, [l - 1] : maxY} = mirrors.sort((a,b) => a.pos.y - b.pos.y).map((a) => a.pos.y);

  console.log(colors.brightBlue(`X: ${minX}-${maxX}`));
  console.log(colors.brightBlue(`Y: ${minY}-${maxY}`));
  console.log(colors.brightBlue(`Mirror size: ${mirrors[0].width}x${mirrors[0].height}`));
  console.log(colors.brightBlue(`number of mirrors: ${mirrors.length}`));

}



function createMirrorLookingAt(id, mirrorPos, eye, target, size) {

  let mirrorToEye = eye.pos.sub(mirrorPos).normalized();
  let mirrorToTarget = target.sub(mirrorPos).normalized();
  let normal = mirrorToEye.add(mirrorToTarget).normalized();
  //let normalTarget = eye.sub(target).mult(0.5).add(target);

  //let normal = normalTarget.sub(mirrorPos).normalized();

  return {
    pos: mirrorPos,
    normal: normal,
    width: size,
    height: size,
    id: id
  }
}

async function saveFile(file, string) {
  console.log(colors.yellow(`saved ${file}`));
  await fs.writeFile(path.join(__dirname, file), string);
}

async function loadJSONFile(file) {
  const content = await fs.readFile(path.join(__dirname, file));
  return JSON.parse(content);
}

