'use strict';

var cubeServer = require('../cube/cubeServer');

module.exports = function(app) {
	app.get('/cubeList', gatherCubeList);
	
	function gatherCubeList(request, response) {
		cubeServer.gatherListOfRotationEligibleCubes(listGathered);
		
		function listGathered() {
			if (cubeServer.isValidCubeList()) {
				response.send(200, cubeServer.returnCubeList());
			} else {
				response.send(500, 'No elligible cubes found');
			}
		}
	};
};