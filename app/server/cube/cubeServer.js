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
	this.numberOfTransactions = 0;
	this.errors = [];
	this.numTransactionsExecuted = 0;
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

cubeServer.prototype.colorsInCube = function(callback) {
	var cmd = 
		'SELECT DISTINCT co.ID, isnull(co.Abbreviation, co.DisplayText) as abbr, co.DisplayText as name, co.Sequence ' +
		'FROM dba.CubeSlot cs ' +
		'JOIN dba.Color co on co.ID = cs.ColorID ' +
		'WHERE cs.CubeID = 11 ' +
		'ORDER BY co.Sequence;';
	dbase.dbResults(cmd, function(databaseData) {
		callback(databaseData);
	});
};

cubeServer.prototype.cardsInEachSlot = function(callback) {
	var that = this, cmd =
		'BEGIN ' +
		'declare @date date; ' +
		'declare @cubeID integer; ' +
        'declare local temporary table slotContents( ' +
        '    cardName varchar(150), ' +
        '    cardID integer, ' +
        '    slotGeneratedName varchar(50), ' +
        '    slotID integer, ' +
        '    slotSequence integer, ' +
        '    slotColorID integer, ' +
        '    slotName varchar(50), ' +
        '    color varchar(25) ' +
        ') not transactional; ' +

		'set @date = current date; ' +
		'set @cubeID = 11; ' +

        'INSERT INTO slotContents (cardName, cardID, slotGeneratedName, slotID, slotSequence, SlotColorID, slotName, color) ' +
        'WITH cardsInCube as ( ' +
		'SELECT c.Name, c.id as cardID, ' +
		'	(SELECT isnull(sum(Quantity), 0) FROM dba.CubeContents WHERE CubeID = @cubeID and CardID = c.ID and AddDel = \'A\' and  ' +
		'		ChangeDate <= @date and isnull(SlotID, 0) = isnull(cc.SlotID, 0)) -  ' +
		'	(SELECT isnull(sum(Quantity), 0) FROM dba.CubeContents WHERE CubeID = @cubeID and CardID = c.ID and AddDel = \'D\' and  ' +
		'		ChangeDate <= @date and isnull(SlotID, 0) = isnull(cc.SlotID, 0)) as total, ' +
		'	cs.GeneratedName, cs.ID as SlotID, isnull(cs.Sequence, 99999) as SlotSequence, cs.ColorID as SlotColorID, ' +
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
		'WHERE cc.CubeID = @cubeID and total > 0) ' +
        'SELECT Name, cardID, GeneratedName, SlotID, SlotSequence, SlotColorID, SlotName, color ' +
        'FROM cardsInCube; ' +

        'INSERT INTO slotContents (cardName, cardID, slotGeneratedName, slotID, slotSequence, SlotColorID, slotName, color) ' +
        'SELECT null, null, cs.GeneratedName, cs.ID, isnull(cs.Sequence, 99999), cs.ColorID, ' +
        '    (SELECT FIRST DisplayName FROM dba.CubeSlotName WHERE isnull(CubeSlotID, 0) = isnull(cs.ID, 0) and DateChanged <= @date ORDER BY DateChanged), ' +
        '    null ' +
        'FROM dba.CubeSlot cs ' +
        'WHERE cs.CubeID = @cubeID and cs.ID not in (SELECT DISTINCT slotID FROM slotContents); ' +

        'INSERT INTO slotContents (cardName, cardID, slotGeneratedName, slotID, slotSequence, SlotColorID, slotName, color) ' +
        'WITH cardsWithoutSlot as ( ' +
        'SELECT c.Name, c.ID as cardID, null as GeneratedName, null as SlotID, null as SlotSequence, null as SlotColorID, null as slotName, null as color, ' +
        '   (SELECT isnull(sum(Quantity), 0) FROM dba.CubeContents WHERE CubeID = @cubeID and CardID = c.ID and AddDel = \'A\' and  ' +
		'		ChangeDate <= @date and isnull(SlotID, 0) = isnull(cc.SlotID, 0)) -  ' +
		'	(SELECT isnull(sum(Quantity), 0) FROM dba.CubeContents WHERE CubeID = @cubeID and CardID = c.ID and AddDel = \'D\' and  ' +
		'		ChangeDate <= @date and isnull(SlotID, 0) = isnull(cc.SlotID, 0)) as total ' +
        'FROM dba.CubeContents cc ' +
        'JOIN dba.Card c on c.ID = cc.CardID ' +
        'WHERE cc.CubeID = @cubeID and total > 0 and cc.SlotID is null) ' +
        'SELECT Name, cardID, GeneratedName, SlotID, SlotSequence, SlotColorID, SlotName, color ' +
        'FROM cardsWithoutSlot; ' +

        'SELECT * ' +
        'FROM slotContents ' +
        'ORDER BY slotSequence, slotGeneratedName, cardName ASC ' +
		'END'
	dbase.dbResults(cmd, function(databaseData) {
		if (databaseData.dbError) {
			callback(databaseData);
		} else {
			that.storeDatabaseSlotData(databaseData, callback);
		}
	});
};

cubeServer.prototype.storeDatabaseSlotData = function(databaseData, callback) {
	var tempSlots = {}, slotOrder = [];
	for (var i = 0; i < databaseData.length; i++) {
		var slotID = databaseData[i]['slotID'];
		if (!tempSlots[slotID]) {
			tempSlots[slotID] = new slot();
			tempSlots[slotID].slotID = slotID;
			tempSlots[slotID].generatedSlotName = databaseData[i]['slotGeneratedName'];
			tempSlots[slotID].slotName = databaseData[i]['slotName'];
			tempSlots[slotID].colorID = databaseData[i]['slotColorID'];
			slotOrder.push(slotID);
			var tempCard = new card();
			tempCard.name = databaseData[i]['slotGeneratedName'];
			tempCard.draggable = false;
			tempSlots[slotID].cards.push(tempCard);
		}
		if (databaseData[i]['cardName']) {
			var tempCard = new card();
			tempCard.name = databaseData[i]['cardName'];
			tempCard.cardID = databaseData[i]['cardID'];
			tempCard.draggable = true;
			tempSlots[slotID].cards.push(tempCard);
		}
	}
	//finished loading data, format it for client-side
	var finalJson = {};
	finalJson.slots = [];
	for (var i = 0; i < slotOrder.length; i++) {
		finalJson.slots.push(tempSlots[slotOrder[i]]);
	}
	
	this.cubeBySlotsOrdered = finalJson;
	this.cubeBySlotsKey = tempSlots;

	callback(databaseData);
};

cubeServer.prototype.elligibleSlotsForDeletion = function(callback) {
	var cmd = 
		'BEGIN ' +
		'declare @date date; ' +
		'declare @cubeID integer; ' +

		'set @date = current date; ' +
		'set @cubeID = 11; ' +

		'SELECT cs.ID, cs.GeneratedName, cs.ColorID, cs.Sequence, ' +
		'	(SELECT FIRST DisplayName FROM dba.CubeSlotName WHERE CubeSlotID = cs.ID and DateChanged <= @date ORDER BY DateChanged DESC) ' +
		'FROM dba.CubeSlot cs ' +
		'WHERE cs.CubeID = @cubeID and cs.ID not in (SELECT DISTINCT cc.SlotID ' +
		'	FROM dba.CubeContents cc ' +
		'	JOIN dba.Card c on c.ID = cc.CardID ' +
		'	WHERE cc.CubeID = @cubeID and (SELECT isnull(sum(Quantity), 0) FROM dba.CubeContents WHERE CubeID = @cubeID and CardID = c.ID and AddDel = \'A\' and ' +
		'			ChangeDate <= @date) - ' +
		'		(SELECT isnull(sum(Quantity), 0) FROM dba.CubeContents WHERE CubeID = @cubeID and CardID = c.ID and AddDel = \'D\' and ' +
		'			ChangeDate <= @date) > 0 ) ' +

		'END '
	dbase.dbResults(cmd, function(databaseData) {
		callback(databaseData);
	});
};

cubeServer.prototype.returnCubeBySlotsOrdered = function() {
	return this.cubeBySlotsOrdered;
};

cubeServer.prototype.compareClientToDB = function(clientData, callback) {
	var that = this;
	this.cardsInEachSlot(function(databaseData) {
		if (databaseData.dbError) {
			callback(databaseData);
		} else {
			that.gatherChanges(clientData, callback);
		}
	});
};

cubeServer.prototype.gatherChanges = function(clientData, callback) {
	var changeTypes = new changeType(), currentSlotSequence = 5;
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
		
		//Slot order change
		this.slotChanges[currSlot.slotID] = new change();
		this.slotChanges[currSlot.slotID].initialize(null, null, currSlot.slotID);
		this.slotChanges[currSlot.slotID].slotSequence = currentSlotSequence;
		currentSlotSequence += 5;
		
		//Slot name change
		if (currSlot.slotName != this.cubeBySlotsKey[currSlot.slotID].slotName) {
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
	this.generateChangeSQL();
	this.saveChanges(callback);
};

cubeServer.prototype.keyValueInArray = function(key, value, array) {
	for (var i = 0; i < array.length; i++) {
		if (array[i][key] == value) {
			return true;
		}
	}
	return false;
};

cubeServer.prototype.generateChangeSQL = function() {
	var date = new Date();
	for (var cardID in this.cardsAdd) {
		if (this.cardsAdded.hasOwnProperty(cardID)) {
			this.cardsAdded[cardID].SQL = 'INSERT INTO dba.CubeContents (CardID, CubeID, Quantity, AddDel, ChangeDate, SlotID) VALUES (\'' +
				dbase.safeDBString(cardID) + '\', 11, 1, \'A\', \'' + date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + '\', \'' +
				dbase.safeDBString(this.cardsAdded[cardID].slotID) + '\'); ';
			this.numberOfTransactions++;
		}
	}
	for (var cardID in this.cardsRemoved) {
		if (this.cardsRemoved.hasOwnProperty(cardID)) {
			this.cardsRemoved[cardID].SQL = 'INSERT INTO dba.CubeContents (CardID, CubeID, Quantity, AddDel, ChangeDate, SlotID) VALUES (\'' +
				dbase.safeDBString(cardID) + '\', 11, 1, \'D\', \'' + date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + '\', \'' +
				dbase.safeDBString(this.cardsRemoved[cardID].slotID) + '\'); ';
			this.numberOfTransactions++;
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
			this.numberOfTransactions++;
		}
	}
	for (var slotID in this.slotChanges) {
		if (this.slotChanges.hasOwnProperty(slotID)) {
			var slotChange = this.slotChanges[slotID];
			if (slotChange.slotName) {
				slotChange.SQL = 'INSERT INTO dba.CubeSlotName (DisplayName, CubeSlotID, DateChanged) VALUES (\'' +
					dbase.safeDBString(slotChange.slotName) + '\', \'' + dbase.safeDBString(slotID) + '\', \'' + date.getFullYear() + '-' + (date.getMonth() + 1) + '-' +
					date.getDate() + '\'); ';
			}
			slotChange.SQL += 'UPDATE dba.CubeSlot SET Sequence = \'' + dbase.safeDBString(slotChange.slotSequence) + '\' WHERE ID = \'' + dbase.safeDBString(slotID) + '\'; ';
			this.numberOfTransactions++;
		}
	}
};

cubeServer.prototype.saveChanges = function(callback) {
callback({});
return;
	for (var cardID in this.cardsAdded) {
		if (this.cardsAdded.hasOwnProperty(cardID)) {
			this.executeSQL(this.cardsAdded[cardID].SQL, callback);
		}
	}
	for (var cardID in this.cardsRemoved) {
		if (this.cardsRemoved.hasOwnProperty(cardID)) {
			this.executeSQL(this.cardsRemoved[cardID].SQL, callback);
		}
	}
	for (var cardID in this.cardsMoved) {
		if (this.cardsMoved.hasOwnProperty(cardID)) {
			this.executeSQL(this.cardsMoved[cardID].SQL, callback);
		}
	}
	for (var slotID in this.slotChanges) {
		if (this.slotChanges.hasOwnProperty(slotID)) {
			this.executeSQL(this.slotChanges[slotID].SQL, callback);
		}
	}
};

cubeServer.prototype.executeSQL = function(sqlCommand, callback) {
	var that = this;
	dbase.dbResults(sqlCommand, function(databaseData) {
		that.numTransactionsExecuted++;
		if (databaseData.dbError) {
			that.errors.push(databaseData.errorMessage);
		}
		if (that.numTransactionsExecuted == that.numberOfTransactions) {
			if (that.errors.length > 0) {
				callback({dbError: true, errors: that.errors});
			} else {
				callback({dbError: false});
			}
		}
	});
};

cubeServer.prototype.createNewSlot = function(clientData, callback) {
	this.generateSlotName(clientData, callback);
};

cubeServer.prototype.generateSlotName = function(slotData, callback) {
	// color + converted mana cost + creature/spell + increment
	var that = this, generatedName;
	function getNewSlotID(slotCreationResponse) {
		function databaseExecuted(identityResponse) {
			var newSlotID = -1;
			if (identityResponse && !identityResponse.dbError && identityResponse[0]) {
				newSlotID = identityResponse[0]['Identity'];
			}
			if (identityResponse.dbError) {
				var responseObj = {
					dbError: true,
					errors: []
				};
				responseObj.errors.push('Error retrieving identifier for new cube slot');
				if (identityResponse.errorMessage) {
					responseObj.errors.push(identityResponse.errorMessage);
				}
				callback(responseObj);
			} else if (newSlotID == -1) {
				var toClient = {};
				toClient.generatedSlotName = generatedName;
				callback(toClient);
			} else {
				var insertNameSql = 
					'INSERT INTO dba.CubeSlotName(CubeSlotID, DisplayName, DateChanged) VALUES ' +
					'(\'' + dbase.safeDBString(newSlotID) + '\', \'' + dbase.safeDBString(slotData.slotName) + '\', current date);';
				dbase.executeCommand(insertNameSql, function(nameResult) {
					if (!nameResult || nameResult.dbError) {
						var responseObj = {
							dbError: true,
							errors: []
						};
						responseObj.errors.push('Error creating name for cube slot');
						if (nameResult.errorMessage) {
							responseObj.errors.push(nameResult.errorMessage);
						}
						callback(responseObj);
					} else {
						var sqlCommand = 
							'SELECT cs.ColorID, (SELECT FIRST DisplayName FROM dba.CubeSlotName WHERE isnull(CubeSlotID, 0) = isnull(cs.ID, 0) and ' +
							'	DateChanged <= current date ORDER BY DateChanged) as SlotName ' +
							'FROM dba.CubeSlot cs ' +
							'WHERE cs.ID = \'' + dbase.safeDBString(newSlotID) + '\';';
						dbase.dbResults(sqlCommand, function(newSlotDataResponse) {
							if (!newSlotDataResponse || newSlotDataResponse.dbError) {	
								var toClient = {};
								toClient.generatedSlotName = generatedName;
								callback(toClient);
							} else if (newSlotDataResponse[0] && newSlotDataResponse[0]['ColorID']) {
								var toClient = {};
								toClient.generatedSlotName = generatedName;
								toClient.colorID = newSlotDataResponse[0]['ColorID'];
								toClient.slotID = newSlotID;
								if (newSlotDataResponse[0]['SlotName']) {
									toClient.slotName = newSlotDataResponse[0]['SlotName'];
								}
								callback(toClient);
							} else {
								var toClient = {};
								toClient.generatedSlotName = generatedName;
								callback(toClient);
							}
						});
					}
				});
			}
		};
		
		if (!slotCreationResponse) {
			var responseObj = {
				dbError: true,
				errors: []
			};
			responseObj.errors.push('No response received from database after creation of cube slot');
			callback(responseObj);
		} else {
			//callback(slotCreationResponse);
			var identitySql = 'SELECT max(ID) as Identity FROM dba.CubeSlot';
			dbase.dbResults(identitySql, databaseExecuted);
		}
	};
	function saveSlotToDB(slotCount) {
		var newCount;
		if (!slotCount[0]) {
			newCount = '01';
		} else {
			newCount = that.countToTwoDigits(slotCount[0]['slotCount']);
		}
		generatedName = name + newCount;
		
		var insertSQL =
			'INSERT INTO dba.CubeSlot(CubeID, DateAdded, GeneratedName, Sequence, ColorID) ' +
			'SELECT 11, current date, \'' + generatedName + '\', max(Sequence) + 5, (SELECT isnull(ID, 0) FROM dba.Color WHERE DisplayText = \'' + dbase.safeDBString(slotData.color) + '\') ' +
			'FROM dba.CubeSlot ' +
			'WHERE CubeID = 11;';
		dbase.executeCommand(insertSQL, getNewSlotID);
	};
	
	var name = this.getColorAbbr(slotData.color) + slotData.cmc + this.getTypeAbbr(slotData.slotType);
	var cmd = 'SELECT isnull(count(*), 0) + 1 as slotCount FROM dba.CubeSlot WHERE GeneratedName like \'' + dbase.safeDBString(name) + '%\' and CubeID=11;';
	dbase.dbResults(cmd, function(databaseData) {
		if (databaseData.dbError) {
			callback(databaseData);
		} else {
			saveSlotToDB(databaseData, callback);
		}
	});
};

cubeServer.prototype.countToTwoDigits = function(numFromDB) {
	if (numFromDB < 10) {
		return '0' + numFromDB;
	} else {
		return numFromDB;
	}
};

cubeServer.prototype.getColorAbbr = function(color) {
	if (!color || color == '') {
		return 'w';
	}
	
	switch (color.toUpperCase()) {
		case 'WHITE':
			return 'w';
		case 'BLUE':
			return 'u';
		case 'BLACK':
			return 'b';
		case 'RED':
			return 'r'
		case 'GREEN':
			return 'g';
		case 'COLORLESS':
			return 'c';
		case 'MULTICOLOR':
			return 'm';
		case 'LAND':
			return 'l';
		default:
			return 'w';
	}
};

cubeServer.prototype.getTypeAbbr = function(type) {
	if (!type || type == '') {
		return 'c';
	}
	
	switch (type.toUpperCase()) {
		case 'CREATURE':
			return 'c';
		case 'SPELL':
			return 's';
		default:
			return 'c';
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
	this.slotSequence = -1;
};
change.prototype = {};

change.prototype.initialize = function(cardID, changeType, slotID) {
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

function colorsInCube(callback) {
	return serverObject.colorsInCube(callback);
};

function cardsInEachSlot(callback) {
	return serverObject.cardsInEachSlot(callback);
};

function elligibleSlotsForDeletion(callback) {
	return serverObject.elligibleSlotsForDeletion(callback);
};

function returnCubeBySlotsOrdered() {
	return serverObject.returnCubeBySlotsOrdered();
};

function compareClientToDB(clientData, callback) {
	return serverObject.compareClientToDB(clientData, callback);
};

function createNewSlot(clientData, callback) {
	return serverObject.createNewSlot(clientData, callback);
};

var serverObject = new cubeServer();
module.exports.gatherListOfRotationEligibleCubes = gatherListOfRotationEligibleCubes;
module.exports.reset = reset;
module.exports.returnCubeList = returnCubeList;
module.exports.isValidCubeList = isValidCubeList;
module.exports.colorsInCube = colorsInCube;
module.exports.cardsInEachSlot = cardsInEachSlot;
module.exports.elligibleSlotsForDeletion = elligibleSlotsForDeletion;
module.exports.returnCubeBySlotsOrdered = returnCubeBySlotsOrdered;
module.exports.compareClientToDB = compareClientToDB;
module.exports.createNewSlot = createNewSlot;