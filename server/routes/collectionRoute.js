'use strict';

var dbGrid = require('../dbGrid/dbGridBuilder');

module.exports = function(app) {
    app.get('/collectionData', gatherGridData);
	
	app.post('/collectionData', function(req, res) {
		//testDatabaseStuff(req, res);
	});

    /*app.post('/service/officesupplies', officesupplies.add);

    app.post('/service/officesupplies/:id', officesupplies.update);*/
	
	
	function gatherGridData(request, response) {
		dbGrid.resetGrid();
		dbGrid.setGridName(request.query.grid);
		
		dbGrid.findTableAndColumnInformation(function() {
			dbGrid.buildPresentationData(constructGridData);
		});
		
		/*dbGrid.findBaseTableName(function() {
			dbGrid.buildPresentationData(constructGridData);
		});*/
		
		function constructGridData(databasePresentationData) {
			dbGrid.queryForData(1, dataDone);
		}
		
		function dataDone() {
			response.send(200, dbGrid.returnFinalData());
		}
		
			/*var presentationData = {};
			presentationData.columnInfo = {};
			presentationData.columnOrder = [];*/
			
			// var finalData = {};
			// finalData.gridName = request.query.grid;
			// finalData.rows = [];
			
			// for (var i = 0; i < databasePresentationData.length; i++) {
				// finalData.rows.push({
					// columns: buildColumns(databasePresentationData[i]),
					// rowID: i+1
				// });
			// }
			
			/*for (var i = 0; i < databasePresentationData.count; i++) {
				var currentColumn = databasePresentationData[i];
				var uniqueKey = currentColumn.tableName + '.' +  currentColoumn.columnName;
					
				presentationData.columnInfo[uniqueKey] = currentColumn;
				presentationData.push(uniqueKey);
			}*/
			// response.send(200, finalData);
			// var result = {};
			// var presentationData = {};
			
			//presentationData = dbGrid.
		// }
		
		function buildColumns(databaseRowData) {
			/*return [{
				tableName: request.query.grid,
				columnName: 'ColumnName',
				columnType: 'varchar',
				readOnly: true,
				valueDisplayed: currDBColumn.ColumnName
			},{
				tableName: request.query.grid,
				columnName: 'ColType',
				columnType: 'varchar',
				readOnly: true,
				valueDisplayed: currDBColumn.coltype
			},{
				tableName: request.query.grid,
				columnName: 'ReadOnly',
				columnType: 'varchar',
				readOnly: true,
				valueDisplayed: currDBColumn.ReadOnly
			},{
			tableName: request.query.grid,
				columnName: 'Name Displayed',
				columnType: 'varchar',
				readOnly: true,
				valueDisplayed: currDBColumn.ColumnNameDisplayed
			}];*/
		}
	}	
};