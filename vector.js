import vectors from 'vectors';
const add = vectors.add(3);
const copy = vectors.copy(3);
const cross = vectors.cross(3);
const dist = vectors.dist(3);
const div = vectors.div(3);
const dot = vectors.dot(3);
const mag = vectors.mag(3);
const mult = vectors.mult(3);
const normalize = vectors.normalize(3);
const sub = vectors.sub(3);

'use strict'
class Vector {
	constructor(x,y,z) {
		this.x = x || 0;
		this.y = y || 0;
		this.z = z || 0;
	}
}

export default vector;

Vector.prototype.globalUp = vector(0,1,0);
Vector.prototype.globalRight = vector(1,0,0);
Vector.prototype.globalDown = vector(0,0,1);


Vector.prototype.print = function() {
	return `{x: ${this.x}, y: ${this.y}, z: ${this.z}}`;
}

Vector.prototype.reflect = function(normal) {
	const n = normal.normalized()
	// 𝑟=𝑑−2(𝑑⋅𝑛)𝑛
	return this.add(n.scale(-2 * this.dot(n)))
	//return this.sub(this.dot(n).scale(2).mult(n));
}

Vector.prototype.instesectsPlane = function(lineDirection, planePoint, planeNormal) {
	const linePoint = this;
 	if (planeNormal.dot(lineDirection.normalized()) == 0) {
 		throw new Error(`ray and plane is paralell so no intersection ${planeNormal.string()} and ${lineDirection.string()}`);
		return null;
	}
	//const t = (planeNormal.dot(planePoint).sub(planeNormal.dot(linePoint))).div(planeNormal.dot(lineDirection.normalized()));
	const t = (planeNormal.dot(planePoint) - planeNormal.dot(linePoint)) / planeNormal.dot(lineDirection.normalized());
  return linePoint.add(lineDirection.normalized().scale(t));
}

Vector.prototype.normalReflectingBetweenPoints = function(start, end) {
	const mirror_pos = this;
	let mirror_to_start = start.sub(mirror_pos).normalized();
  let mirror_to_end = end.sub(mirror_pos).normalized();
  let normal = mirror_to_start.add(mirror_to_end).normalized();
  return normal;
}

Vector.prototype.angleBetweenInXZPlane = function(other) {
	let a = this.normalized()
	let b = other.normalized()
	// atan2 return -PI to +PI
	let result = Math.atan2(b.z,b.x) - Math.atan2(a.z,a.x);

	// restrict value to be between -PI and +PI
	//if (result < 0) result += Math.PI * 2;
	if (result > +Math.PI) result -= Math.PI * 2;
	if (result < -Math.PI) result += Math.PI * 2;

	//if (result > Math.PI || result < -Math.PI) throw new Error(`${result} is not in range`)

	return result;

}

Vector.prototype.angleBetweenInXYPlane = function(other) {
	let a = this.normalized()
	let b = other.normalized()
	// atan2 return -PI to +PI
	let result = Math.atan2(b.y,b.x) - Math.atan2(a.y,a.x);

	// restrict value to be between -PI and +PI
	//if (result < 0) result += Math.PI * 2;
	if (result > +Math.PI) result -= Math.PI * 2;
	if (result < -Math.PI) result += Math.PI * 2;

	//if (result > Math.PI || result < -Math.PI) throw new Error(`${result} is not in range`)

	return result;

}

Vector.prototype.angleBetween = function(other) {
	// returns angle 0 to 180 (in radians) and the axis (that can then be used to figure out direction)
	// the axis is perpendicular to the two input vectors
	let angle = Math.acos(this.normalized().dot(other.normalized()));
	let axis = this.normalized().cross(other.normalized()).normalized();
	return {angle, axis};
}

Vector.prototype.angleTo = function(other) {

	// returns a value of 0 when completely aligned to Math.PI when completely opposite

	//angle = arccos[(xa * xb + ya * yb + za * zb) / (√(xa2 + ya2 + za2) * √(xb2 + yb2 + zb2))]
	// from https://www.omnicalculator.com/math/angle-between-two-vectors
	return Math.acos((this.x * other.x + this.y * other.y + this.z * other.z) / (Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z) * Math.sqrt(other.x * other.x + other.y * other.y + other.z * other.z)))
}


Vector.prototype.add = function(other) {
	let result;
	if(isVector(other)) {
		result = add([this.x, this.y, this.z], [other.x, other.y, other.z]);
	} else {
		result = add([this.x, this.y, this.z], other);
	}
	return vector(result[0], result[1], result[2]);
}

Vector.prototype.clone = function() {
	return vector(this.x, this.y, this.z);
}

Vector.prototype.cross = function(other) {
	const result = cross([this.x, this.y, this.z], [other.x, other.y, other.z]);
	return vector(result[0], result[1], result[2]);
}

Vector.prototype.dist = function(other) {
	const result = dist([this.x, this.y, this.z], [other.x, other.y, other.z]);
	return result
}

Vector.prototype.div = function(other) {
	let result;
	if(isVector(other)) {
		result = div([this.x, this.y, this.z], [other.x, other.y, other.z]);
	} else {
		result = div([this.x, this.y, this.z], other);
	}
	return vector(result[0], result[1], result[2]);
}

Vector.prototype.dot = function(other) {
	const result = dot([this.x, this.y, this.z], [other.x, other.y, other.z]);
	return result
}

Vector.prototype.mag = function() {
	const result = mag([this.x, this.y, this.z]);
	return result
}

Vector.prototype.mult = function(other) {
	let result;
	if(isVector(other)) {
		result = mult([this.x, this.y, this.z], [other.x, other.y, other.z]);
	} else {
		result = mult([this.x, this.y, this.z], other);
	}
	return vector(result[0], result[1], result[2]);
}

Vector.prototype.scale = function(other) {
	return this.mult(other);
}

Vector.prototype.normalized = function(scalar) {
	let result;
	result = normalize([this.x, this.y, this.z], scalar);
	return vector(result[0], result[1], result[2]);
}

Vector.prototype.sub = function(other) {
	let result;
	if(isVector(other)) {
		result = sub([this.x, this.y, this.z], [other.x, other.y, other.z]);
	} else {
		result = sub([this.x, this.y, this.z], other);
	}
	return vector(result[0], result[1], result[2]);
}

Vector.prototype.withX = function(value) {
	return vector(value, this.y, this.z);
}

Vector.prototype.withY = function(value) {
	return vector(this.x, value, this.z);
}

Vector.prototype.withZ = function(value) {
	return vector(this.x, this.y, value);
}

Vector.prototype.negated = function(other) {
	return this.scale(-1.0);
}

Vector.prototype.rotatedAroundZ = function(angle, pivot) {
  pivot = pivot || vector(0,0,0);
	return vector(Math.cos(angle) * (this.x - pivot.x) - Math.sin(angle) * (this.y - pivot.y) + pivot.x,
				        Math.sin(angle) * (this.x - pivot.x) + Math.cos(angle) * (this.y - pivot.y) + pivot.y,
				        this.z)
}

Vector.prototype.rotatedAroundY = function(angle, pivot) {
  pivot = pivot || vector(0,0,0);
	return vector(Math.cos(angle) * (this.x - pivot.x) + Math.sin(angle) * (this.z - pivot.z) + pivot.x,
				        this.y,
				        Math.sin(angle) * -(this.x - pivot.x) + Math.cos(angle) * (this.z - pivot.z) + pivot.z)
}

Vector.prototype.rotatedAroundX = function(angle, pivot) {
  pivot = pivot || vector(0,0,0);
	return vector(this.x,
				        Math.cos(angle) * (this.y - pivot.y) - Math.sin(angle) * (this.z - pivot.z) + pivot.y,
				        Math.sin(angle) * (this.y - pivot.y) + Math.cos(angle) * (this.z - pivot.z) + pivot.z)
}

Vector.prototype.toFixed = function(precision) {
	return {
		x: this.x.toFixed(precision),
		y: this.y.toFixed(precision),
		z: this.z.toFixed(precision),
	}
}

function isVector(thing) {
	return thing.hasOwnProperty('x') && thing.hasOwnProperty('y') && thing.hasOwnProperty('z');
}

function vector(x,y,z) {
	return new Vector(x,y,z);
}

Vector.prototype.array = function() {
	return [this.x, this.y, this.z];
}

Vector.prototype.string = function(precision, scale) {
	precision = precision || 3;
	scale = scale || 1.0;
	return `${(this.x * scale).toFixed(precision)}, ${(this.y * scale).toFixed(precision)}, ${(this.z * scale).toFixed(precision)}`;
}

