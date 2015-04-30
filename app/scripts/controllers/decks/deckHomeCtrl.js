'use strict';

/**
 * @ngdoc function
 * @name WebFiles3App.controller:DeckHomeCtrl
 * @description
 * # DeckHomeCtrl
 * Controller of the WebFiles3App
 */
angular.module('WebFiles3App')
  .controller('DeckHomeCtrl', function ($scope, $http) {
    $scope.displayData = {};
	$scope.formatID = 7;
	
	$http.get('/eventList', {
		params: {
			formatID: $scope.formatID
		}})
		.success(function(data, status, headers, config) {
			$scope.displayData.events = data.eventList;
		})
		.error(function(data, status, headers, config) {
		});
	$http.get('/currArchetypesInFormats', {
		params: {
			formatID: $scope.formatID
		}})
		.success(function(data, status, heders, config) {
			$scope.displayData.archetypes = data.archetypeList;
		})
		.error(function(data, status, headers, config) {
		});
});