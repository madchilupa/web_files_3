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

	if ($scope.thisEventID > 0) {
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

angular.module('WebFiles3App')
  .directive('deckDisplay', function() {
	return {
		restrict: 'E',
		templateUrl: 'views/directives/deckDisplay.html',
		controller: 'DeckDisplay'
	}
});