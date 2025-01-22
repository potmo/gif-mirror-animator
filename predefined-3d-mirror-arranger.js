'use strict';

import colors from 'colors';
import vector from './vector.js';

export function* createReflectionsArrangement(settings, world_objects, pairs) {

    let upperLeft = world_objects.mirror_board.widthVector
                    .add(world_objects.mirror_board.heightVector)
                    .scale(0.5)
                    .mult(-1);

    for (let x = 0; x < settings.input.mirrors.width; x++) {
        for (let y = 0; y < settings.input.mirrors.height; y++) {

            let id = x + y * settings.input.mirrors.width;

            let color_pair = pairs[id];
            let target = settings.input.fixed_palette.aim_positions[color_pair].world_position;


            let midOffset = vector(x,y,0).sub(vector(settings.input.mirrors.width, settings.input.mirrors.height, 0).scale(0.5))
            let midDir = midOffset.normalized();

            let maxDist = vector(settings.input.mirrors.width, settings.input.mirrors.height, 0).mag();
            let dist = midOffset.mag();
            let scaledDist = (dist / maxDist);
            let depth = 1.0 - scaledDist;
            

            let pos = upperLeft
                        .add(world_objects.mirror_board.widthVector.scale(x / settings.input.mirrors.width))
                        .add(world_objects.mirror_board.heightVector.scale(1 - y / settings.input.mirrors.height))
                        .add(vector(0,0,-settings.three_dee.mirror_thickness));

            let mirror_to_eye = world_objects.eye.pos.sub(pos).normalized();
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
                eye: world_objects.eye,
                colors: [],
                color_keys: [],
            }
        }
    }
}