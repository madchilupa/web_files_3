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
	}
	this.dataQueryCallback();
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
	this.numDecks = 0;
	this.deckCardsloaded = 0;
	
	this.dataQueryCallback = function() {};
	this.whereClause = '1=1';
	
	this.dbError = false;
	this.errorMessage = null;
};
deck.prototype = {};

deck.prototype.queryForDecks = function() {
	var that = this, cmd =
		'SELECT d.ID as deckID, d.Name as name, d.CreditedTo as creditedTo, die.Place as place, ' +
		'	c.ID as cardID, c.Name as cardName, dc.QuantityMain as quantity, \'Main\' as location, c.ManaCost as manaCost, ' +
		'	if EXISTS (SELECT 1 FROM dba.HasType ht JOIN dba.Type t on t.ID = ht.TypeID WHERE ht.CardID = c.ID and t.DisplayText = \'Creature\') then \'Creature\' ' +
		'		else if EXISTS (SELECT 1 FROM dba.hasType ht join dba.Type t on t.ID = ht.TypeID WHERE ht.cardID = c.ID and t.DisplayText = \'Land\') then \'Land\' ' +
		'		else if EXISTS (SELECT 1 FROM dba.hasType ht join dba.Type t on t.ID = ht.TypeID WHERE ht.cardID = c.ID and t.DisplayText = \'Artifact\') then \'Artifact\' ' +
		'		else (SELECT FIRST t.DisplayText FROM  dba.hasType ht join dba.Type t on t.ID = ht.TypeID WHERE ht.cardID = c.ID and t.DisplayText <> \'Tribal\') endif endif endif as cardType, ' +
		'	if (SELECT count(*) FROM dba.HasColors hc WHERE hc.CardID = c.ID) > 1 then \'Multicolor\' ' +
		'		else if EXISTS (SELECT 1 from dba.HasType ht JOIN dba.Type t on t.ID = ht.TypeID WHERE ht.CardID = c.ID and t.DisplayText = \'Land\') then \'Land\' ' +
		'		else (SELECT FIRST co.DisplayText FROM dba.HasColors hc JOIN dba.Color co on co.ID = hc.ColorID WHERE hc.CardID = c.ID) endif endif as color ' +
		'FROM dba.DeckInEvent die ' +
		'JOIN dba.Deck d on d.ID = die.DeckID ' +
		'JOIN dba.DeckContents dc on dc.DeckID = d.ID ' +
		'JOIN dba.Card c on c.ID = dc.CardID ' +
		'WHERE d.ActiveFlag = 1 and quantity > 0 AND ' + this.whereClause + ' ' +

		'UNION ' +

		'SELECT d.ID as deckID, d.Name as name, d.CreditedTo as creditedTo, die.Place as place, ' +
		'	c.ID as cardID, c.Name as cardName, dc.Quantitysideboard as quantity, \'Sideboard\' as location, c.ManaCost as manaCost, ' +
		'	\'Sideboard\' as cardType, ' +
		'	if (SELECT count(*) FROM dba.HasColors hc WHERE hc.CardID = c.ID) > 1 then \'Multicolor\' ' +
		'		else if EXISTS (SELECT 1 from dba.HasType ht JOIN dba.Type t on t.ID = ht.TypeID WHERE ht.CardID = c.ID and t.DisplayText = \'Land\') then \'Land\' ' +
		'		else (SELECT FIRST co.DisplayText FROM dba.HasColors hc JOIN dba.Color co on co.ID = hc.ColorID WHERE hc.CardID = c.ID) endif endif as color ' +
		'FROM dba.DeckInEvent die ' +
		'JOIN dba.Deck d on d.ID = die.DeckID ' +
		'JOIN dba.DeckContents dc on dc.DeckID = d.ID ' +
		'JOIN dba.Card c on c.ID = dc.CardID ' +
		'WHERE d.ActiveFlag = 1 and quantity > 0 AND ' + this.whereClause;
	dbase.dbResults(cmd, function(databaseData) {
		that.queryForDecksDataCallback(databaseData);
	});
};

deck.prototype.queryForDecksDataCallback = function(databaseData) {
	if (databaseData.dbError) {
		this.dbError = true;
		this.errorMessage = databaseData.errorMessage;
	} else {
		var decks = {};
		for (var i = 0; i < databaseData.length; i++) {
			var deckID = databaseData[i]['deckID'];
			if (!decks[deckID]) {
				decks[deckID] = new deckData({
					creditedTo: databaseData[i].creditedTo,
					deckID: databaseData[i].deckID,
					name: databaseData[i].name,
					place: databaseData[i].place
				});
				this.numDecks++;
			}
			var tempCard = new card({
				cardID: databaseData[i].cardID,
				cardName: databaseData[i].cardName,
				cardType: databaseData[i].cardType,
				cmc: databaseData[i].cmc,
				color: databaseData[i].color,
				location: databaseData[i].location,
				manaCost: databaseData[i].manaCost,
				quantity: databaseData[i].quantity
			});
			decks[deckID].cards.push(tempCard);
		}
		for (var deck in decks) {
			if (decks.hasOwnProperty(deck)) {
				this.data.push(decks[deck]);
			}
		}
	}
	this.dataQueryCallback();
};
	
deck.prototype.queryForDecksAndCards = function() {
	var that = this, oldCallback = this.dataQueryCallback;
	this.dataQueryCallback = decksGathered;

	this.queryForDecks();
	
	function decksGathered() {
		that.dataQueryCallback = cardsInDecksGathered;
		for (var i = 0; i < that.data.length; i++) {
			that.queryForCards(that.data[i].deckID, i);
		}
	}
	
	function cardsInDecksGathered() {
		that.dataQueryCallback = oldCallback;
		that.dataQueryCallback();
	}
};

deck.prototype.queryForCards = function(deckID, deckIndex) {
	/*var that = this, cmd = 
		'SELECT ';
	dbase.dbResults(cmd, function(databaseData) {
		that.queryForCardsDataCallback(databaseData, deckIndex);
	});*/
};

deck.prototype.queryFroCardsDataCallback = function(databaseData, deckIndex) {
	if (!(deckIndex > -1)) {
		deckIndex = 0;
	}
	this.dataQueryCallback();
};

var deckData = function(params) {
	this.creditedTo = params.creditedTo ? params.creditedTo : null;
	this.deckID = params.deckID ? params.deckID : null;
	this.name = params.name ? params.name : null;
	this.place = params.place ? params.place : null;
	
	this.cards = params.cards ? params.cards : [];
};
deckData.prototype = {};

var card = function(params) {
	this.cardID = params.cardID ? params.cardID : null;
	this.cardName = params.cardName ? params.cardName : null;
	this.cardType = params.cardType ? params.cardType : null;
	this.cmc = params.cmc ? params.cmc : null;
	this.color = params.color ? params.color : null;
	this.location = params.location ? params.location : null;
	this.manaCost = params.manaCost ? params.manaCost :null;
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

deckServer.prototype.gatherArchetypesInFormats = function(callback) {
/*
SELECT ft.Name, fi.AltName, hdt.*
FROM dba.FormatInfo fi
JOIN dba.FormatType ft on ft.ID = fi.FormatType
LEFT OUTER JOIN dba.Deck d on d.FormatID = fi.ID
LEFT OUTER JOIN dba.HasDeckType hdt on hdt.DeckID = d.ID
LEFT OUTER JOIN dba.DeckType dt on dt.ID = hdt.DeckTypeID
WHERE (fi.SDate <= current date AND fi.FDate >= '2015-01-22') AND (ft.Name = 'Standard' OR ft.Name = 'Modern' OR ft.Name = 'Legacy')
    AND dt.Name <> 'Constructed' and dt.ParentID IS NULL -- AND hdt.DeckID IS NULL

--select * from formatinfo
*/
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
	var that = this, deckBuilder = new deck();
	
	deckBuilder.whereClause = 'die.DeckID = ' + dbase.safeDBString(deckID);
	deckBuilder.dataQueryCallback = gatherDeckInformationFinished;
	
	deckBuilder.queryForDecks();
	
	function gatherDeckInformationFinished() {
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

function reset() {
	serverObject = new deckServer();
};

function gatherListOfEvents(callback) {
	return serverObject.gatherListOfEvents(callback);
};

function gatherArchetypesInFormats(callback) {
	return serverObject.gatherArchetypesInFormats(callback);
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
module.exports.gatherArchetypesInFormats = gatherArchetypesInFormats;
module.exports.gatherSingleEventInfo = gatherSingleEventInfo;
module.exports.gatherSingleDeckCards = gatherSingleDeckCards;