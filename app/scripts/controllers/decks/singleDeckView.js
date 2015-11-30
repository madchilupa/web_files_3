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
	// $scope.thisEventID = $routeParams.eventID;
	$scope.thisDeckID = $routeParams.deckID;
	$scope.displayData = {};
	
	$scope.displayData.deckProperties = {
		linkToSingleDeck: false
	};
	
	$scope.displayData.deckTypeEvalGridProps = {
		deckID: $scope.thisDeckID
	};
	
	$http.get('/getDecksDeckType', {
		params: {
			deckID: $scope.thisDeckID
		}})
	.success(function(data, status, headers, config) {
		for (var i = 0; i < data.serverData.length; i++) {
			$scope.displayData.deckTypeIDs.push({
				deckTypeID: data.serverData[i].DeckTypeID,
				name: data.serverData[i].Name
			});
		}
	})
	.error(function(data, status, headers, config) {
	});
});