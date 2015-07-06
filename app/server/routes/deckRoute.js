'use strict';

var deckServer = require('../decks/deckServer');

module.exports = function(app) {
	app.get('/eventList', gatherEvents);
	app.get('/currArchetypesInFormats', gatherArchetypesInFormats);
	app.get('/singleEventInfo', gatherSingleEventInfo);
	app.get('/singleDeckInfo', gatherSingleDeckCards);
	app.get('/allDecksInEvent');
	app.get('/singleDeckTypeInfo', gatherDeckTypeInfo);
	app.get('/getDecksDeckType', getDecksDeckType);
	
	function gatherEvents(request, response) {
		var formatID = request.query.formatID;
		
		if (!formatID) {
			response.send(500, 'No format defined');
		} else {
			deckServer.reset();
			deckServer.gatherListOfEvents(eventsGathered, formatID);
		}
		
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
		var formatID = request.query.formatID;
		
		if (!formatID) {
			response.send(500, 'No format defined');
		} else {
			deckServer.reset();
			deckServer.gatherArchetypesInFormats(archetypesGathered, formatID);
		}
		
		function archetypesGathered(serverResponse) {
			if (serverResponse && serverResponse.dbError) {
				response.send(500, serverResponse.errorMessage.toString());
			} else if (!serverResponse) {
				resposne.send(500, 'No response from database');
			} else {
				response.send(200, {success: true, deckTypeList: serverResponse});
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
	
	function gatherDeckTypeInfo(request, response) {
		var deckTypeID = request.query.deckTypeID;
		
		if (!deckTypeID) {
			response.send(500, 'No archetype to find');
		} else {
			deckServer.reset();
			deckServer.gatherSingleDeckTypeInfo(deckTypeGathered, deckTypeID);
		}
		
		function deckTypeGathered(serverResponse) {
			if (serverResponse && serverResponse.dbError) {
				response.send(500, serverResponse.errorMessage.toString());
			} else if (!serverResponse) {
				response.send(500, 'No response from database');
			} else {
				response.send(200, {success: true, serverData: serverResponse});
			}
		}
	};
	
	function getDecksDeckType(request, response) {
		var deckID = request.query.deckID;
		
		if (!deckID) {
			response.send(500, 'No deck type to find');
		} else {
			deckServer.reset();
			deckServer.getDecksDeckType(deckTypeGathered, deckID);
		}
		
		function deckTypeGathered(serverResponse) {
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