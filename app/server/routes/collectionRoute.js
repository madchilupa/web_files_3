'use strict';

var dbGrid = require('../dbGrid/dbGridBuilder');

module.exports = function(app) {
    app.get('/collectionData', gatherGridData);
	
	app.post('/collectionData', saveGridData);

    /*app.post('/service/officesupplies', officesupplies.add);

    app.post('/service/officesupplies/:id', officesupplies.update);*/
	
	
	function gatherGridData(request, response) {
		dbGrid.resetGrid();
		dbGrid.setGridName(request.query.grid);
		
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
	
	function saveGridData(request, response) {
		console.log(request.body);
		dbGrid.saveGridData(request.body);
	};
};