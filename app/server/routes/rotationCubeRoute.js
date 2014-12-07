'use strict';

var cubeServer = require('../cube/cubeServer');

module.exports = function(app) {
	app.get('/cubeList', gatherCubeList);
	app.get('/cubeView', viewCubeContents);
	app.get('/cubeSave', saveSlotChanges);
	
	function gatherCubeList(request, response) {
		cubeServer.reset();
		cubeServer.gatherListOfRotationEligibleCubes(listGathered);
		
		function listGathered() {
			if (cubeServer.isValidCubeList()) {
				response.send(200, cubeServer.returnCubeList());
			} else {
				response.send(500, 'No elligible cubes found');
			}
		}
	};
	
	function viewCubeContents(request, response) {	
		cubeServer.reset();
		cubeServer.gatherAllCardsBySlotID(listGathered);
		
		function listGathered() {
			response.send(200, cubeServer.returnCubeBySlots());
		}
	};
	
	function saveSlotChanges(request, response) {
		cubeServer.reset();
		cubeServer.compareClientToDB(request, comparisonFinished);
		
		function comparisonFinished() {
			
		}
	};
};