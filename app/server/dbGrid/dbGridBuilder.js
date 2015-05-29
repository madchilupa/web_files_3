'use strict';

var dbase = require('../sqlAnywhere/DatabaseInterface');

var gridObject = function() {
	this.gridName = null;
	this.baseTableName = null;
	
	this.columnInfo = [];
	this.columnOrder = [];
	this.tableInformation = {};
	this.gridProperties = {};
	
	this.pagingSQL = null;
	this.selectSQL = null;
	this.fromSQL = null;
	this.whereSQL = null;
	this.orderSQL = null;
	
	this.rowData = [];
};
gridObject.prototype = {};

gridObject.prototype.setGridName = function(newGridName) {
	this.gridName = newGridName;
};

gridObject.prototype.isValidGrid = function() {
	return true;
};

gridObject.prototype.findTableAndColumnInformation = function(callback) {
	var that = this;
	this.findBaseTableName(function() {
		that.findColumnDefinitions(function() {
			that.getTableInformation(function() {
				that.assignTableAliasesToColumnInformation();
				
				callback();
			});
		});
	});
};

gridObject.prototype.findBaseTableName = function(callback) {
	var that = this, cmd = 'SELECT BaseTable ' +
		'FROM dba.GridDefinition ' +
		'WHERE GridName = \'' + dbase.safeDBString(this.gridName) + '\';';
	
	dbase.dbResults(cmd, function(databaseData) {
		that.baseTableName = databaseData[0].BaseTable;
		
		callback();
	});
};

gridObject.prototype.findColumnDefinitions = function(callback) {
	var that = this, cmd = 'SELECT * ' +
		'FROM dba.GridColumnInformation ' +
		'WHERE GridName = \'' + dbase.safeDBString(this.gridName) + '\' ' +
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
			
			that.columnInfo[nextColumn.tableName + '.' + nextColumn.columnName] = nextColumn;
			that.columnOrder.push(nextColumn.tableName + '.' + nextColumn.columnName);
		}
		callback();
	});
};

gridObject.prototype.getTableInformation = function(callback) {
	var tableAlias = 0, totalTables = 0, dbCallsFinished = 0;
	
	for (var tableName in this.tableInformation) {
		if (this.tableInformation.hasOwnProperty(tableName)) {
			totalTables++;
		}
	}
	
	for (var columnName in this.columnInfo) {
		if (this.columnInfo.hasOwnProperty(columnName)) {
			var columnDefinition = this.columnInfo[columnName];
			
			if (this.tableInformation[columnDefinition.tableName] == null) {
				this.tableInformation[columnDefinition.tableName] = new tableInformation();
				totalTables++;
			}
		}
	}
	
	for (var tableName in this.tableInformation) {
		if (this.tableInformation.hasOwnProperty(tableName)) {
			this.tableInfoDBCall(tableName, tableAlias, databaseCallbackStack);
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

gridObject.prototype.tableInfoDBCall = function(tableName, tableAlias, callback) {
	var that = this, cmd = 'SELECT * ' +
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
		
		that.tableInformation[tableName] = nextTable;
		callback();
	});
};

gridObject.prototype.assignTableAliasesToColumnInformation = function()
{
	for (var columnDefinition in this.columnInfo) {
		if (this.columnInfo.hasOwnProperty(columnDefinition)) {
			var column = this.columnInfo[columnDefinition];
			column.tableAlias = this.tableInformation[column.tableName].tableAlias;
			column.columnAlias = column.tableAlias + column.columnAlias;
		}
	}
};

gridObject.prototype.queryForData = function(pageNumber, callback) {
	var cmd = this.buildDataSQL(pageNumber), newRow, newCell, column, that = this;
	dbase.dbResults(cmd, function(databaseData) {
		for (var i = 0; i < databaseData.length; i++) {
			newRow = {};
			newRow.rowID = i + 1;
			newRow.columns = [];
			newRow.changes = false;
			
			for (var j = 0; j < that.columnOrder.length; j++) {
				newCell = new cellData();
				column = that.columnInfo[that.columnOrder[j]];
				
				newCell.columnName = column.columnName;
				newCell.tableName = column.tableName;
				newCell.valueDisplayed = databaseData[i][column.columnAlias];
				newCell.origValue = databaseData[i][column.columnAlias];
				newCell.columnType = column.columnType;
				newCell.readOnly = column.readOnly;
				newCell.changed = false;
				newRow.columns.push(newCell);
			}
			that.rowData.push(newRow);
		}
		callback();
	});
};

gridObject.prototype.buildDataSQL = function(pageNumber) {
	this.buildPagingStatement(pageNumber);
	this.buildSelectStatement();
	this.buildFromStatement();
	this.buildWhereStatement();
	
	return this.pagingSQL + ' ' + this.selectSQL + ' ' + this.fromSQL + ' ' + this.whereSQL;
};

gridObject.prototype.buildPagingStatement = function(pageNumber) {
	//this.pagingSQL = 'SELECT TOP 500 START AT ' + ((pageNumber - 1) * 10 + 1);
	this.pagingSQL = 'SELECT TOP 5 START AT ' + ((pageNumber - 1) * 10 + 1);
};

gridObject.prototype.buildSelectStatement = function() {
	this.selectSQL = '';
	
	for (var columnKey in this.columnInfo) {
		if (this.columnInfo.hasOwnProperty(columnKey)) {
			var column = this.columnInfo[columnKey];
			this.selectSQL += ' ' + dbase.safeDBString(column.tableAlias) + '.' + dbase.safeDBString(column.columnName) + ' as ' +
				dbase.safeDBString(column.columnAlias) + ',';
		}
	}
	this.selectSQL = removeLastComma(this.selectSQL);
};

gridObject.prototype.buildFromStatement = function() {
	this.fromSQL = 'FROM dba.' + dbase.safeDBString(this.baseTableName) + ' AS ' +
		dbase.safeDBString(this.tableInformation[this.baseTableName].tableAlias);
	
	for (var tableName in this.tableInformation) {
		if (this.tableInformation.hasOwnProperty(tableName)) {
			if (tableName != this.baseTableName) {
				this.fromSQL += ' JOIN dba.' + dbase.safeDBString(tableName) + ' AS ' +
					dbase.safeDBString(this.tableInformation[tableName].tableAlias);
			}
		}
	}
};

gridObject.prototype.buildWhereStatement = function() {
	this.whereSQL = ''
}

gridObject.prototype.returnFinalData = function() {
	var returnData = {};
	returnData.gridName = this.gridName;
	returnData.rows = this.rowData;
	returnData.possibleChanges = false;
	returnData.gridProperties = this.gridProperties;
	return returnData;
};

gridObject.prototype.buildPresentationData = function(callback) {
	var that = this, cmd = 'SELECT * ' + 
		'FROM dba.GridColumnInformation ' + 
		'WHERE GridName = \'' + dbase.safeDBString(this.gridName) + '\' ' + 
		'ORDER BY ColumnOrder ASC';
	dbase.dbResults(cmd, function(databaseData) {
		that.saveGridProperties(databaseData, callback);
	});
};

gridObject.prototype.saveGridProperties = function(databaseData, callback) {
	this.gridProperties = {};
	for (var i = 0; i < databaseData.length; i++) {
		this.gridProperties[databaseData[i].ColumnName] = databaseData[i];
	}
	callback();
}

gridObject.prototype.saveGridData = function(postData) {
	//for each row, find which columns changed.
		//build update statement
		//	determine PK value for row, and primary table
		//	determine which columns that didn't change need to be part of the update statement
		
	//Final SQL should look like:
	//	UPDATE dba.TableName SET ColumnName1 = Value1, ColumnName2 = Value2 WHERE PKColumn = PKValue;
	for (var row in postData) {
		if (postData.hasOwnProperty(row)) {
			var sql = '';
			sql += ' SET';
			for (var col in row.columns) {
				if (row.columns.hasOwnProperty(col)) {
					if (col.changed == true) {
						sql += ' ' + dbase.safeDBString(col.columnName) + ' = ' + dbase.safeDBString(col.valueDisplayed) + ',';
					}
				}
			}
			sql = removeLastComma(sql);
			
			sql += ' WHERE ';
		}
	}
};

var tableInformation = function() {
	this.tableName = null;
	this.tableAlias = null;
	this.uniqueColumnName = null;
	this.userUniqueColumnName = null;
};
tableInformation.prototype = {};

tableInformation.prototype.addProperty = function(memberName, value) {
	switch (memberName.toUpperCase()) {
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
};
gridColumnDefinition.prototype = {};

gridColumnDefinition.prototype.addProperty = function(memberName, value) {
	switch (memberName.toUpperCase()) {
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
		if (this.columnType != null && this.columnType.toUpperCase == 'BIT') {
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

/**********************************************************/
function removeLastComma(input) {
	if (input.lastIndexOf(',') == input.length - 1) {
		return input.slice(0, input.length - 2);
	} else {
		return input;
	}
};

function resetGrid() {
	serverObject = new gridObject();
};

function setGridName(newGridName) {
	serverObject.setGridName(newGridName);
};

function isValidGrid() {
	return serverObject.isValidGrid();
};

function findTableAndColumnInformation(callback) {
	return serverObject.findTableAndColumnInformation(callback);
};

function queryForData(pageNumber, callback) {
	return serverObject.queryForData(pageNumber, callback);
};

function returnFinalData() {
	return serverObject.returnFinalData();
};

function buildPresentationData(callback) {
	return serverObject.buildPresentationData(callback);
};

function saveGridData(postData) {
	return serverObject.saveGridData(postData);
};

var serverObject = new gridObject();
module.exports.resetGrid = resetGrid;
module.exports.setGridName = setGridName;
module.exports.isValidGrid = isValidGrid;
module.exports.findTableAndColumnInformation = findTableAndColumnInformation;
module.exports.queryForData = queryForData;
module.exports.returnFinalData = returnFinalData;
module.exports.buildPresentationData = buildPresentationData;
module.exports.saveGridData = saveGridData;