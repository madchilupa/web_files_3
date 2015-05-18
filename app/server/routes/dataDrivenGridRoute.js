'use strict';

var dbGrid = require('../dbGrid/dbGridBuilder');

module.exports = function(app) {
    app.get('/gridDisplay', gatherGridData);
	
	function gatherGridData(request, response) {
		dbGrid.resetGrid();
		dbGrid.setGridName(request.query.gridName);
		
		dbGrid.findTableAndColumnInformation(constructPresentationData);
		
		function constructPresentationData() {
			dbGrid.buildPresentationData(constructGridData);
		}
		
		function constructGridData() {
			dbGrid.queryForData(1, dataDone);
		}
		
		function dataDone() {
			response.send(200, dbGrid.returnFinalData());
		}
	};
};