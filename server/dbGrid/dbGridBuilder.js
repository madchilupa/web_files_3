'use strict';

var dbase = require('../sqlAnywhere/DatabaseInterface');

function safeDBString (unsafeString) {
	var safeString = '';
	
	if (unsafeString != null && unsafeString != '') {
		safeString = unsafeString.replace(/\'/g, "''");
		safeString = safeString.replace(/\//g, "//");
		safeString = safeString.replace(/®/g, "");
	}
	
	return safeString;
};

module.exports.buildPresentationData = function(gridName, callback) {
	//var conn = sqlanywhere.createConnection();
	
	var cmd = 'SELECT * ' + 
		'FROM dba.GridColumnInformation ' + 
		'WHERE GridName = \'' + dbase.safeDBString(gridName) + '\' ' + 
		'ORDER BY ColumnOrder ASC';
	
	dbase.dbResults(cmd, callback);
	/*conn.connect(config.conn_params, function() {
		var cmd = 'SELECT * ' + 
			'FROM dba.GridColumnInformation ' + 
			'WHERE GridName = \'' + safeDBString(gridName) + '\' ' + 
			'ORDER BY ColumnOrder ASC';
		
		return conn.exec(cmd, function (error, result) {
			if (error) {
				throw error;
			}
			callback(result);
		});
	});*/
}