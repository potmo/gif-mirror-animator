'use strict';
const vector = require('./vector');
const colors = require('colors');

function generate(mirrors, reflections, photowall, eye, dimentions) {
	const program = Array.from(generateModule(mirrors)).join('\n');
	console.log(colors.green(`created gcode (.nc) file`));
	return program;
}

function* generateModule(mirrors) {

	const tool = 31;
	const tool_diameter = 6.0;

	yield `O1001 (TOP)`

	yield `(SETUP)`;
	yield `(G94 FEED PER MINUTE)`;
	yield `(G17 USE XY PLANE)`;
	yield `(G49 CANCEL TOOL OFFSET)`;
	yield `(G40 CANCEL CUTTER RADIUS COMPENSATION)`;
	yield `(G80 CANCEL CANNED CYCLES)`;
	yield `G90 G94 G17 G49 G40 G80;`;

	yield `(USE METRIC)`;
	yield `G21;`;

	//yield `(GO TO REFERENCE POSITION)`;
	//yield `G28 G91 X0. Y0. Z0.`;

	yield `(USE ABSOLUTE COORDINATES)`;
	yield `G90;`;

	yield `(CHANGE TO TOOL 2)`;
	yield `T${tool} M06;`;

	yield `(START SPINDLE 20K RPM)`; //TODO: A lot more. 22K max
	yield `S20000 M03;`;

	yield `(SET FEEDRATES)`;
	yield `G01 F10000;`;
	yield `G00 F10000;`;

	yield `(USE G55 WORK ZERO)`;
	yield `G55;`;

 	yield `(TURN SMOOTHING ON)`;
	yield `G5.1 Q1;`;				//TODO: Check if this is really right

	yield `(TOOL LENGTH COMPENSATION? UNCLEAR IF THIS IS NEEDED)`;
	yield `G43 Z0 H${tool};`;

	yield `(GO TO STARTING POSITION)`;
	yield `G00 X0. Y0. Z300. B0. C0.;`;	

	
	yield *indent('', generatePositions(mirrors, tool, tool_diameter));

	yield `(GO BACK TO STARTING POSITION)`;
	yield `G00 X0. Y0. Z300. B0. C0.;`;	


	yield `(TURN OFF COOLANT (M08 TURNS ON))`;
	yield `M09;`;


	yield `(USE ABSOLUTE POSITION)`;
	yield `G90;`;

	yield `(CANCEL TOOL OFFSET)`;
	yield `G49;`;
	
	yield `(TURN OFF SMOOTHING`;
	yield `G5.1 Q0;`;

	yield `(CANCEL ROTATED COORDINATE SYSTEM)`;
	yield `G69;`;

	//yield `(GO TO REFERENCE POSITION)`;
	//yield `G28 G91 X0. Y0. B0. C0.;`;

	yield `(REWIND COMMANDS AND END PROGRAM)`;
	yield `M30;`;

	yield ``; // Need ampty line at end
	
}

function* generatePositions(mirrors, tool, tool_diameter) {
	
	const clearence_height = 30.0
	// beware since this scale is depending on the scale that the 3d generator has 
	// that come from the settings
	const scale = 1000.0;

	const adjusted_mirrors = mirrors
		.sort( (a,b) => {
			if (a.pos.x != b.pos.y) {
				return a.pos.x - b.pos.x;
			}

			return b.pos.y - a.pos.y;
		})
		.map(mirror => {
		// scale from m to to mm
		const adjusted_pos = mirror.pos.scale(scale);

		return {
			pos: adjusted_pos,
			normal: mirror.normal,
			id: mirror.id,
			width: mirror.width * scale,
			height: mirror.height * scale
		};
	});

	const precision = 3;
	const globalUp = vector(0,1,0);
	const globalRight = vector(1,0,0);
	const globalDown = vector(0,0,1);

	for (let mirror of adjusted_mirrors) {

		yield `(START CIRCLE ${mirror.id})`;

		const feature_plane_method = 'points';


		if (feature_plane_method === 'points') {
			const right = globalUp.cross(mirror.normal).normalized().scale(mirror.width/2);
			const up = globalRight.cross(mirror.normal).normalized().scale(mirror.height/2).negated();

			const p0 = vector(0,0,0).toFixed(precision); // offset in feature plane from p1
			const p1 = mirror.pos.toFixed(precision); // first point. origin
			const p2 = mirror.pos.add(right).toFixed(precision); // second point defines x-axis
			const p3 = mirror.pos.add(up).toFixed(precision); // third point defines y-axis

			// THE Q0 ORIGIN IS IN THE NEW PLANES COORDINATE SYSTEM RELATIVE TO Q1.
			// Amount of shift from the first point to the origin of a feature coordinate system
			yield `G68.2 P2 Q0 X${p0.x} Y${p0.y} Z${p0.z} R0.;`; 
			// First point. (origin of a feature coordinate system)
			yield `G68.2 P2 Q1 X${p1.x} Y${p1.y} Z${p1.z};`;
			yield `G68.2 P2 Q2 X${p2.x} Y${p2.y} Z${p2.z};`;
			yield `G68.2 P2 Q3 X${p3.x} Y${p3.y} Z${p3.z};`;
		} else if (feature_plane_method === 'vectors') {
			const n = mirror.normal.normalized().toFixed(precision);
			const r = globalUp.cross(mirror.normal).normalized().toFixed(precision);
			const p = mirror.pos.toFixed(precision);
			yield `G68.2 P3 Q1 X${p.x} Y${p.y} Z${p.z} I${r.x} J${r.y} K${r.z};`;
			yield `G68.2 P3 Q2 I${n.x} J${n.y} K${n.z};`;
		}

		
		yield `G53.6 H${tool}; (ORIENT TOOL)`; // (G53.1 can be used but does not rotate around tool tip)
		
		//yield `G00 X0. Y0. Z${clearence_height.toFixed(precision)} (RAPID TO CLEARENCE HEIGHT)`;

		//yield `G43 H${tool} X0 Y0 Z0 (TOOL LENGTH COMPENSATION)`;

		// RAPID INTO CENTER
		//yield `G00 X${(mirror.width/2).toFixed(precision)} Y${(mirror.height/2).toFixed(precision)} Z${clearence_height.toFixed(precision)}; (RAPID INTO CENTER)`;
		yield `G00 X${(0).toFixed(precision)} Y${(0).toFixed(precision)} Z${clearence_height.toFixed(precision)}; (RAPID INTO CENTER)`;
		
		// FEED TO CUTTING DEPTH
		yield `G01 Z${(0).toFixed(precision)}; (FEED TO CUTTING DEPTH)`;

		// FEED TO START OF ARC
		yield `G01 Y${(mirror.height/2 - tool_diameter/2).toFixed(precision)}; (FEED TO START OF ARC)`;

		// CW CIRCULAR MOTION (IJ = DIST TO CENTER XY)
		yield `G02 I0. J${((mirror.height/2 - tool_diameter / 2)*-1 ).toFixed(precision)}; (CW CIRCULAR MOTION)`;

		// RAPID TO CLEARENCE HEIGHT
		yield `G00 Z${clearence_height.toFixed(precision)}; (RAPID TO CLEARENCE HEIGHT)`;

		yield `G69;  (CANCEL COORDINATE PLANE)`;

		yield `(END CIRCLE)`;
		yield ``;

	}
}

function* indent(indentation, generator) {
	for (let line of generator) {
		yield `${indentation}${line}`;
	}
}

module.exports = {
	generate,
}


