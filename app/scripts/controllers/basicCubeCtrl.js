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
	$scope.displayData = {};
	$scope.displayData.meta = {};
	
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
	
	$scope.list1 = [];
	$scope.cards = [
		{name: 'Student of Warfare', color: 'White'},
		{name: 'Champion of the Parish', color: 'White'},
		{name: 'Elite Vanguard', color: 'White'}
	];
	// $scope.displayData = {
		// meta: {
			// colors: {/* DEFINED BELOW */},
			// colorSelected: 'White'
		// },
		// slots: [
			// {
				// cards: [
					// {name: 'Student of Warfare', colorID: 1, cardID: 25519, color: 'White'},
					// {name: null, colorID: null, cardID: null, color: 'White'}
				// ],
				// slotID: 22,
				// generatedSlotName: 'w1c01'
			// },{
				// cards: [
					// {name: 'Champion of the Parish', colorID: 1, cardID: 26941, color: 'White'},
					// {name: 'Savannah Lions', colorID: 1, cardID: 274, color: 'White'}
				// ],
				// slotID: 24,
				// generatedSlotName: 'w1c03'
			// },{
				// cards: [
					// {name: 'Delver of Secrets', colorID: 2, cardID: 27034, color: 'Blue'},
					// {name: null, colorID: null, cardID: null, color: 'Blue'}
				// ],
				// slotID: 70,
				// generatedSlotName: 'u1c01'
			// }
		// ]
	// };
	
  });