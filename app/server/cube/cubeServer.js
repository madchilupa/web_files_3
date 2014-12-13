'use strict';

var dbase = require('../sqlAnywhere/DatabaseInterface');

var cubeServer = function() {
	this.cubeList = [];
	this.cubeBySlotsOrdered = {};
	this.cubeBySlotsKey = {};
	
	this.cardsAdded = {};
	this.cardsRemoved = {};
	this.cardsMoved = {};
	this.slotChanges = {};
};
cubeServer.prototype = {};
	
cubeServer.prototype.gatherListOfRotationEligibleCubes = function(callback) {
	var newCube = new cube();
	
	newCube.name = 'Big Boy Cube';
	newCube.id = 2;
	this.cubeList.push(newCube);
	
	callback();
};
	
cubeServer.prototype.isValidCubeList = function() {
	if (this.cubeList.length > 0) {
		return true;
	} else {
		return false;
	}
};
	
cubeServer.prototype.returnCubeList = function() {
	return this.cubeList;
};

cubeServer.prototype.cardsInEachSlot = function(callback) {
	var that = this, cmd =
		'BEGIN ' +
		'declare @date date; ' +
		'declare @cubeID integer; ' +
		'set @date = current date; ' +
		'set @cubeID = 11; ' +

		'SELECT c.Name, c.id as cardID, ' +
		'	(SELECT isnull(sum(Quantity), 0) FROM dba.CubeContents WHERE CubeID = @cubeID and CardID = c.ID and AddDel = \'A\' and  ' +
		'		ChangeDate <= @date and isnull(SlotID, 0) = isnull(cc.SlotID, 0)) -  ' +
		'	(SELECT isnull(sum(Quantity), 0) FROM dba.CubeContents WHERE CubeID = @cubeID and CardID = c.ID and AddDel = \'D\' and  ' +
		'		ChangeDate <= @date and isnull(SlotID, 0) = isnull(cc.SlotID, 0)) as total, ' +
		'	cs.GeneratedName, cs.ID as SlotID, isnull(cs.Sequence, 99999) as SlotSequence, ' +
		'	(SELECT FIRST DisplayName FROM dba.CubeSlotName WHERE isnull(CubeSlotID, 0) = isnull(cc.SlotID, 0) and DateChanged <= @date ORDER BY DateChanged) as SlotName, ' +
		'	if (SELECT count(*) from dba.CubeCardHasColorTranslation cchct WHERE cchct.CardID = c.ID and cchct.CubeID = @cubeID) > 1 then \'Multicolor\' ' +
		'	else if EXISTS(SELECT 1 FROM dba.CubeCardHasColorTranslation cchct WHERE cchct.CardID = c.ID and cchct.CubeID = @cubeID) ' +
		'		 then (SELECT FIRST co.DisplayText FROM dba.CubeCardHasColorTranslation cchct JOIN dba.Color co ON co.ID = cchct.ColorID ' +
		'			WHERE cchct.CardID = c.ID and cchct.CubeID = @cubeID ORDER BY cchct.ColorID) ' +
		'	else if (SELECT count(*) from dba.HasColors hc WHERE hc.CardID = c.ID) > 1 then \'Multicolor\' ' +
		'	else if EXISTS(SELECT 1 FROM dba.HasType ht JOIN dba.Type t ON t.ID = ht.TypeID WHERE ht.CardID = c.ID and t.DisplayText = \'Land\') then \'Land\' ' +
		'	else (SELECT FIRST co.DisplayText FROM dba.HasColors hc JOIN dba.Color co on co.ID = hc.ColorID WHERE hc.CardID = c.ID ORDER BY hc.ColorID) endif endif endif endif as color ' +
		'FROM dba.CubeContents cc ' +
		'JOIN dba.Card c on c.ID = cc.CardID ' +
		'LEFT OUTER JOIN dba.CubeSlot cs on cs.ID = cc.SlotID ' +
		'WHERE cc.CubeID = @cubeID and total > 0 ' +
		'ORDER BY SlotSequence, cs.GeneratedName, c.Name ASC;' +
		'END';
	dbase.dbResults(cmd, function(databaseData) {
		that.storeDatabaseSlotData(databaseData, callback);
	});
};

cubeServer.prototype.storeDatabaseSlotData = function(databaseData, callback) {
	var tempSlots = {}, slotOrder = [];
	for (var i = 0; i < databaseData.length; i++) {
		var slotID = databaseData[i]['SlotID'];
		if (!tempSlots[slotID]) {
			tempSlots[slotID] = new slot();
			tempSlots[slotID].slotID = slotID;
			tempSlots[slotID].generatedSlotName = databaseData[i]['GeneratedName'];
			tempSlots[slotID].slotName = databaseData[i]['SlotName'];
			slotOrder.push(slotID);
			var tempCard = new card();
			tempCard.name = databaseData[i]['GeneratedName'];
			tempCard.color = databaseData[i]['color'];
			tempCard.draggable = false;
			tempSlots[slotID].cards.push(tempCard);
		}
		var tempCard = new card();
		tempCard.name = databaseData[i]['Name'];
		tempCard.cardID = databaseData[i]['cardID'];
		tempCard.color = databaseData[i]['color'];
		tempCard.draggable = true;
		tempSlots[slotID].cards.push(tempCard);
	}
	//finished loading data, format it for client-side
	var finalJson = {};
	finalJson.slots = [];
	for (var i = 0; i < slotOrder.length; i++) {
		finalJson.slots.push(tempSlots[slotOrder[i]]);
	}
	
	finalJson.meta = {};
	finalJson.meta.colorSelected = 'White';
	this.cubeBySlotsOrdered = finalJson;
	this.cubeBySlotsKey = tempSlots;

	callback();
};

cubeServer.prototype.returnCubeBySlotsOrdered = function() {
	return this.cubeBySlotsOrdered;
};

cubeServer.prototype.compareClientToDB = function(clientData, callback) {
	var that = this;
	this.cardsInEachSlot(function() {
		that.gatherChanges(clientData, callback);
	});
};

cubeServer.prototype.gatherChanges = function(clientData, callback) {
	var changeTypes = new changeType();
	for (var i = 0; i < clientData.length; i++) {
		var currSlot = clientData[i];
		
		for (var j = 0; j < currSlot.cards.length; j++) {
			var cardToTestID = currSlot.cards[j].cardID;
			if (cardToTestID > 0) {
				if (!this.keyValueInArray('cardID', cardToTestID, this.cubeBySlotsKey[currSlot.slotID].cards)) {
				// client data has a card in this slot not saved in the database
					this.cardsAdded[cardToTestID] = new change();
					this.cardsAdded[cardToTestID].initialize(cardToTestID, changeTypes.add, currSlot.slotID);
				}
			}
		}
		for (var j = 0; j < this.cubeBySlotsKey[currSlot.slotID].cards.length; j++) {
			var cardToTestID = this.cubeBySlotsKey[currSlot.slotID].cards[j].cardID;
			if (cardToTestID > 0) {
				if (!this.keyValueInArray('cardID', cardToTestID, currSlot.cards)) {
				// database data has a card in this slot not sent in client data
					this.cardsRemoved[cardToTestID] = new change();
					this.cardsRemoved[cardToTestID].initialize(cardToTestID, changeTypes.remove, currSlot.slotID);
				}
			}
		}
		
		if (currSlot.slotName != this.cubeBySlotsKey[currSlot.slotID].slotName) {
			this.slotChanges[currSlot.slotID] = new change();
			this.slotChanges[currSlot.slotID].initialize(null, changeTypes.slotRename, currSlot.slotID);
			this.slotChanges[currSlot.slotID].slotName = currSlot.slotName;
		}
	}
	for (var cardID in this.cardsAdded) {
		if (this.cardsAdded.hasOwnProperty(cardID)) {
			if (this.cardsRemoved[cardID]) {
				this.cardsMoved[cardID] = new change();
				this.cardsMoved[cardID].initialize(cardID, changeTypes.move, -1);
				this.cardsMoved[cardID].slotFromID = this.cardsRemoved[cardID].slotID;
				this.cardsMoved[cardID].slotToID = this.cardsAdded[cardID].slotID;
				delete this.cardsAdded[cardID];
				delete this.cardsRemoved[cardID];
			}
		}
	}
	this.generateChangeSQL(callback);
	callback();
};

cubeServer.prototype.keyValueInArray = function(key, value, array) {
	for (var i = 0; i < array.length; i++) {
		if (array[i][key] == value) {
			return true;
		}
	}
	return false;
};

cubeServer.prototype.generateChangeSQL = function(callback) {
	var date = new Date();
	for (var cardID in this.cardsAdd) {
		if (this.cardsAdded.hasOwnProperty(cardID)) {
			this.cardsAdded[cardID].SQL = 'INSERT INTO dba.CubeContents (CardID, CubeID, Quantity, AddDel, ChangeDate, SlotID) VALUES (\'' +
				dbase.safeDBString(cardID) + '\', 11, 1, \'A\', \'' + date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + '\', \'' +
				dbase.safeDBString(this.cardsAdded[cardID].slotID) + '\'); ';
			console.log(this.cardsAdded[cardID].SQL);
		}
	}
	for (var cardID in this.cardsRemoved) {
		if (this.cardsRemoved.hasOwnProperty(cardID)) {
			this.cardsRemoved[cardID].SQL = 'INSERT INTO dba.CubeContents (CardID, CubeID, Quantity, AddDel, ChangeDate, SlotID) VALUES (\'' +
				dbase.safeDBString(cardID) + '\', 11, 1, \'D\', \'' + date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + '\', \'' +
				dbase.safeDBString(this.cardsRemoved[cardID].slotID) + '\'); ';
			console.log(this.cardsRemoved[cardID].SQL);
		}
	}
	for (var cardID in this.cardsMoved) {
		if (this.cardsMoved.hasOwnProperty(cardID)) {
			this.cardsMoved[cardID].SQL = 'INSERT INTO dba.CubeContents (CardID, CubeID, Quantity, AddDel, ChangeDate, SlotID) VALUES (\'' +
				dbase.safeDBString(cardID) + '\', 11, 1, \'D\', \'' + date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + '\', \'' +
				dbase.safeDBString(this.cardsMoved[cardID].slotFromID) + '\'); ';
			this.cardsMoved[cardID].SQL += 'INSERT INTO dba.CubeContents (CardID, CubeID, Quantity, AddDel, ChangeDate, SlotID) VALUES (\'' +
				dbase.safeDBString(cardID) + '\', 11, 1, \'A\', \'' + date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + '\', \'' +
				dbase.safeDBString(this.cardsMoved[cardID].slotToID) + '\'); ';
			console.log(this.cardsMoved[cardID].SQL);
		}
	}
	for (var slotID in this.slotChanges) {
		if (this.slotChanges.hasOwnProperty(slotID)) {
			var slotChange = this.slotChanges[slotID];
			slotChange.SQL = 'INSERT INTO dba.CubeSlotName (DisplayName, CubeSlotID, DateChanged) VALUES (\'' +
				dbase.safeDBString(slotChange.slotName) + '\', \'' + slotID + '\', \'' + date.getFullYear() + '-' + (date.getMonth() + 1) + '-' +
				date.getDate() + '\'); ';
			console.log(this.slotChanges[slotID].SQL);
		}
	}
};

var cube = function() {
	this.name = '';
	this.id = -1;
};
cube.prototype = {};

var slot = function() {
	this.cards = [];
	this.slotID = -1;
	this.generatedSlotName = '';
	this.slotName = '';
};
slot.prototype = {};

var card = function() {
	this.name = '';
	this.cardID = -1;
	this.color = '';
};
card.prototype = {};

var change = function () {
	this.cardID = -1;
	this.changeType = -1;
	this.slotID = -1;
	this.slotFromID = -1;
	this.slotToID = -1;
	this.SQL = '';
	this.slotName = '';
};
change.prototype = {};

change.prototype.initialize = function(cardID, changeType, slotID, slotName) {
	this.cardID = cardID;
	this.changeType = changeType;
	this.slotID = slotID;
};

var changeType = function() {
	this.add = 1;
	this.remove = 2;
	this.move = 3;
	this.slotRename = 4;
};
changeType.prototype = {};

function gatherListOfRotationEligibleCubes(callback) {
	serverObject.gatherListOfRotationEligibleCubes(callback);
};

function reset() {
	serverObject = new cubeServer();
};

function returnCubeList() {
	return serverObject.returnCubeList();
};

function isValidCubeList() {
	return serverObject.isValidCubeList();
};

function cardsInEachSlot(callback) {
	return serverObject.cardsInEachSlot(callback);
};

function returnCubeBySlotsOrdered() {
	return serverObject.returnCubeBySlotsOrdered();
};

function compareClientToDB(clientData, callback) {
	return serverObject.compareClientToDB(clientData, callback);
};

var serverObject = new cubeServer();
module.exports.gatherListOfRotationEligibleCubes = gatherListOfRotationEligibleCubes;
module.exports.reset = reset;
module.exports.returnCubeList = returnCubeList;
module.exports.isValidCubeList = isValidCubeList;
module.exports.cardsInEachSlot = cardsInEachSlot;
module.exports.returnCubeBySlotsOrdered = returnCubeBySlotsOrdered;
module.exports.compareClientToDB = compareClientToDB;
