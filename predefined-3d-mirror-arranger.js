'use strict';

import colors from 'colors';
import vector from './vector.js';

export function* createReflectionsArrangement(settings, world_objects, pairs) {

    let upperLeft = world_objects.mirror_board.center
                    .add(world_objects.mirror_board.widthVector)
                    .add(world_objects.mirror_board.heightVector)
                    .scale(0.5)
                    .mult(-1);

    for (let x = 0; x < settings.input.mirrors.width; x++) {
        for (let y = 0; y < settings.input.mirrors.height; y++) {

            let id = x + y * settings.input.mirrors.width;

            let color_pair = pairs[id];

            if (color_pair == '___') {
                continue;
            }

            let aim_position = settings.input.fixed_palette.aim_positions[color_pair];


            if (!aim_position) {
                throw new Error(`no aim position for ${color_pair}`);
            }
            let target = aim_position.world_position;
            


            let midOffset = vector(x,y,0).sub(vector(settings.input.mirrors.width, settings.input.mirrors.height, 0).scale(0.5))
            let midDir = midOffset.normalized();

            let maxDist = vector(settings.input.mirrors.width, settings.input.mirrors.height, 0).mag();
            let dist = midOffset.mag();
            let scaledDist = (dist / maxDist);
            let depth = 1.0 - scaledDist;

            /*
            let parabola_center1 = vector(settings.input.mirrors.width * 0.25, settings.input.mirrors.height / 2, 0);
            let parabola_center2 = vector(settings.input.mirrors.width * 0.75, settings.input.mirrors.height / 2, 0);
            let parabola_center = null;
            if (parabola_center1.dist(vector(x,y,0)) < parabola_center2.dist(vector(x,y,0))) {
                parabola_center = parabola_center1;
            } else {
                parabola_center = parabola_center2;
            }
            
            let parabola_max_depth = 0.01; 
            let dist_to_middle = parabola_center.dist(vector(x,y,0));
            let dish_shape_pos = (Math.pow(dist_to_middle, 2) / 4.0 * parabola_max_depth) * 0.01;
            */
            

            let pos = upperLeft
                        .add(world_objects.mirror_board.widthVector.scale(x / settings.input.mirrors.width))
                        .add(world_objects.mirror_board.heightVector.scale(1 - y / settings.input.mirrors.height))
                        .add(vector(0,0,-settings.three_dee.mirror_thickness))
              //          .add(vector(0,0, dish_shape_pos));

            let eye_position = world_objects.eye.pos.add( aim_position.eye_offset ?? vector(0,0,0) );
            let mirror_to_eye = eye_position.sub(pos).normalized();
            let mirror_to_target = target.sub(pos).normalized();

            let normal = mirror_to_eye.add(mirror_to_target).normalized()
            
           // console.log(`creating ${id}`, pos)                    
            yield {
                mirror: {
                    pos: pos,
                    normal: normal,
                    width: settings.three_dee.mirror_diameter,
                    height: settings.three_dee.mirror_diameter,
                    thickness: settings.three_dee.mirror_thickness,
                    id: id,
                    grid: {
                        x,
                        y,
                    }
                },
                target: target,
                target_normal: vector(0, 0, 1),
                eye: {size: world_objects.eye.size, pos: eye_position},
                colors: [],
                color_keys: [],
            }
        }
    }
}