'use strict';

var deckServer = require('../decks/deckServer');

module.exports = function(app) {
	app.get('/eventList', gatherEvents);
	app.get('/currArchetypesInFormats', gatherArchetypesInFormats);
	app.get('/singleEventInfo', gatherSingleEventInfo);
	app.get('/singleDeckInfo', gatherSingleDeckCards);
	app.get('/allDecksInEvent');
	
	function gatherEvents(request, response) {
		deckServer.reset();
		deckServer.gatherListOfEvents(eventsGathered);
		
		function eventsGathered(serverResponse) {
			if (serverResponse && serverResponse.dbError) {
				response.send(500, serverResponse.errorMessage.toString());
			} else if (!serverResponse) {
				response.send(500, 'No response from database');
			} else {
				response.send(200, {success: true, eventList: serverResponse.events});
			}
		}
	};
	
	function gatherArchetypesInFormats(request, response) {
		deckServer.reset();
		deckServer.gatherArchetypesInFormats(archetypesGathered);
		
		function archetypesGathered(serverResponse) {
			if (serverResponse && serverResponse.dbError) {
				response.send(500, serverResponse.errorMessage.toString());
			} else if (!serverResponse) {
				resposne.send(500, 'No response from database');
			} else {
				response.send(200, {success: true, formatList: serverResponse.formats});
			}
		}
	};
	
	function gatherSingleEventInfo(request, response) {
		var eventID = request.query.eventID;
		
		if (!eventID) {
			response.send(500, 'No event to find');
		} else {
			deckServer.reset();
			deckServer.gatherSingleEventInfo(eventInfoGathered, eventID);
		}
		
		function eventInfoGathered(serverResponse) {
			if (serverResponse && serverResponse.dbError) {
				response.send(500, serverResponse.errorMessage.toString());
			} else if (!serverResponse) {
				response.send(500, 'No response from database');
			} else {
				response.send(200, {success: true, serverData: serverResponse});
			}
		}
	};
	
	function gatherSingleDeckCards(request, response) {
		var deckID = request.query.deckID;
		
		if (!deckID) {
			response.send(500, 'No deck to find');
		} else {
			deckServer.reset();
			deckServer.gatherSingleDeckCards(deckGathered, deckID);
		}
		
		function deckGathered(serverResponse) {
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