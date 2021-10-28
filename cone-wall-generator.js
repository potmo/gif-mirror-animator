
import colors from 'colors';
import vector from './vector.js';

export function getWall(settings) {

  let wall = {};


  const wall_width = settings.three_dee.wall_diameter * settings.output.cylinder_image.diameter_scalar;
  const wall_width_top = settings.three_dee.wall_diameter * settings.output.cylinder_image.diameter_scalar_top;
  const wall_height = settings.three_dee.wall_diameter;
  
  const wall_height_vector = vector(0, 0, wall_height);
                                    
  

  const wall_position = vector(0,0,0)
                          .add(settings.three_dee.wall_offset)


  wall.worldPosAtTextureCoord = (x,y) => {

    let rotation = x;
    let normal = vector(1,0,0)
              .rotatedAroundZ(Math.PI * 2 * rotation + Math.PI * 2 * settings.three_dee.wall_roll_scalar, vector(0,0,0))
              .normalized()

    var pos = wall_position.add(normal.scale(wall_width * 0.5 * (1-y) + wall_width_top * 0.5 * y))
                           .add(wall_height_vector.scale(y))

    return pos;
  }


  wall.worldNormalAtTextureCoord = (x, y) => {
    // sample points counter clockwise as seen from direction opposing the normal
    // and figure out the normal from that
    const sample_dist = 0.001;
    const a = wall.worldPosAtTextureCoord(x,y - sample_dist);
    const b = wall.worldPosAtTextureCoord(x - sample_dist / 2, y + sample_dist / 2);
    const c = wall.worldPosAtTextureCoord(x + sample_dist / 2, y + sample_dist / 2);

    // find the normal of the face
    const dir = b.sub(a).cross( c.sub(a) );
    const normal = dir.normalized();
    return normal;
  }

  wall.textureCoordAtWorldPos = (pos) => {
  
    /*const heightVector = vector(0, wall_height, 0)
                              .rotatedAroundY(Math.PI * 2 * settings.three_dee.wall_rotation_scalar, vector(0, 0, 0));*/
    // project the position onto the height vector
    let y = wall_height_vector.normalized().dot(pos) / wall_height_vector.mag();

    let normal = wall.worldNormalAtTextureCoord(0, 0);
    let middle_to_pos = pos.sub(wall_position.add(wall_height_vector.scale(y))); // vector from closest point on center axis to pos
  
    let angle = middle_to_pos.angleBetweenInXYPlane(normal);
    let x = angle / Math.PI / 2; // convert angle to -0.5 to 0.5    
    
    return {x,y};

  }

  return wall;

}