'use strict';

var dbase = require('../sqlAnywhere/DatabaseInterface');

var cubeServer = function() {
	this.cubeList = [];
	this.cubeBySlotsOrdered = {};
	this.cubeBySlotsKey = {};
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
		'SELECT c.Name, cs.GeneratedName, cs.ID as SlotID, c.ID as cardID, ' +
		'	if (SELECT count(*) from dba.CubeCardHasColorTranslation cchct WHERE cchct.CardID = c.ID and cchct.CubeID = 11) > 1 then \'Multicolor\' ' +
		'	else if EXISTS(SELECT 1 FROM dba.CubeCardHasColorTranslation cchct WHERE cchct.CardID = c.ID and cchct.CubeID = 11) ' +
		'		 then (SELECT FIRST co.DisplayText FROM dba.CubeCardHasColorTranslation cchct JOIN dba.Color co ON co.ID = cchct.ColorID ' +
		'			WHERE cchct.CardID = c.ID and cchct.CubeID = 11 ORDER BY cchct.ColorID) ' +
		'	else if (SELECT count(*) from dba.HasColors hc WHERE hc.CardID = c.ID) > 1 then \'Multicolor\' ' +
		'	else if EXISTS(SELECT 1 FROM dba.HasType ht JOIN dba.Type t ON t.ID = ht.TypeID WHERE ht.CardID = c.ID and t.DisplayText = \'Land\') then \'Land\' ' +
		'	else (SELECT FIRST co.DisplayText FROM dba.HasColors hc JOIN dba.Color co on co.ID = hc.ColorID WHERE hc.CardID = c.ID ORDER BY hc.ColorID) endif endif endif endif as color ' +
		'FROM dba.CubeContents cc ' +
		'JOIN dba.Card c on c.ID = cc.CardID ' +
		'JOIN dba.CubeSlot cs on cs.ID = cc.SlotID ' +
		'WHERE cc.CubeID = 11 and c.ID in (SELECT DISTINCT c.id ' +
		'	FROM dba.CubeContents cc ' +
		'	JOIN dba.Card c on c.ID = cc.CardID ' +
		'	WHERE cc.CubeID = 11 and (SELECT isnull(sum(Quantity), 0) FROM dba.CubeContents WHERE CubeID = 11 and CardID = c.ID and AddDel = \'A\' and ' +
		'			ChangeDate <= current date) - ' +
		'		(SELECT isnull(sum(Quantity), 0) FROM dba.CubeContents WHERE CubeID = 11 and CardID = c.ID and AddDel = \'D\' and ' +
		'			ChangeDate <= current date) > 0 ) ' +
		'ORDER BY cs.Sequence, slotID;';
	dbase.dbResults(cmd, function(databaseData) {
		var tempSlots = {}, slotOrder = [];
		for (var i = 0; i < databaseData.length; i++) {
			var slotID = databaseData[i]['SlotID'];
			if (!tempSlots[slotID]) {
				tempSlots[slotID] = new slot();
				tempSlots[slotID].slotID = slotID;
				tempSlots[slotID].generatedSlotName = databaseData[i]['GeneratedName'];
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
		that.cubeBySlotsOrdered = finalJson;
		that.cubeBySlotsKey = tempSlots;

		callback();
	});
};

cubeServer.prototype.returnCubeBySlotsOrdered = function() {
	return this.cubeBySlotsOrdered;
};

cubeServer.prototype.compareClientToDB = function(clientData, callback) {
	var that = this;
	this.cardsInEachSlot(function() {
		// for (var i = 0; i < that.cubeBySlotsOrdered.slots.length; i++) {
			// var currSlot = that.cubeBySlotsOrdered.slots[i];
			// if (currSlot.
			// for (var j = 0; j < currSlot.cards.length; j++) {
			// }
		// }
		for (var i = 0; i < clientData.slots.length; i++) {
			var currSlot = clientData.slots[i];
			
			if (currSlot.cards.length != that.cubeBySlotsKey.slots[currSlot.slotID]) {
			}
			for (var j = 0; j < currSlot.cards.length; j++) {
			}
		}
		callback();
	});
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
};
slot.prototype = {};

var card = function() {
	this.name = '';
	this.cardID = -1;
	this.color = '';
};
card.prototype = {};

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
