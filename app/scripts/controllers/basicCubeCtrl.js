'use strict';

/**
 * @ngdoc function
 * @name WebFiles3App.controller:BasicCubeCtrl
 * @description
 * # BasicCubeCtrl
 * Controller of the WebFiles3App
 */
angular.module('WebFiles3App')
  .controller('BasicCubeCtrl', function ($scope, $http) {
	$http.get('/cubeList', {})
		.success(function(data, status, headers, config) {
			$scope.cubeList = {};
			$scope.cubeList.cube = data;
		})
		.error(function(data, status, headers, config) {
			$scope.error = 'Error: ' + data;
		});
	
	$scope.list1 = [];
	$scope.cards = [
		{name: 'Student of Warfare', color: 'White'},
		{name: 'Champion of the Parish', color: 'White'},
		{name: 'Elite Vanguard', color: 'White'}
	];
	$scope.displayData = {
		cards: [
			{name: 'Student of Warfare', colorID: 'White', cardID:5 },
			{name: 'Champion of the Parish', colorID: 'White'},
			{name: 'Savannah Lions', colorID: 'White'}
		]
	};
  });