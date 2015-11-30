'use strict';

/**
 * @ngdoc function
 * @name WebFiles3App.controller:ListHomeCtrl
 * @description
 * # ListHomeCtrl
 * Controller of the WebFiles3App
 */
angular.module('WebFiles3App')
  .controller('ListHomeCtrl', function ($scope, $http) {
    $scope.displayData = {};
	$scope.displayData.cardsFound = [];
	$scope.displayData.cardsNotFound = [];
	
	$scope.evalList = function() {debugger;
		$scope.displayData.inputText = $scope.displayData.inputText.replace(/\t\n/g, ' ');
		$http.post('/evalList', $scope.displayData.inputText.split('\n'), {})
			.success(function(data, status, headers, config) {debugger;
				if (data.serverData.cardsNotFound) {
					$scope.displayData.cardsNotFound = data.serverData.cardsNotFound.join('\n');
				}
				$scope.displayData.cardsFound = data.serverData.cardsFound;
			})
			.error(function(data, status, headers, config) {
			});
	}
	
	$scope.reevalList = function() {
		$http.post('/evalList', $scope.displayData.cardsNotFound.split('\n'), {})
			.success(function(data, status, headers, config) {
				if (data.serverData.cardsNotFound) {
					$scope.displayData.cardsNotFound = data.serverData.cardsNotFound.join('\n');
				}
				$scope.displayData.cardsFound = $scope.displayData.cardsFound.concat(data.serverData.cardsFound);
			})
			.error(function(data, status, headers, config) {
			});
	}
});