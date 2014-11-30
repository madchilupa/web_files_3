'use strict';

var app = angular.module('WebFiles3App');

app.config(['$routeProvider',
    function($routeProvider) {

        $routeProvider.
        when('/', {
            templateUrl: '/views/main.html',
            controller: 'MainCtrl'
        }).
        when('/collection', {
            templateUrl: '/views/datadrivenGridView.html',
            controller: 'CollectionCtrl'
        }).
		when('/data', {
            templateUrl: '/views/datadrivenGridView.html',
            controller: 'DatadrivenCtrl'
        }).
		when('/cube', {
			templateUrl: '/views/rotationCubeView.html',
			controller: 'RotationCubeCtrl'
		}).
		when('/cubeBasic', {
			templateUrl: '/views/basicCubeView.html',
			controller: 'BasicCubeCtrl'
		}).
        /*when('/:id/edit', {
            templateUrl: '/views/editofficesupply.html',
            controller: 'EditOfficeSupply'
        }).*/
        otherwise({
            redirectTo: '/'
        });
    }
]);
