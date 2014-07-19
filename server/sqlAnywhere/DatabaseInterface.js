'use strict'

var config = require('../config'),
	sqlAnywhere = require('sqlanywhere');

module.exports.safeDBString = function(unsafeString) {
	var safeString = '';
	
	if (unsafeString != null && unsafeString != '') {
		safeString = unsafeString.replace(/\'/g, "''");
		safeString = safeString.replace(/\//g, "//");
		safeString = safeString.replace(/®/g, "");
	}
	
	return safeString;
};

module.exports.dbResults = function(cmdString, callback) {
	var conn = sqlAnywhere.createConnection();
	
	conn.connect(config.conn_params, function() {
		conn.exec(cmdString, function (error, result) {
			if (error) {
				throw error;
			} else {
				callback(result);
			}
		});
	});
};