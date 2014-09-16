'use strict';

var dbase = require('../sqlAnywhere/DatabaseInterface');

var cubeServer = function() {
	var cubeList = [];
};
cubeServer.prototype = {};
	
cubeServer.prototype.gatherListOfRotationEligibleCubes = function(callback) {
console.log('here');
	var newCube = new cube();
	
	newCube.name = 'Big Boy Cube';
	newCube.id = 2;
	cubeList.push(newCube);
};
	
cubeServer.prototype.validCubeList = function() {
	if (cubeList.length > 0) {
		return true;
	} else {
		return false;
	}
};
	
cubeServer.prototype.returnCubeList = function() {
	return cubeList;
};

var cube = function() {
	var name = '';
	var id = -1;
};
cube.prototype = {};

var serverObject = new cubeServer();

module.exports.gatherListofRotationEligibleCubes = serverObject.gatherListOfRotationEligibleCubes;
module.exports.returnCubeList = serverObject.returnCubeList;
module.exports.validCubeList = serverObject.validCubeList;