
import colors from 'colors';
import vector from './vector.js';

export function getWall(settings) {

  let wall = {};


  const wall_width = settings.three_dee.wall_diameter * settings.output.cylinder_image.diameter_scalar;
  const wall_height = settings.three_dee.wall_diameter;
  
  const wall_width_vector = vector(wall_width, 0, 0)
                                    .rotatedAroundY(Math.PI * 2 * settings.three_dee.wall_rotation_scalar, vector(0, 0, 0));
  const wall_height_vector = vector(0, 0, wall_height)
                                    .rotatedAroundY(Math.PI * 2 * settings.three_dee.wall_rotation_scalar, vector(0, 0, 0));
  const wall_normal = wall_width_vector.normalized().cross(wall_height_vector.normalized());   

  const wall_position = vector(0,0,0)
                          .add(settings.three_dee.wall_offset)


  wall.worldPosAtTextureCoord = (x,y) => {
    let normal = wall.worldNormalAtTextureCoord(x,y);
    var pos = wall_position.add(normal.scale(wall_width * 0.5))
                           .add(wall_height_vector.scale(y))

    return pos;
  }

  wall.worldRightNormalAtTextureCoord = (x, y) => {
    let normal = wall.worldNormalAtTextureCoord(x,y);
    return normal.rotatedAroundY(0.25, vector(0,0,0))
  }

  wall.worldUpNormalAtTextureCoord = (x, y) => {
    return vector(0, wall_height, 0)
      .rotatedAroundY(Math.PI * 2 * settings.three_dee.wall_rotation_scalar, vector(0, 0, 0))
      .normalized();
  }

  wall.worldNormalAtTextureCoord = (x, y) => {
    var rotation = x;
    return vector(1,0,0)
              .rotatedAroundZ(Math.PI * 2  * rotation, vector(0,0,0))
              .normalized()
  }

  wall.textureCoordAtWorldPos = (pos) => {
    /*
    const widthVector = vector(wall_width, 0, 0)
                              .rotatedAroundY(Math.PI * 2 * settings.three_dee.wall_rotation_scalar, vector(0, 0, 0));
    const heightVector = vector(0, wall_height, 0)
                              .rotatedAroundY(Math.PI * 2 * settings.three_dee.wall_rotation_scalar, vector(0, 0, 0));
    return {x : widthVector.normalized().dot(pos) / widthVector.mag(), y: heightVector.normalized().dot(pos) / heightVector.mag()}

    */

    const heightVector = vector(0, wall_height, 0)
                              .rotatedAroundY(Math.PI * 2 * settings.three_dee.wall_rotation_scalar, vector(0, 0, 0));
    let y = heightVector.normalized().dot(pos) / heightVector.mag();


    let normal = wall.worldNormalAtTextureCoord(0,0);
    let middle_to_pos = pos.sub(wall_position.add(heightVector.scale(y))); // vector from closest point on center axis to pos
    //var difference = middle_to_pos.angleBetween(normal);
    // if the axis y component is positive or negative determines if the angle is positive or negative
    //let x = -1 * difference.axis.y * difference.angle / Math.PI / 2; // convert angle to -0.5 to 0.5




    let angle = middle_to_pos.angleBetweenInXZPlane(normal);
    let x = angle / Math.PI / 2; // convert angle to -0.5 to 0.5    
      
    //console.log('angle', middle_to_pos.string(), normal.string(), angle, x)
    //console.log('normalized', middle_to_pos.normalized().string(), normal.normalized().string(), angle, x)
    
    return {x,y};

  }

/*

  Array.from({length: 51})
       .fill(0)
       .map( (_, i) => i / 50 - 0.5) 
       .forEach(x => {
          let pos = wall.worldPosAtTextureCoord(x, -0.5);
          let uv = wall.textureCoordAtWorldPos(pos);

          if (uv.x.toFixed(4) == x.toFixed(4)) {
            console.log(`Test (${x.toFixed(4)}, 0): ${pos.string()}, (${uv.x.toFixed(4)}, ${uv.y.toFixed(4)})`.green)  
          } else {
            console.log(`Test (${x.toFixed(4)}, 0): ${pos.string()}, (${uv.x.toFixed(4)}, ${uv.y.toFixed(4)})`.red)  
          }
          
       })
*/

  return wall;

}