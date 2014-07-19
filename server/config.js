'use strict';

var path = require('path'),
    rootPath = path.normalize(__dirname + '/..');

module.exports = {
    root: rootPath,
    port: process.env.PORT || 3000,
    templateEngine: 'swig',
    sessionSecret: 'O#(DMW#sdf0234j03WQ6g3dnjKLSDFJosfkm',
    sessionCollection: 'sessions',
    app: {
        name: 'TEST - Development'
    },
	conn_params: {
	  Server  : 'mtgbak',
	  UserId  : 'DBA',
	  Password: 'EIn98D'
	}
};