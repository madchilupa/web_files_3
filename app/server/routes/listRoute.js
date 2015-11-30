'use strict';

var listServer = require('../lists/listServer');

module.exports = function(app) {
	app.post('/evalList', evalList);
	
	function evalList(request, response) {
		var listHandler = listServer.createServerObject();
		
		console.log(request.body);
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
}