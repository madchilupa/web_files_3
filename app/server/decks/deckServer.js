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

var event = function() {
	this.data = [];
	
	this.dataQueryCallback = function() {};
	this.whereClause = '1=1';
	this.dbError = false;
	this.errorMessage = null;
};
event.prototype = {};

event.prototype.queryForEvents = function() {
	var that = this, cmd =
		'SELECT ID as eventID, Name as eventName, City as city, Country as country, StartDate as startDate, EndDate as endDate ' +
		'FROM dba.Event ' +
		'WHERE ActiveFlag = 1 AND ' + this.whereClause +
		'ORDER BY EndDate DESC, Name ASC;';
	dbase.dbResults(cmd, function(databaseData) {
		that.queryForEventsDataCallback(databaseData);
	});
};

event.prototype.queryForEventsDataCallback = function(databaseData) {
	if (databaseData.dbError) {
		this.dbError = true;
		this.errorMessage = databaseData.errorMessage;
	} else {
		for (var i = 0; i < databaseData.length; i++) {
			var newEventData = new eventData({
				city: databaseData[i].city,
				country: databaseData[i].country,
				endDate: databaseData[i].endDate,
				eventID: databaseData[i].eventID,
				eventName: databaseData[i].eventName,
				startDate: databaseData[i].startDate
			});
			this.data.push(newEventData);
		}
		this.dataQueryCallback();
	}
};

var eventData = function(params) {
	this.city = params.city ? params.city : null;
	this.country = params.country ? params.country : null;
	this.endDate = params.endDate ? params.endDate : null;
	this.eventID = params.eventID ? params.eventID : null;
	this.eventName = params.eventName ? params.eventName : null;
	this.startDate = params.startDate ? params.startDate : null;
};
eventData.prototype = {};

var deck = function() {
	this.data = [];
	
	this.dataQueryCallback = function() {};
	this.whereClause = '1=1';
	this.dbError = false;
	this.errorMessage = null;
};
deck.prototype = {};

deck.prototype.queryForDecks = function() {
	var that = this, cmd =
		'SELECT d.ID as deckID, d.Name as name, d.CreditedTo as creditedTo, die.Place as place ' +
		'FROM dba.DeckInEvent die ' +
		'JOIN dba.Deck d on d.ID = die.DeckID ' +
		'WHERE d.ActiveFlag = 1 AND ' + this.whereClause;
	dbase.dbResults(cmd, function(databaseData) {
		that.queryForDecksDataCallback(databaseData);
	});
};

deck.prototype.queryForDecksDataCallback = function(databaseData) {
	if (databaseData.dbError) {
		this.dbError = true;
		this.errorMessage = databaseData.errorMessage;
	} else {
		for (var i = 0; i < databaseData.length; i++) {
			var newDeckData = new deckData({
				creditedTo: databaseData[i].creditedTo,
				deckID: databaseData[i].deckID,
				name: databaseData[i].name,
				place: databaseData[i].place
			});
			this.data.push(newDeckData);
		}
		
		this.dataQueryCallback();
	}
};

var deckData = function(params) {
	this.creditedTo = params.creditedTo ? params.creditedTo : null;
	this.deckID = params.deckID ? params.deckID : null;
	this.name = params.name ? params.name : null;
	this.place = params.place ? params.place : null;
	
	this.cards = params.cards ? params.cards : null;
};
deckData.prototype = {};

var card = function(params) {
	this.cardName = params.cardName ? params.cardName : null;
	this.cardType = params.cardType ? params.cardType : null;
	this.cmc = params.cmc ? params.cmc : null;
	this.color = params.color ? params.color : null;
	this.quantity = params.quantity ? params.quantity : null;
};
card.prototype = {};

deckServer.prototype.gatherListOfEvents = function(callback) {
	var that = this, eventBuilder = new event();
	eventBuilder.whereClause = '1=1';
	eventBuilder.dataQueryCallback = dataCallback;
	
	eventBuilder.queryForEvents();
	
	function dataCallback() {
		if (eventBuilder.dbError) {
			that.obj.dbError = true;
			that.obj.errorMessage = eventBuilder.errorMessage;
		} else {
			that.obj.events = eventBuilder.data;
		}
		callback(that.obj);
	}
};

deckServer.prototype.gatherSingleEventInfo = function(callback, eventID) {
	var that = this, eventBuilder = new event(), deckBuilder = new deck();
	
	eventBuilder.whereClause = 'ID = ' + dbase.safeDBString(eventID);
	eventBuilder.dataQueryCallback = gatherEventsFinished;
	deckBuilder.whereClause = 'die.EventID = ' + dbase.safeDBString(eventID);
	deckBuilder.dataQueryCallback = gatherDecksFinished;
	
	eventBuilder.queryForEvents();
	
	function gatherEventsFinished() {
		if (eventBuilder.dbError) {
			that.obj.dbError = true;
			that.obj.errorMessage = eventBuilder.errorMessage;
			allGatheringFinished();
		} else {
			that.obj.events = eventBuilder.data;
			deckBuilder.queryForDecks();
		}
	}
	
	function gatherDecksFinished() {
		if (deckBuilder.dbError) {
			that.obj.dbError = true;
			that.obj.errorMessage = deckBuilder.errorMessage;
			allGatheringFinished();
		} else {
			that.obj.decks = deckBuilder.data;
			allGatheringFinished();
		}
	}
	
	function allGatheringFinished() {
		callback(that.obj);
	}
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