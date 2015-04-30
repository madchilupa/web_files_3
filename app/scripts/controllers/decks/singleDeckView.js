'use strict';

/**
 * @ngdoc function
 * @name WebFiles3App.controller:SingleDeckView
 * @description
 * # SingleDeckView
 * Controller of the WebFiles3App
 */
angular.module('WebFiles3App')
  .controller('SingleDeckView', function ($scope, $routeParams, $http) {
	$scope.thisEventID = $routeParams.eventID;
	$scope.thisDeckID = $routeParams.deckID;
	$scope.displayData = {};
	
	if ($scope.thisDeckID > 0) {
		$http.get('/singleDeckInfo', {
			params: {
				deckID: $scope.thisDeckID
			}})
		.success(function(data, status, headers, config) {
			$scope.displayData = data.serverData;
			
			$scope.displayData.viewTypeOptions = [
				{code: 'Type', order: 2, title: 'Card Type'},
				{code: 'Default', order: 1, title: 'Overview'},
				{code: 'Cmc', order: 3, title: 'Converted Mana Cost'}
			];
			$scope.displayData.viewType = $scope.displayData.viewTypeOptions[0];
		})
		.error(function(data, status, headers, config) {
		});
	} else if ($scope.thisEventID > 0) {
		$http.get('/allDecksInEvent', {
			params: {
				eventID: $scope.thisEventID
			}})
		.success(function(data, status, headers, config) {
		})
		.error(function(data, status, headers, config) {
		});
	}
});