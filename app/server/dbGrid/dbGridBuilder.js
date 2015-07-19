'use strict';

var dbase = require('../sqlAnywhere/DatabaseInterface');

var gridObject = function() {
	this.gridName = null;
	this.baseTableName = null;
	this.gridNameDisplayed = null;
	
	this.columnInfo = [];
	this.columnOrder = [];
	this.tableInformation = {};
	this.gridProperties = {};
	this.gridColumnProperties = {};
	this.gridFilters = [];
	
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

gridObject.prototype.setGridProperties = function(gridProperties) {
	this.gridProperties = gridProperties;
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
	var that = this, cmd = 'SELECT BaseTable, GridNameDisplayed ' +
		'FROM dba.GridDefinition ' +
		'WHERE GridName = \'' + dbase.safeDBString(this.gridName) + '\';';
	
	dbase.dbResults(cmd, function(databaseData) {
		that.baseTableName = databaseData[0].BaseTable;
		that.gridNameDisplayed = databaseData[0].GridNameDisplayed;
		
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
			
			if (this.tableInformation[columnDefinition.tableName] == null && checkNotEmpty(columnDefinition.tableName)) {
				this.tableInformation[columnDefinition.tableName] = new tableInformation();
				totalTables++;
			}
			
			if (this.tableInformation[columnDefinition.foreignTableName] == null && checkNotEmpty(columnDefinition.foreignTableName)) {
				this.tableInformation[columnDefinition.foreignTableName] = new tableInformation();
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
				if (checkNotEmpty(column.foreignUniqueColType)) {
					newCell.columnType = column.foreignUniqueColType;
				} else {
					newCell.columnType = column.columnType;
				}
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
	this.buildOrderByStatement();
	
	return this.pagingSQL + ' ' + this.selectSQL + ' ' + this.fromSQL + ' ' + this.whereSQL + ' ' + this.orderSQL;
};

gridObject.prototype.buildPagingStatement = function(pageNumber) {
	this.pagingSQL = 'SELECT TOP 100 START AT ' + ((pageNumber - 1) * 10 + 1);
	//this.pagingSQL = 'SELECT TOP 5 START AT ' + ((pageNumber - 1) * 10 + 1);
};

gridObject.prototype.buildSelectStatement = function() {
	this.selectSQL = '';
	
	for (var columnKey in this.columnInfo) {
		if (this.columnInfo.hasOwnProperty(columnKey)) {
			var column = this.columnInfo[columnKey];
			
			if (checkNotEmpty(column.foreignTableName) && checkNotEmpty(column.foreignUniqueColumn)) {
				this.selectSQL += ' ' + dbase.safeDBString(this.tableInformation[column.foreignTableName].tableAlias) + '.' + 
					dbase.safeDBString(column.foreignUniqueColumn) + ' as ' + dbase.safeDBString(column.columnAlias) + ',';
			} else {
				this.selectSQL += ' ' + dbase.safeDBString(column.tableAlias) + '.' + dbase.safeDBString(column.columnName) + ' as ' +
					dbase.safeDBString(column.columnAlias) + ',';
			}
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
	this.whereSQL = 'WHERE 1=1 ';
	
	for (var i = 0; i < this.gridFilters.length; i++) {
		var filterName = this.gridFilters[i].filterName;
		
		if (this.gridProperties[filterName] != null) {
			this.whereSQL += ' AND ' + this.tableInformation[this.gridFilters[i].tableName].tableAlias + '.' + this.gridFilters[i].columnName + ' = \'' +
				dbase.safeDBString(this.gridProperties[filterName]) + '\' ';
		}
	}
}

gridObject.prototype.buildOrderByStatement = function() {
	var gridHasSort = false;
	this.orderSQL = 'ORDER BY ';
	
	for (var columnKey in this.columnInfo) {
		if (this.columnInfo.hasOwnProperty(columnKey)) {
			var column = this.columnInfo[columnKey];

			if (checkNotEmpty(column.sortOrder)) {
				gridHasSort = true;
				this.orderSQL += ' ' + dbase.safeDBString(column.columnAlias);
				
				if (!checkNotEmpty(column.sortType) || column.sortType == 'A') {
					this.orderSQL += ' ASC,';
				} else {
					this.orderSQL += ' DESC,';
				}
			}
		}
	}

	if (!gridHasSort) {
		this.orderSQL = '';
	} else {
		this.orderSQL = removeLastComma(this.orderSQL);
	}
}

gridObject.prototype.returnFinalData = function() {
	var returnData = {};
	returnData.gridName = this.gridName;
	returnData.rows = this.rowData;
	returnData.possibleChanges = false;
	returnData.gridColumnProperties = this.gridColumnProperties;
	returnData.gridNameDisplayed = this.gridNameDisplayed;
	returnData.gridSQL = this.pagingSQL + ' ' + this.selectSQL + ' ' + this.fromSQL + ' ' + this.whereSQL + ' ' + this.orderSQL;
	return returnData;
};

gridObject.prototype.buildPresentationData = function(callback) {
	var that = this, cmd = 'SELECT * ' + 
		'FROM dba.GridColumnInformation ' + 
		'WHERE GridName = \'' + dbase.safeDBString(this.gridName) + '\' ' + 
		'ORDER BY ColumnOrder ASC';
	dbase.dbResults(cmd, function(databaseData) {
		that.saveGridColumnProperties(databaseData, callback);
	});
};

gridObject.prototype.saveGridColumnProperties = function(databaseData, callback) {
	this.gridColumnProperties = {};
	for (var i = 0; i < databaseData.length; i++) {
		this.gridColumnProperties[databaseData[i].ColumnName] = databaseData[i];
	}
	this.buildGridFilters(callback);
};

gridObject.prototype.buildGridFilters = function(callback) {
	var that = this, cmd = 
		'SELECT gf.FilterName, gf.TableName, gf.ColumnName ' +
		'FROM dba.GridFilter gf ' +
		'JOIN dba.GridDefinition gd on gd.ID = gf.GridID ' +
		'WHERE gd.GridName = \'' + this.gridName + '\';';
	
	dbase.dbResults(cmd, function(databaseData) {
		that.saveGridFilters(databaseData, callback);
	});
};

gridObject.prototype.saveGridFilters = function(databaseData, callback) {
	for (var i = 0; i < databaseData.length; i++) {
		var nextFilter = new filter();
		
		for (var columnName in databaseData[i]) {
			if (databaseData[i].hasOwnProperty(columnName)) {
				nextFilter.addProperty(columnName, databaseData[i][columnName]);
			}
		}
		
		this.gridFilters.push(nextFilter);
	}
	callback();
};

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
	this.sortOrder = null;
	this.sortType = null;
	
	this.foreignTableName = null;
	this.foreignColumnName = null;
	this.foreignUniqueColType = null;
	this.foreignUniqueColumn = null;
	
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
		case 'FOREIGNUNIQUECOLTYPE':
			this.foreignUniqueColType = value;
			break;
		case 'FOREIGNUNIQUECOLUMN':
			this.foreignUniqueColumn = value;
			break;
		case 'LENGTH':
			this.columnSize = value;
			break;
		case 'READONLY':
			this.readOnly = value;
			break;
		case 'SORTORDER':
			this.sortOrder = value;
			break;
		case 'SORTTYPE':
			this.sortType = value;
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

var filter = function() {
	this.filterName = null;
	this.tableName = null;
	this.columnName = null;
};
filter.prototype = {};

filter.prototype.addProperty = function(memberName, value) {
	switch (memberName.toUpperCase()) {
		case 'COLUMNNAME':
			this.columnName = value;
			break;
		case 'FILTERNAME':
			this.filterName = value;
			break;
		case 'TABLENAME':
			this.tableName = value;
			break;
	}
};

/**********************************************************/
function checkNotEmpty(input) {
	if (input == null || input == '') {
		return false;
	} else {
		return true;
	}
}

function removeLastComma(input) {
	if (input.lastIndexOf(',') == input.length - 1) {
		return input.slice(0, input.length - 1);
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

function setGridProperties(gridProperties) {
	serverObject.setGridProperties(gridProperties);
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
module.exports.setGridProperties = setGridProperties;
module.exports.isValidGrid = isValidGrid;
module.exports.findTableAndColumnInformation = findTableAndColumnInformation;
module.exports.queryForData = queryForData;
module.exports.returnFinalData = returnFinalData;
module.exports.buildPresentationData = buildPresentationData;
module.exports.saveGridData = saveGridData;

function createServerObject () {
	return new gridObject();
}
module.exports.createServerObject = createServerObject;
module.exports.gridProperties = getGridProp;
function getGridProp() {
	return serverObject.gridProperties;
}