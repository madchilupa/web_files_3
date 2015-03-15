'use strict';

var dbase = require('../sqlAnywhere/DatabaseInterface');

var deckServer = function() {
	this.obj = new dataObj();
};
deckServer.prototype = {};

var dataObj = function() {
	this.dbError = false;
	this.errorMessage;
	
	this.events = [];
	this.decks = [];
};
dataObj.prototype = {};

var event = function(params) {
	this.city = params.city ? params.city : null;
	this.country = params.country ? params.country : null;
	this.endDate = params.endDate ? params.endDate : null;
	this.eventID = params.eventID ? params.eventID : null;
	this.eventName = params.eventName ? params.eventName : null;
	this.startDate = params.startDate ? params.startDate : null;
};
event.prototype = {};

var deck = function(params) {
	this.creditedTo = params.creditedTo ? params.creditedTo : null;
	this.deckID = params.deckID ? params.deckID : null;
	this.name = params.name ? params.name : null;
	this.place = params.place ? params.place : null;
	
	this.cards = params.cards ? params.cards : null;
};
deck.prototype = {};

var card = function(params) {
	this.cardName = params.cardName ? params.cardName : null;
	this.cardType = params.cardType ? params.cardType : null;
	this.cmc = params.cmc ? params.cmc : null;
	this.color = params.color ? params.color : null;
	this.quantity = params.quantity ? params.quantity : null;
};
card.prototype = {};

deckServer.prototype.gatherListOfEvents = function(callback) {
	this.queryForEvents(callback, '1=1');
};

deckServer.prototype.queryForEvents = function(callback, whereClause) {
	var that = this, cmd = 
		'SELECT ID as eventID, Name as eventName, City as city, Country as country, StartDate as startDate, EndDate as endDate ' +
		'FROM dba.Event ' +
		'WHERE ActiveFlag = 1 AND ' + whereClause +
		'ORDER BY EndDate DESC, Name ASC;';
	dbase.dbResults(cmd, function(databaseData) {
		that.obj.dbError = databaseData.dbError;
		if (databaseData.dbError) {
			that.obj.errorMessage = databaseData.errorMessage;
		}
		
		for (var i = 0; i < databaseData.length; i++) {
			var newEvent = new event({
				city: databaseData[i].city,
				country: databaseData[i].country,
				endDate: databaseData[i].endDate,
				eventID: databaseData[i].eventID,
				eventName: databaseData[i].eventName,
				startDate: databaseData[i].startDate
			});
			that.obj.events.push(newEvent);
		}
		callback(that.obj);
	});
};

deckServer.prototype.gatherSingleEventInfo = function(callback, eventID) {
	var that = this;
	
	this.queryForEvents(gatherDecks, 'ID = ' + dbase.safeDBString(eventID));
	
	function gatherDecks() {
		that.queryForDecks(gatheringFinished, eventID);
	}
	
	function gatheringFinished() {
		callback(that.obj);
	}
};

deckServer.prototype.queryForDecks = function(callback, eventID) {
	var that = this, cmd = 
		'SELECT d.ID as deckID, d.Name as name, d.CreditedTo as creditedTo, die.Place as place ' +
		'FROM dba.DeckInEvent die ' +
		'JOIN dba.Deck d on d.ID = die.DeckID ' +
		'WHERE die.EventID = ' + dbase.safeDBString(eventID) + ' and d.ActiveFlag = 1;';
	dbase.dbResults(cmd, function(databaseData) {
		that.obj.dbError = databaseData.dbError;
		if (databaseData.dbError) {
			that.obj.errorMessage = databaseData.errorMessage;
		}
		
		for (var i = 0; i < databaseData.length; i++) {
			var newDeck = new deck({
				creditedTo: databaseData[i].creditedTo,
				deckID: databaseData[i].deckID,
				name: databaseData[i].name,
				place: databaseData[i].place
			});
			that.obj.decks.push(newDeck);
		}
		callback(that.obj);
	});
};

deckServer.prototype.gatherSingleDeckCards = function(callback, deckID) {
	
};

function reset() {
	serverObject = new deckServer();
};

function gatherListOfEvents(callback) {
	return serverObject.gatherListOfEvents(callback);
};

function gatherSingleEventInfo(callback, eventID) {
	return serverObject.gatherSingleEventInfo(callback, eventID);
};

function gatherSingleDeckCards(callback, deckID) {
	return serverObject.gatherSingleDeckCards(callback, deckID);
};

var serverObject = new deckServer();
module.exports.reset = reset;
module.exports.gatherListOfEvents = gatherListOfEvents;
module.exports.gatherSingleEventInfo = gatherSingleEventInfo;
module.exports.gatherSingleDeckCards = gatherSingleDeckCards;