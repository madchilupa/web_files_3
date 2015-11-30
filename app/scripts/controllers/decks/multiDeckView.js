'use strict';

/**
 * @ngdoc function
 * @name WebFiles3App.controller:MultiDeckView
 * @description
 * # MultiDeckView
 * Controller of the WebFiles3App
 */
angular.module('WebFiles3App')
  .controller('MultiDeckView', function ($scope, $routeParams, $http) {
	$scope.thisDeckTypeID = $routeParams.deckTypeID;
	$scope.displayData = {};
	$scope.displayData.deckIDs = [];
	
	$scope.displayData.deckProperties = {
		linkToSingleDeck: true
	};
	
	$http.get('/getDecksWithDeckType', {
		params: {
			deckTypeID: $scope.thisDeckTypeID
		}})
	.success(function(data, status, headers, config) {
		$scope.displayData.deckIDs = data.serverData;
	})
	.error(function(data, status, headers, config) {
	});
 });