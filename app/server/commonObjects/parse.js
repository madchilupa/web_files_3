'use strict';

var parser = function() {
	//This will hold all of the text that is initially gathered. Will not be modified. Can be used to restore original state of parser
	this.initialText = '';
	
	//This will be the working copy of the text we are parsing. Will be modified as the parser accepts requests.
    //  The user of the parser should be aware that this text will be changing as requests are made (usually removing a requested chunk of text)
	this.currentText = '';
	
	//This will hold a list of errors that occur whenever any Parser function is called
	this.errorArray = [];
};
parser.prototype = {};

parser.prototype.setInitial = function(bulkText) {
	this.initialText = bulkText;
	this.currentText = bulkText;
};

parser.prototype.reset = function() {
	this.currentText = this.i.initialText;
};

parser.prototype.removeGarbage = function(origStr) {
	return origStr.replace('/r', '').replace('/n', '').replace('æ', 'ae')
		.replace('Æ', 'AE').replace('&#8212;', '-').replace('&#039;', '\'').trim();
};

parser.prototype.clipBeginning = function(endToken) {
	//<summary>
	// This is used to remove information in the text that is unneeded. This is useful if a tag needed to parse later
	// is in the text twice and we want to use the information of the second tag
	// endToken: everything before this tag will be removed. This token will also be removed. 
	//     If not found all text will be removed
	//</summary>
	
	var endSectionPosition = 0;
	
	if (endToken == null || endToken == '') {
		return;
	}
	
	endSectionPosition = this.currentText.indexOf(endToken) + endToken.length;
	if (endSectionPosition - endToken.length < 0) {
		this.currentText = '';
		return;
	}
	
	currentText = currentText.substring(endSectionPosition);
};

parser.prototype.destructiveParse = function(beginSection, endSection, startToken, endToken) {
	//<summary>
    // This is used to go through a large document and parse out needed information. This function will change the internal variable currentText
    // beginSection: the beginning of the section we are focusing on
    // endSection: the end of the section we are focusing on
    // startToken: the characters before the data desired
    // endToken: the characters following the data desired
    // 
    // the section variables are used so that we can get multiple data that have the same start and end tags
    // the token variables are the tags immediately around the desired information
    // 
    // will return an ArrayList (of length X) of information found between startToken and endToken, where X is how many times these token pairs appear
    //</summary>
	
	var startSectionPosition = 0, endSectionPosition = 0, startIdx = 0, endIdx = 0;
	var more = true;
	var toReturn = [];
	
	//the position we want is at the end of the start section, add the length of the section text
	startSectionPosition = this.currentText.indexOf(beginSection, 0);
	if (startSectionPosition < 0) {
		return toReturn;
	}
	
	while (more) {
		//is the next startToken within the range we are looking for?
		startIdx = this.currentText.indexOf(startToken, startIdx);
		if (startIdx < 0 }| startIdx >= endSectionPosition) {
			break;
		}
		
		//move the start index to the end of the start token
		startIdx += startToken.length;
		
		endIdx = this.currentText.indexOf(endToken, startIdx);
		if (endIdx < 0) {
			break;
		}
		
		//do not move the end index to the end of the end token. We do not want that token included
		toReturn.push(this.currentText.substring(startIdx, endIdx - startIdx));
		startIdx = endIdx;
	}
	this.currentText = this.currentText.substring(endSectionPosition + endSection.length);
	
	return toReturn;
};

parser.prototype.nonDesctructiveParse = function(beginSection, endSection, startToken, endToken) {
	//<summary>
    // This is used to go through a large document and parse out needed information. This function will not change the internal variable currentText
    // beginSection: the beginning of the section we are focusing on
    // endSection: the end of the section we are focusing on
    // startToken: the characters before the data desired
    // endToken: the characters following the data desired
    // 
    // the section variables are used so that we can get multiple data that have the same start and end tags
    // the token variables are the tags immediately around the desired information
    // 
    // will return an ArrayList (of length X) of information found between startToken and endToken, where X is how many times these token pairs appear
    //</summary>
	
	var startSectionPosition = 0, endSectionPosition = 0, startIdx = 0, endIdx = 0;
	var tempString = this.currentText;
	var more = true;
	var toReturn = [];
	
	//the position we want is at the end of the start section, add the length of the section text
	if (tempString.indexOf(beginSection, 0) < 0) {
		return toReturn;
	}
	startSectionPosition = tempString.indexOf(beginSection, 0) + beginSection.length;
	if (startSectionPosition < 0) {
		return toReturn;
	}
	tempString = tempString.substring(startSectionPosition);
	
	//the position we want is at the beginning of the end section, do not add the length of the section text
	endSectionPosition = tempString.indexOf(endSection, 0);
	if (endSectionPosition < 0) {
		return toReturn;
	}
	
	while (more) {
		//is the next startToken within the range we are looking for?
		startIdx = tempString.indexOf(startToken, startIdx);
		if (startIdx < 0 || startIdx >= endSectionPosition) {
			break;
		}
		
		//move the start index to the end of the start token
		startIdx += startToken.length;
		
		endIdx = tempString.indexOf(endToken, startIdx);
		if (endIdx < 0) {
			break;
		}
		
		//do not move the end index to the end of the end token. We do not want that token included
		toReturn.push(tempString.substring(startIdx, endIdx - startIdx));
	}
	
	return toReturn;
};

function createParseObject() {
	return new parser();
}
module.exports.createParseObject = createParseObject;
