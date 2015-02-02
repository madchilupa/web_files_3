'use strict'

var config = require('../config'),
	sqlAnywhere = require('sqlanywhere');

module.exports.safeDBString = function(unsafeString) {
	var safeString = '';
	
	if (!isNaN(parseInt(unsafeString))) {
		safeString = unsafeString;
	}
	if (unsafeString != null && unsafeString != '' && typeof unsafeString.replace === 'function') {
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
				callback({dbError: true, errorMessage: error});
			} else {
				callback(result);
			}
			conn.disconnect();
		});
	});
};

module.exports.executeCommand = function(cmdString, callback) {
	var conn = sqlAnywhere.createConnection();
	
	conn.connect(config.conn_params, function() {
		conn.exec(cmdString, function (error, result) {
			if (error) {
				throw error;
				conn.rollback(function(err) {
					if (err) {
						throw err;
					}
					conn.disconnect();
				});
				callback({dbError: true, errorMessage: error});
			} else {
				conn.commit(function(err) {
					if (err) {
						throw err;
					} else {
						callback(result);
					}
					conn.disconnect();
				});
			}
		});
	});
};

module.exports.getIdentityValue = function(callback) {
	var sqlCommand = 'SELECT @@identity as IdentityColumn';
	this.dbResults(sqlCommand, callback);
};