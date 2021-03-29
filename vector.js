const add = require('vectors/add')(3)
const copy = require('vectors/copy')(3)
const cross = require('vectors/cross')(3)
const dist = require('vectors/dist')(3)
const div = require('vectors/div')(3)
const dot = require('vectors/dot')(3)
const mag = require('vectors/mag')(3)
const mult = require('vectors/mult')(3)
const normalize = require('vectors/normalize')(3)
const sub = require('vectors/sub')(3)

'use strict'
class Vector {
	constructor(x,y,z) {
		this.x = x || 0;
		this.y = y || 0;
		this.z = z || 0;
	}
}

Vector.prototype.print = function() {
	return `{x: ${this.x}, y: ${this.y}, z: ${this.z}}`;
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




module.exports = vector;