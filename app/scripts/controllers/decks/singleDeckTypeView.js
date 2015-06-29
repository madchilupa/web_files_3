'use strict';

/**
 * @ngdoc function
 * @name WebFiles3App.controller:SingleDeckTypeView
 * @description
 * # SingleDeckTypeView
 * Controller of the WebFiles3App
 */
angular.module('WebFiles3App')
  .controller('SingleDeckTypeView', function ($scope, $routeParams, $http) {
	$scope.thisDeckTypeID = $routeParams.deckTypeID;
	$scope.displayData = {};
	$scope.displayData.deckTypeGrid = {
		deckTypeID: $routeParams.deckTypeID
	};
	
	$http.get('/singleDeckTypeInfo', {
		params: {
			deckTypeID: $scope.thisDeckTypeID
		}})
		.success(function(data, status, headers, config) {
			$scope.displayData = data.serverData;
		})
		.error(function(data, status, headers, config) {
		});
});