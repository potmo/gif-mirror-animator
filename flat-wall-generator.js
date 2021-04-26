
import colors from 'colors';
import vector from './vector.js';

export function getWall(settings) {

  let wall = {};

  const wall_width = settings.three_dee.wall_diameter;
  const wall_height = settings.three_dee.wall_diameter;
  const wall_position = vector(0,0,0).add(settings.three_dee.wall_offset);
  
  const wall_width_vector = vector(wall_width, 0, 0)
                                    .rotatedAroundY(Math.PI * 2 * settings.three_dee.wall_rotation_scalar, vector(0, 0, 0));
  const wall_height_vector = vector(0, wall_height, 0)
                                    .rotatedAroundY(Math.PI * 2 * settings.three_dee.wall_rotation_scalar, vector(0, 0, 0));
  const wall_normal = wall_width_vector.normalized().cross(wall_height_vector.normalized());   



  wall.worldPosAtTextureCoord = (x,y) => {
    return wall_position.add(wall_width_vector.scale(x))
                        .add(wall_height_vector.scale(y))
  }

  wall.worldRightNormalAtTextureCoord = (x, y) => {
    // Rotate around the mirror pos that is impicitly 0,0,0
    return vector(wall_width, 0, 0)
      .rotatedAroundY(Math.PI * 2 * settings.three_dee.wall_rotation_scalar, vector(0, 0, 0))
      .normalized();
  }

  wall.worldUpNormalAtTextureCoord = (x, y) => {
    return vector(0, wall_height, 0)
      .rotatedAroundY(Math.PI * 2 * settings.three_dee.wall_rotation_scalar, vector(0, 0, 0))
      .normalized();
  }

  wall.worldNormalAtTextureCoord = (x, y) => {
    const right = wall.worldRightNormalAtTextureCoord(x,y);
    const up = wall.worldUpNormalAtTextureCoord(x,y);
    return right.normalized().cross(up.normalized());
  }

  wall.textureCoordAtWorldPos = (pos) => {
    const widthVector = vector(wall_width, 0, 0)
                              .rotatedAroundY(Math.PI * 2 * settings.three_dee.wall_rotation_scalar, vector(0, 0, 0));
    const heightVector = vector(0, wall_height, 0)
                              .rotatedAroundY(Math.PI * 2 * settings.three_dee.wall_rotation_scalar, vector(0, 0, 0));
    return {x : widthVector.normalized().dot(pos) / widthVector.mag(), y: heightVector.normalized().dot(pos) / heightVector.mag()}
  }

  return wall;

}