'use strict';

var dbase = require('../sqlAnywhere/DatabaseInterface');
var cardReq = require('../commonObjects/card');

var lineTypeEnum = {};
lineTypeEnum['CARD'] = 0;
lineTypeEnum['QUANTITY'] = 1;
lineTypeEnum['ABBR'] = 2;

var lineTranslation = function () {
	this.originalText = null;
	this.wordList = [];
	this.wordsTestedAsNames = 0;
	this.wordsToTest = 0;
	
	this.lineType = -1;
	this.quantity = null;
	this.card = null;
	this.setAbbr = null;
	
	this.setAbbrTested = false;
	this.cardNamesTested = false;
	
	this.TEXTDELIMITER = ' ';
	
	this.dbErrors = [];
	this.translationCompleteCallback = function () {};
};
lineTranslation.prototype = {};

lineTranslation.prototype.parseLine = function() {
	this.removeUnwantedCharacters();
	this.wordList = this.originalText.split(this.TEXTDELIMITER);
	
	this.testForQuantity();
	this.testForFoil();
	
	//following two functions are asynchronous
	this.testForSetAbbr();
	this.testForCardName();
};

lineTranslation.prototype.removeUnwantedCharacters = function() {
	this.originalText = this.originalText.replace(/\t/g, ' ').replace(/\(/g, '').replace(/\)/g, '').replace(/\s+/g, ' ');
};

lineTranslation.prototype.testForQuantity = function() {
	//evaluate each word looking for a numeral, or a numeral with an 'x' before or after it
	var evaluation = null;

	for (var i = 0; i < this.wordList.length; i++) {
		var testForQuant = /\d|\xd|\dx/;
		evaluation = testForQuant.exec(this.wordList[i]);
		
		if (evaluation) {
			this.quantity = evaluation[0];
			//current index is a quantity, remove from array of words to be evaluated
			this.wordList.splice(i, 1);
			i--;
			break;
		}
	}
};

lineTranslation.prototype.testForFoil = function() {
	//TODO: implement. be mindful of the card with name "Foil"
};

lineTranslation.prototype.testForSetAbbr = function() {
	var dbSafeWordList = this.makeArrayDBSafe(this.wordList);
	
	var wordsAsString = dbSafeWordList.join('\',\''), that = this;
	var cmd = 'SELECT s.ID as setID, s.Name as setName, s.Abbr as setAbbr ' +
		'FROM dba.Sets s ' +
		'WHERE s.Abbr in (\'' + wordsAsString + '\') or s.Abbr || \',\' in (\'' + wordsAsString+ '\') ' +
		'	or CHARINDEX(s.Name, \'' + this.originalText + '\') > 0 ' +
		'ORDER BY s.Name ASC;';
	console.log('cmd');
	console.log(cmd);
	dbase.dbResults(cmd, function(databaseData) {
		that.testForSetAbbrCallback(databaseData);
	});
};

lineTranslation.prototype.makeArrayDBSafe = function(array) {
	var newArray = [];
	
	for (var i = 0; i < array.length; i++) {
		newArray.push(dbase.safeDBString(array[i]));
	}
	
	return newArray;
};

lineTranslation.prototype.testForSetAbbrCallback = function(databaseData) {
	//Only accepting one set abbreviation at this time
	console.log('this (lineTranslation) after DB call for testFroSetAbbr');
	console.log(this);
	console.log('databaseData testForSetAbbr');
	console.log(databaseData);
	if (!databaseData) {
		this.dbErrors.push('No response from database while looking for set abbreviation.');
	} else if (databaseData.dbError) {
		this.dbErrors.push(databaseData.dbError);
	/*} else if (!databaseData[0]) {
		this.dbErrors.push('No set abbreviation found.');
	} else {*/
	} else if (databaseData[0]) {
		this.setAbbr = databaseData[0].setAbbr;
	}
	this.setAbbrTested = true;
	this.dbTestCallback();
};

lineTranslation.prototype.testForCardName = function() {
	//test entire input (what remains after quantity test [and maybe abbr test in the future])
	//if that fails then break input into smaller and smaller words until a card name is found
	var possibleCardNames = [];
	var partialArray = [];
	var that = this;
	var numWordsPerName = this.wordList.length - 1;
	
	this.card = {};
	possibleCardNames.push(this.wordList.join(' '));
	
	for (numWordsPerName; numWordsPerName >= 1; numWordsPerName--) {
		var numPossibleNames = this.wordList.length - numWordsPerName + 1;
		for (var i = 0; i < numPossibleNames; i++) {
			var nameLength = numWordsPerName - 1;
			
			partialArray = slicePartial(this.wordList, i, nameLength + i);
			possibleCardNames.push(partialArray.join(' '));
		}
	}
	
	this.wordsToTest = possibleCardNames.length;
	
	for (var i = 0; i < this.wordsToTest; i++) {
		var newCard = cardReq.createCardObject();
		newCard.textToCard(possibleCardNames[i], function(updatedCard) {
			return function() {
				that.testForCardNameCallback(updatedCard);
			}
		} (newCard));
	}
};

lineTranslation.prototype.testForCardNameCallback = function(cardObject) {
	if (cardObject.data.cardID != '' && cardObject.data.cardID !=  null) {
		if (this.card.cardID) {
			//a card was already found. favor card names that are longer
			// Due to how we are parsing the line, an input of "Armageddon Clock" will return two possible cards
			// We want the card name that uses more consecutive words
			if (this.card.cardName && cardObject.data.cardName && this.card.cardName.length < cardObject.data.cardName.length) {
				this.card = cardObject.data;
			}
		} else {
			this.card = cardObject.data;
		}
	}
	this.wordsTestedAsNames++;
	if (this.wordsTestedAsNames >= this.wordsToTest) {
		this.cardNamesTested = true;
		this.dbTestCallback();
	}
};

function slicePartial(oldArray, start, end) {
	var newArray = [];
	
	if (!end && end != 0) {
		//if end was not given, just go to the end of the array
		end = oldArray.length - 1;
	}
	
	for (var i = start; i <= end; i++) {
		newArray.push(oldArray[i]);
	}
	return newArray;
};

lineTranslation.prototype.dbTestCallback = function() {
	if (this.setAbbrTested && this.cardNamesTested) {
		//TODO: still need to make sure that the card name and set abbr go together (card is actually in the found set)
		this.card.expansion = this.setAbbr;
		this.card.quantity = this.quantity;
		
		this.translationCompleteCallback(this);
	}
};

var listObject = function() {
	this.data = new listObjectData();
	this.TEXTDELIMITER = ' ';
	
	this.lines = [];
	
	this.totalToEvaluate = 0;
	this.numEvaluated = 0;
	
	this.routeCallback = null;
	this.dbErrors = [];
};
listObject.prototype = {};
/*
listObject.prototype.parseLineOfText = function(lineOfText) {
	//split the entire line of text into an array based on the delimiter constant.
	// then evaluate each index as a card name, quantity, or set abbreviation
	var wordList = lineOfText.split(this.TEXTDELIMITER);
	var evaluatedLine = new lineTranslation();
	var evaluation = null;
	console.log('regEx');

	for (var i = 0; i < wordList.length; i++) {
		var testForQuant = /\d|\xd|\dx/;
		evaluation = testForQuant.exec(wordList[i]);
		
		console.log(wordList[i]);
		console.log(evaluation);
		if (evaluation) {
			console.log('passed');
			evaluatedLine.quantity = evaluation[0];
			//current index is a quantity, remove from array of words to be evaluated
			wordList.splice(i, 1);
			i--;
			break;
		}
	}
	console.log('words left');
	console.log(wordList);
};

listObject.prototype.textToCard = function(cardNameInput) {
	var that = this, cardObj = cardReq.createCardObject();
	cardObj.textToCard(cardNameInput, function() {
		that.textToCardCallback(cardObj, cardNameInput);
	});
};

listObject.prototype.textToCardCallback = function(cardObj, cardNameInput) {
	if (cardObj.dbError) {
		this.data.cardsNotFound.push(cardNameInput);
		this.dbErrors.push(cardObj.dbError);
	} else if (!cardObj.data.cardID || cardObj.data.cardID == '') {
		this.data.cardsNotFound.push(cardNameInput);
	} else {
		this.data.cardsFound.push(cardObj.data);
	}
	
	this.numEvaluated++;
	if (this.numEvaluated >= this.totalToEvaluate) {
		this.routeCallback({
			cardsNotFound: this.data.cardsNotFound,
			cardsFound: this.data.cardsFound
		});
	}
};*/

listObject.prototype.lineTranslationComplete = function(lineObject) {
	if (lineObject.dbErrors.length > 0) {
		this.data.cardsNotFound.push(lineObject.originalText);
		this.dbErrors = this.dbErrors.concat(lineObject.dbErrors);
	} else if (!lineObject.card || !lineObject.card.cardID || lineObject.card.cardID == '') {
		this.data.cardsNotFound.push(lineObject.originalText);
	} else {
		this.data.cardsFound.push(lineObject.card);
	}
	
	this.numEvaluated++;

	if (this.numEvaluated >= this.totalToEvaluate) {
		this.routeCallback({
			cardsNotFound: this.data.cardsNotFound,
			cardsFound: this.data.cardsFound
		});
	}
};

var listObjectData = function() {
	this.rawText = [];
	this.cardsFound = [];
	this.cardsNotFound = [];
};
listObjectData.prototype = {};

var listObjectPublic = function() {
	this.listObject = new listObject();
};
listObjectPublic.prototype = {};

listObjectPublic.prototype.setRawText = function(rawText) {
	this.listObject.data.rawText = rawText;
};

listObjectPublic.prototype.rawTextToCards = function(routeCallback) {
	var that = this;
	this.listObject.totalToEvaluate = this.listObject.data.rawText.length;
	this.listObject.numEvaluated = 0;
	this.listObject.routeCallback = routeCallback;
	
	if (!this.listObject.totalToEvaluate || this.listObject.totalToEvaluate == 0) {
		this.listObject.routeCallback({dbError: 'Nothing to evaluate'});
	}
	
	for (var i =0; i < this.listObject.data.rawText.length; i++) {
		var newLineEvaluation = new lineTranslation();
		newLineEvaluation.originalText = this.listObject.data.rawText[i];
		newLineEvaluation.translationCompleteCallback = function(lineObj) {
			that.listObject.lineTranslationComplete(lineObj);
		}
		newLineEvaluation.parseLine();
	}
	/*for (var i = 0; i < this.listObject.data.rawText.length; i++) {
		this.listObject.parseLineOfText(this.listObject.data.rawText[i]);
		this.listObject.textToCard(this.listObject.data.rawText[i]);
	}*/
	
	function lineDone() {
		this.listObject.numEvaluated++;
		//numEvaluated++
		//compare to total to eval
	}
};

function createServerObject () {
	return new listObjectPublic();
}
module.exports.createServerObject = createServerObject;