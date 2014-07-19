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
		dbGrid.buildPresentationData(request.query.grid, constructGridData);
		/*var conn = sqlanywhere.createConnection();
		
		conn.connect(config.conn_params, function() {
		  conn.exec('SELECT * FROM ' + request.query.grid, function (error, result) {
			if (error) throw error;

			response.send(200, constructGridData(result));
		  })
		});*/
		
		function constructGridData(databasePresentationData) {
			/*var presentationData = {};
			presentationData.columnInfo = {};
			presentationData.columnOrder = [];*/
			
			var finalData = {};
			finalData.gridName = request.query.grid;
			finalData.rows = [];
			
			for (var i = 0; i < databasePresentationData.length; i++) {
				finalData.rows.push({
					columns: buildColumns(databasePresentationData[i]),
					rowID: i+1
				});
			}
			
			/*for (var i = 0; i < databasePresentationData.count; i++) {
				var currentColumn = databasePresentationData[i];
				var uniqueKey = currentColumn.tableName + '.' +  currentColoumn.columnName;
					
				presentationData.columnInfo[uniqueKey] = currentColumn;
				presentationData.push(uniqueKey);
			}*/
			response.send(200, finalData);
			var result = {};
			var presentationData = {};
			
			//presentationData = dbGrid.
		}
		
		function buildColumns(currDBColumn) {
			return [{
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
			}];
		}
	}	
};