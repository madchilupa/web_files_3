'use strict';

var listServer = require('../lists/listServer');

module.exports = function(app) {
	app.get('/config-list', getConfigData);
	app.post('/evalList', evalList);
	app.post('/verifySingleListItem', verifySingleListItem);
	
	function getConfigData (request, response) {
		var listHander = listServer.createServerObject();
		
		listHander.getConfig(configLoaded);
		
		function configLoaded(serverResponse) {
			if (serverResponse && serverResponse.dbError) {
				response.send(500, serverResponse.errorMessage.toString());
			} else if (!serverResponse) {
				response.send(500, 'No response from database');
			} else {
				response.send(200, {success: true, serverData: serverResponse});
			}
		}
	};
	
	function evalList(request, response) {
		var listHandler = listServer.createServerObject();
		
		listHandler.setRawText(request.body);
		listHandler.rawTextToCards(cardsFound);
		
		function cardsFound(serverResponse) {
			if (serverResponse && serverResponse.dbError) {
				response.send(500, serverResponse.errorMessage.toString());
			} else if (!serverResponse) {
				response.send(500, 'No response from database');
			} else {
				response.send(200, {success: true, serverData: serverResponse});
			}
		}
	};
	
	function verifySingleListItem(request, response) {
		var listHandler = listServer.createServerObject();
		
		console.log(request.body);
	};
}