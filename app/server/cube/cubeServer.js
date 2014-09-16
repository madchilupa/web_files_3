'use strict';

var dbase = require('../sqlAnywhere/DatabaseInterface');

var cubeServer = function() {
	this.cubeList = [];
};
cubeServer.prototype = {};
	
cubeServer.prototype.gatherListOfRotationEligibleCubes = function(callback) {
	var newCube = new cube();
	
	newCube.name = 'Big Boy Cube';
	newCube.id = 2;
	this.cubeList.push(newCube);
	
	callback();
};
	
cubeServer.prototype.isValidCubeList = function() {
	if (this.cubeList.length > 0) {
		return true;
	} else {
		return false;
	}
};
	
cubeServer.prototype.returnCubeList = function() {
	return this.cubeList;
};

var cube = function() {
	var name = '';
	var id = -1;
};
cube.prototype = {};

function gatherListOfRotationEligibleCubes(callback) {
	serverObject.gatherListOfRotationEligibleCubes(callback);
};

function reset() {
	serverObject = new cubeServer();
};

function returnCubeList() {
	return serverObject.returnCubeList();
};

function isValidCubeList() {
	return serverObject.isValidCubeList();
};

var serverObject = new cubeServer();
module.exports.gatherListOfRotationEligibleCubes = gatherListOfRotationEligibleCubes;
module.exports.reset = reset;
module.exports.returnCubeList = returnCubeList;
module.exports.isValidCubeList = isValidCubeList;
