'use strict';

/**
 * @ngdoc function
 * @name WebFiles3App.controller:RotationCubeCtrl
 * @description
 * # RotationCubeCtrl
 * Controller of the WebFiles3App
 */
angular.module('WebFiles3App')
  .controller('RotationCubeCtrl', function ($scope, $http) {
	$http.get('/cubeList', {})
		.success(function(data, status, headers, config) {
			$scope.cubeList = {};
			$scope.cubeList.cube = data;
		})
		.error(function(data, status, headers, config) {
			$scope.error = 'Error: ' + data;
		});
	$http.get('/cubeView', {})
		.success(function(data, status, headers, config) {
			$scope.displayData = data;
			
			$scope.displayData.meta.colors = [];
			$scope.displayData.meta.colors[1] = {name: 'White', ID: 1};
			$scope.displayData.meta.colors[2] = {name: 'Blue', ID: 2};
			$scope.displayData.meta.colors[3] = {name: 'Black', ID: 3};
			$scope.displayData.meta.colors[4] = {name: 'Red', ID: 4};
			$scope.displayData.meta.colors[5] = {name: 'Green', ID: 5};
			$scope.displayData.meta.colors[6] = {name: 'Colorless', ID: 6};
			$scope.displayData.meta.colors[7] = {name: 'Multicolor', ID: 7};
			$scope.displayData.meta.colors[8] = {name: 'Land', ID: 8};
		})
		.error(function(data, status, headers, config) {
			$scope.error = 'Error: ' + data;
		});
	
	$scope.stopDrag = function(a, b, c) {debugger;
	}
  });