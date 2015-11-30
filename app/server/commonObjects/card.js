'use strict';

var dbase = require('../sqlAnywhere/DatabaseInterface');

var cardObject = function(params) {
	this.data = new cardData(params);
	this.dbError = null;
};
cardObject.prototype = {};

var cardData = function(params) {
	if (params) {
		this.activeFlag = params.activeFlag ? params.activeFlag : null; //bit
		this.artist = params.artist ? params.artist : null; //?????dba.ArtistID?????
		this.cardID = params.cardID ? params.cardID : null; //integer
		this.cardName = params.cardName ? params.cardName : null; //varchar(150)
		this.collectorsNum = params.collectorsNum ? params.collectorsNum : null; //integer
		this.expansion = params.expansion ? params.expansion : null; //?????dba.SetID?????
		this.flavorText = params.flavorText ? params.flavorText : null; //varchar(32000)
		this.foil = params.foil ? params.foil : null //bool
		this.manaCost = params.manaCost ? params.manaCost : null; //varchar(20)
		this.oracleText = params.oracleText ? params.oracleText : null; //varchar(32000)
		this.power = params.power ? params.power : null; //varchar(10)
		this.printedText = params.printedText ? params.printedText : null; //varchar(32000)
		this.quantity = params.quantity ? params.quantity : null; //integer
		this.rarity =  params.rarity ? params.rarity : null; //varchar(20)
		this.subTypes = params.subTypes ? params.subTypes : [];
		this.types = params.types ? params.types : [];
		this.toughness = params.toughness ? params.toughness : null; //varchar(10)
	} else {
		this.activeFlag = null; //bit
		this.artist = null; //?????dba.ArtistID?????
		this.cardID = null; //integer
		this.cardName = null; //varchar(150)
		this.collectorsNum = null; //integer
		this.expansion = null; //?????dba.SetID?????
		this.foil = null; //bool
		this.flavorText = null; //varchar(32000)
		this.manaCost = null; //varchar(20)
		this.oracleText = null; //varchar(32000)
		this.power = null; //varchar(10)
		this.printedText = null; //varchar(32000)
		this.quantity = null //integer
		this.rarity =  null; //varchar(20)
		this.subTypes = [];
		this.toughness = null; //varchar(10)
		this.types = [];
	}
};
cardData.prototype = {};

cardObject.prototype.textToCard = function(cardNameInput, callback) {
	var that = this, cmd = 
		'SELECT ID as cardID, Name as cardName ' +
		'FROM dba.Card ' +
		'WHERE ActiveFlag = 1 and Name = \'' + dbase.safeDBString(cardNameInput) + '\' ';
	dbase.dbResults(cmd, function(databaseData) {
		that.textToCardCallback(databaseData, callback);
	});
};

cardObject.prototype.textToCardCallback = function(databaseData, callback) {
	if (databaseData && databaseData.dbError) {
		this.dbError = databaseData.dbError;
	} else if (databaseData && databaseData[0]) {
		this.data = new cardData({
			cardID: databaseData[0].cardID,
			cardName: databaseData[0].cardName
		});
	}
	callback();
};

function createCardObject(params) {
	return new cardObject(params);
}
module.exports.createCardObject = createCardObject;
