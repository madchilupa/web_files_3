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
			$scope.displayData.meta.colors.push({name: 'White', ID: 1});
			$scope.displayData.meta.colors.push({name: 'Blue', ID: 2});
			$scope.displayData.meta.colors.push({name: 'Black', ID: 3});
			$scope.displayData.meta.colors.push({name: 'Red', ID: 4});
			$scope.displayData.meta.colors.push({name: 'Green', ID: 5});
			$scope.displayData.meta.colors.push({name: 'Colorless', ID: 6});
			$scope.displayData.meta.colors.push({name: 'Multicolor', ID: 7});
			$scope.displayData.meta.colors.push({name: 'Land', ID: 8});
		})
		.error(function(data, status, headers, config) {
			$scope.error = 'Error: ' + data;
		});
	
	$scope.stopDrag = function(a, b, c) {debugger;
	}
	$scope.buttonClicked = function(color) {
		$scope.displayData.meta.colorSelected = color;
	}
  });