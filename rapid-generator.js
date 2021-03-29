'use strict';
import Quaternion from 'quaternion';
import colors from 'colors';
import vector from './vector.js';


/*
• The origin is situated at the intersection of axis 1 and the base mountingsurface.
• The xy plane is the same as the base mounting surface.
• The x-axis points forwards.
• The y-axis points to the left (from the perspective of the robot).
• The z-axis points upwards.
*/

// thinking that the robot is on my left side makes coordinate system sane with Y to the front X right and Z up
// Quaternion.fromBetweenVectors(u, v)?
const referenceVector = [0,0,-1];

const fromWest = new Quaternion.fromBetweenVectors(referenceVector, [1, 0, 0]);
const fromEast = new Quaternion.fromBetweenVectors(referenceVector, [-1, 0, 0]);
const fromNorth = new Quaternion.fromBetweenVectors(referenceVector, [0, -1, 0]);
const fromSouth = new Quaternion.fromBetweenVectors(referenceVector, [0, 1, 0]);
const fromTop = new Quaternion.fromBetweenVectors(referenceVector, [0, 0, -1]);
const fromBottom = new Quaternion.fromBetweenVectors(referenceVector, [0, 0, 1]);

const middle = [1000, 1000, 1000];

function generate(mirrors, reflections, photowall, eye, dimentions) {
	const program = Array.from(generateModule(mirrors)).join('\n');
	console.log(colors.green(`created rapid (.mod) file`));
	return program;
}

function* generateModule(mirrors) {
	yield `MODULE MainModule`;
	// heldObject, fixed user coord used, name?, user coords, user rot, object coord, object rot
	yield `  PERS wobjdata platform := [ FALSE, TRUE, "", [ [800, 0, 600], [1, 0, 0 ,0] ], [ [0, 0, 0], [1, 0, 0 ,0] ] ];`
	// [is the robot holding the tool, [tool frame. [pos] and [orientation] in the wrist coordinate system], [weight of tool in [kg], [center of gravity of tool in wrist coordinate system], [The moments of inertia of the tool relative to its center of mass around the tool load coordinate axes in kgm2 . If all inertial components are defined as being 0 kgm2, the tool is handled as a point mass.]]
	yield `  PERS tooldata pen := [ TRUE, [[0, 0, 100], [1, 0, 0 ,0]], [0.8,[0, 0, 30], [1, 0, 0, 0], 0, 0, 0]];`;
	yield `  PROC main()`;
	yield `    ConfL\\Off;`;
	yield `    ConfJ\\Off;`;
	yield `    SingArea\\Wrist;`;
	yield *indent('    ', generatePositions(mirrors));
	yield `  ENDPROC`;
	yield `ENDMODULE`;
}

function* generatePositions(mirrors) {
	// robtarget
	// position, quaternion, the quadrant to start (-4...4), some conf (9E9 == null)
	// [x,y,z], [q1, q2, q3, q4], [n,n,n,n]

	const start_value = {
		min: {
			x: Number.MAX_VALUE,
			y: Number.MAX_VALUE,
		},
		max: {
			x: Number.MIN_VALUE,
			y: Number.MIN_VALUE,
		}
	};
	const min_max = mirrors.map( a => a.pos)
												 .reduce( (m, a) => {
												 		m.min.x = Math.min(m.min.x, a.x);
												 		m.min.y = Math.min(m.min.y, a.y);
												 		m.max.x = Math.max(m.max.x, a.x);
														m.max.y = Math.max(m.max.y, a.y);
														return m;
												 }, start_value);

	const size = {
		x: min_max.max.x - min_max.min.x,
		y: min_max.max.y - min_max.min.y,
	};

	// offset everything for the robot to have easier to reach
	const offset = vector(0, -size.y / 2, 0);

	const adjusted_mirrors = mirrors.map(mirror => {
		//offset (in cm) ands cale from cm to to mm
		const adjusted_pos = mirror.pos.add(offset).scale(10);
		return {
			pos: adjusted_pos,
			normal: mirror.normal,
			indexPos: mirror.indexPos,
		};
	});

	for (let mirror of adjusted_mirrors) {
		const normal_quaternion = new Quaternion.fromBetweenVectors(referenceVector, mirror.normal.array());
		const entry_pos = mirror.pos.add(mirror.normal.scale(50));
		const bore_pos = mirror.pos;
		yield `!!${mirror.pos.x}, ${mirror.pos.y};`;
		// move into position
		yield `MoveL [ [${entry_pos.string()}], [${normal_quaternion.string()}], [0, 0, 0, 0], [ 9E9, 9E9, 9E9, 9E9, 9E9, 9E9] ], v1000, fine, pen\\WObj:=platform;`;
		// plunge into material
		yield `MoveL [ [${bore_pos.string()}], [${normal_quaternion.string()}], [0, 0, 0, 0], [ 9E9, 9E9, 9E9, 9E9, 9E9, 9E9] ], v30, fine, pen\\WObj:=platform;`;
		// retract
		yield `MoveL [ [${entry_pos.string()}], [${normal_quaternion.string()}], [0, 0, 0, 0], [ 9E9, 9E9, 9E9, 9E9, 9E9, 9E9] ], v1000, fine, pen\\WObj:=platform;`;
		yield ``;
	}
}

function coordinateString(coordinate) {
	const precision = 3;
	return `[${coordinate[0].toFixed(precision)}, ${coordinate[1].toFixed(precision)}, ${coordinate[2].toFixed(precision)}]`;
}

function quaternionString(quaternion) {
	const precision = 3;
	const quat = quaternion.toVector();
	return `[${quat[0].toFixed(precision)}, ${quat[1].toFixed(precision)}, ${quat[2].toFixed(precision)}, ${quat[3].toFixed(precision)}]`;
}

function* indent(indentation, generator) {
	for (let line of generator) {
		yield `${indentation}${line}`;
	}
}

Quaternion.prototype.string = function(precision) {
	precision = precision | 3;
	const quat = this.toVector();
	return `${quat[0].toFixed(precision)}, ${quat[1].toFixed(precision)}, ${quat[2].toFixed(precision)}, ${quat[3].toFixed(precision)}`;
}


export {
	generate,
}