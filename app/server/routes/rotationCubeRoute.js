'use strict';

var cubeServer = require('../cube/cubeServer');

module.exports = function(app) {
	app.get('/cubeList', gatherCubeList);
	app.get('/cubeView', viewCubeContents);
	app.post('/cubeSave', saveSlotChanges);
	app.post('/addSlot', createNewSlot);
	
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
		cubeServer.cardsInEachSlot(listGathered);
		
		function listGathered(databaseResponse) {
			if (databaseResponse && databaseResponse.dbError) {
				response.send(500, databaseResponse.errorMessage.toString());
			} else {
				response.send(200, cubeServer.returnCubeBySlotsOrdered());
			}
		}
	};
	
	function saveSlotChanges(request, response) {
		cubeServer.reset();
		cubeServer.compareClientToDB(request.body, comparisonFinished);
		
		function comparisonFinished(databaseResponse) {
			if (databaseResponse.dbError) {
				response.send(500, databaseResponse.errors.toString());
			} else {
				response.send(200, {success: true});
			}
		}
	};
	
	function createNewSlot(request, response) {
		cubeServer.reset();
		cubeServer.createNewSlot(request.body, slotCreated);
		
		function slotCreated(databaseResponse) {
			if (databaseResponse.dbError) {
				response.send(500, databaseResponse.errors.toString());
			} else {
				response.send(200, {success: true, generatedSlotName: databaseResponse.generatedSlotName});
			}
		}
	};
};