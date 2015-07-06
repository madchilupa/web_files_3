'use strict';

var dbGrid = require('../dbGrid/dbGridBuilder');

module.exports = function(app) {
    app.get('/gridDisplay', gatherGridData);
	
	function gatherGridData(request, response) {
		var tempObj = dbGrid.createServerObject();
		
		//tempObj.resetGrid();
		tempObj.setGridName(request.query.gridName);
		if (request.query.gridProperties) {
			tempObj.setGridProperties(JSON.parse(request.query.gridProperties));
		}
		
		tempObj.findTableAndColumnInformation(constructPresentationData);
		
		function constructPresentationData() {
			tempObj.buildPresentationData(constructGridData);
		}
		
		function constructGridData() {
			tempObj.queryForData(1, dataDone);
		}
		
		function dataDone() {
			response.send(200, tempObj.returnFinalData());
		}
	};
};