'use strict';

var dbase = require('../sqlAnywhere/DatabaseInterface');

function safeUpperCase(value) {
	if (value != null) {
		return value.toUpperCase();
	} else {
		return '';
	}
};

var gridObject = function() {
	this.gridName = null;
	this.baseTableName = null;
	
	this.columnInfo = [];
	this.columnOrder = [];
	this.tableInformation = {};
	
	this.pagingSQL = null;
	this.selectSQL = null;
	this.fromSQL = null;
	this.whereSQL = null;
	this.orderSQL = null;
	
	this.rowData = [];
};
gridObject.prototype = {};

var tableInformation = function() {
	this.tableName = null;
	this.tableAlias = null;
	this.uniqueColumnName = null;
	this.userUniqueColumnName = null;
};
tableInformation.prototype = {};

tableInformation.prototype.addProperty = function(memberName, value) {
	switch (safeUpperCase(memberName)) {
		case 'UNIQUECOLUMNNAME':
			this.uniqueColumnName = value;
			break;
		case 'USERUNIQUECOLUMNNAME':
			this.userUniqueColumnName = value;
			break;
	}
};

var gridColumnDefinition = function() {
	this.tableName = null;
	this.columnName = null;
	this.columnNameDisplayed = null;
	this.columnSize = null;
	this.cellControlType = null;
	this.columnType = null;
	
	this.foreignTableName = null;
	this.foreignColumnName = null;
	
	this.readOnly = null;
	this.columnVisible = null;
	this.defaultValue = null;
	
	this.tableAlias = null;
	this.columnAlias = null;
	
	this.htmlType = 'text';
	this.htmlDisabled = true;
	this.htmlPattern = '';
	this.htmlClass = '';
	this.htmlBlur = '';
};
gridColumnDefinition.prototype = {};

gridColumnDefinition.prototype.addProperty = function(memberName, value) {
	switch (safeUpperCase(memberName)) {
		case 'CELLCONTROLTYPE':
			this.cellControlType = value;
			break;
		case 'COLTYPE':
			this.columnType = value;
			break;
		case 'COLUMNNAME':
			this.columnName = value;
			break;
		case 'COLUMNNAMEDISPLAYED':
			this.columnNameDisplayed = value;
			break;
		case 'COLUMNVISIBLE':
			this.columnVisible = value;
			break;
		case 'DEFAULT':
			this.defaultValue = value;
			break;
		case 'FOREIGNCOLUMNNAME':
			this.foreignColumnName = value;
			break;
		case 'FOREIGNTABLENAME':
			this.foreignTableName = value;
			break;
		case 'LENGTH':
			this.columnSize = value;
			break;
		case 'READONLY':
			this.readOnly = value;
			break;
		case 'TABLENAME':
			this.tableName = value;
			break;
	}
};

gridColumnDefinition.prototype.calculateCellControlType = function() {
	if (this.cellControlType == null) {
		if (this.columnType != null && safeUpperCase(this.columnType) == 'BIT') {
			this.cellControlType = 'CHECKBOX';
		} else {
			this.cellControlType = 'LABEL';
		}
	}
};

var cellData = function() {
	this.tableName = null;
	this.columnName = null;
	this.columnType = null;
	this.readOnly = null;
	this.valueDisplayed = null;
	this.databaseValue = null;
};
cellData.prototype = {};

cellData.prototype.calculateHtmlProperties = function() {
	switch (safeUpperCase(this.columnType)) {
		case 'BIT':
			this.htmlType = 'checkbox';
			break;
		case 'DATE':
			this.htmlType = 'text';
			break;
		case 'DECREMENT':
			this.htmlType = 'text';
			this.htmlPattern = '/^\d+$/';
			this.ngBlur = 'increment(row, col, -1)';
		case 'INCREMENT':
			this.htmlType = 'text';
			this.htmlPattern = '/^\d+$/';
			this.ngBlur = 'increment(row, col, 1)';
		case 'INTEGER':
			this.htmlType= 'text';
			this.htmlPattern = '/^\d+$/';
			break;
		case 'VARCHAR':
			this.htmlType = 'text';
			break;
	}
	if (this.readOnly == false) {
		this.htmlDisabled = false;
	}
};

var currentGrid = new gridObject();

function findBaseTableName(callback) {
	var cmd = 'SELECT BaseTable ' +
		'FROM dba.GridDefinition ' +
		'WHERE GridName = \'' + dbase.safeDBString(currentGrid.gridName) + '\';';
	
	dbase.dbResults(cmd, function(databaseData) {
		currentGrid.baseTableName = databaseData[0].BaseTable;
		
		callback();
	});
};

function findColumnDefinitions(callback) {
	var cmd = 'SELECT * ' +
		'FROM dba.GridColumnInformation ' +
		'WHERE GridName = \'' + dbase.safeDBString(currentGrid.gridName) + '\' ' +
		'ORDER BY ColumnOrder ASC;';
	
	dbase.dbResults(cmd, function(databaseData) {
		var columnOrderTemp = [];
		
		for (var i = 0; i < databaseData.length; i++) {
			var nextColumn = new gridColumnDefinition();
			
			for (var columnName in databaseData[i]) {
				if (databaseData[i].hasOwnProperty(columnName)) {
					nextColumn.addProperty(columnName, databaseData[i][columnName]);
				}
			}
			nextColumn.columnAlias = 'cAlias' + (i + 1);
			nextColumn.calculateCellControlType();
			
			currentGrid.columnInfo[nextColumn.tableName + '.' + nextColumn.columnName] = nextColumn;
			currentGrid.columnOrder.push(nextColumn.tableName + '.' + nextColumn.columnName);
		}
		callback();
	});
};

function getTableInformation(callback) {
	var tableAlias = 0, totalTables = 0, dbCallsFinished = 0;
	
	for (var tableName in currentGrid.tableInformation) {
		if (currentGrid.tableInformation.hasOwnProperty(tableName)) {
			totalTables++;
		}
	}
	
	for (var columnName in currentGrid.columnInfo) {
		if (currentGrid.columnInfo.hasOwnProperty(columnName)) {
			var columnDefinition = currentGrid.columnInfo[columnName];
			
			if (currentGrid.tableInformation[columnDefinition.tableName] == null) {
				currentGrid.tableInformation[columnDefinition.tableName] = new tableInformation();
				totalTables++;
			}
		}
	}
	
	for (var tableName in currentGrid.tableInformation) {
		if (currentGrid.tableInformation.hasOwnProperty(tableName)) {
			tableInfoDBCall(tableName, tableAlias, databaseCallbackStack);
			tableAlias++;
		}
	}
	
	function databaseCallbackStack() {
		dbCallsFinished++;
		
		if (dbCallsFinished == totalTables) {
			callback();
		}
	}
};

function tableInfoDBCall(tableName, tableAlias, callback) {
	var cmd = 'SELECT * ' +
		'FROM dba.TableInformationView ' +
		'WHERE TableName = \'' + dbase.safeDBString(tableName) + '\';';
			
	dbase.dbResults(cmd, function(databaseData) {
		var nextTable = new tableInformation();
		
		for (var columnName in databaseData[0]) {
			if (databaseData[0].hasOwnProperty(columnName)) {
				nextTable.addProperty(columnName, databaseData[0][columnName]);
			}
		}
		nextTable.tableAlias = 'tAlias' + tableAlias;
		nextTable.tableName = tableName;
		
		currentGrid.tableInformation[tableName] = nextTable;
		callback();
	});
};

function assignTableAliasesToColumnInformation()
{
	for (var columnDefinition in currentGrid.columnInfo) {
		if (currentGrid.columnInfo.hasOwnProperty(columnDefinition)) {
			currentGrid.columnInfo[columnDefinition].tableAlias = currentGrid.tableInformation[currentGrid.columnInfo[columnDefinition].tableName].tableAlias;
		}
	}
};

function buildDataSQL(pageNumber) {
	buildPagingStatement(pageNumber);
	buildSelectStatement();
	buildFromStatement();
	buildWhereStatement();
	
	return currentGrid.pagingSQL + ' ' + currentGrid.selectSQL + ' ' + currentGrid.fromSQL + ' ' + currentGrid.whereSQL;
};

function buildPagingStatement(pageNumber) {
	currentGrid.pagingSQL = 'SELECT TOP 500 START AT ' + ((pageNumber - 1) * 10 + 1);
};

function buildSelectStatement() {
	currentGrid.selectSQL = '';
	
	for (var columnKey in currentGrid.columnInfo) {
		if (currentGrid.columnInfo.hasOwnProperty(columnKey)) {
			var column = currentGrid.columnInfo[columnKey];
			currentGrid.selectSQL += ' ' + dbase.safeDBString(column.tableAlias) + '.' + dbase.safeDBString(column.columnName) + ' as ' +
				dbase.safeDBString(column.columnAlias) + ',';
		}
	}
	currentGrid.selectSQL = removeLastComma(currentGrid.selectSQL);
};

function removeLastComma(input) {
	if (input.lastIndexOf(',') == input.length - 1) {
		return input.slice(0, input.length - 2);
	} else {
		return input;
	}
};

function buildFromStatement() {
	currentGrid.fromSQL = 'FROM dba.' + dbase.safeDBString(currentGrid.baseTableName) + ' AS ' +
		dbase.safeDBString(currentGrid.tableInformation[currentGrid.baseTableName].tableAlias);
	
	for (var tableName in currentGrid.tableInformation) {
		if (currentGrid.tableInformation.hasOwnProperty(tableName)) {
			if (tableName != currentGrid.baseTableName) {
				currentGrid.fromSQL += ' JOIN dba.' + dbase.safeDBString(tableName) + ' AS ' +
					dbase.safeDBString(currentGrid.tableInformation[tableName].tableAlias);
			}
		}
	}
};

function buildWhereStatement() {
	currentGrid.whereSQL = ''
}

module.exports.resetGrid = function() {
	currentGrid = new gridObject();
};

module.exports.setGridName = function(newGridName) {
	currentGrid.gridName = newGridName;
};

module.exports.isValidGrid = function() {
	return true;
};

module.exports.findTableAndColumnInformation = function(callback) {
	findBaseTableName(function() {
		findColumnDefinitions(function() {
			getTableInformation(function() {
				assignTableAliasesToColumnInformation();
				
				callback();
			});
		});
	});
};

module.exports.queryForData = function(pageNumber, callback) {
	var cmd = buildDataSQL(pageNumber), newRow, newCell, column;
	dbase.dbResults(cmd, function(databaseData) {
		for (var i = 0; i < databaseData.length; i++) {
			newRow = {};
			newRow.rowID = i + 1;
			newRow.columns = [];
			
			for (var j = 0; j < currentGrid.columnOrder.length; j++) {
				newCell = new cellData();
				column = currentGrid.columnInfo[currentGrid.columnOrder[j]];
				
				newCell.columnName = column.columnName;
				newCell.tableName = column.tableName;
				newCell.valueDisplayed = databaseData[i][column.columnAlias];
				newCell.columnType = column.columnType;
				newCell.readOnly = column.readOnly;
				newCell.calculateHtmlProperties();
				newRow.columns.push(newCell);
			}
			currentGrid.rowData.push(newRow);
		}
		callback();
	});
};

module.exports.returnFinalData = function() {
	var returnData = {};
	returnData.gridName = currentGrid.gridName;
	returnData.rows = currentGrid.rowData;
	returnData.numToDisplay = 50;
	returnData.rows[0].columns[0].readOnly = true;
	console.log(returnData.rows[0]);
	return returnData;
};

module.exports.buildPresentationData = function(callback) {
	var cmd = 'SELECT * ' + 
		'FROM dba.GridColumnInformation ' + 
		'WHERE GridName = \'' + dbase.safeDBString(currentGrid.gridName) + '\' ' + 
		'ORDER BY ColumnOrder ASC';
	
	dbase.dbResults(cmd, callback);
};