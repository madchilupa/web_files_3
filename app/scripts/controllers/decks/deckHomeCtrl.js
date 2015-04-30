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
	
	$http.get('/eventList', {})
		.success(function(data, status, headers, config) {
			$scope.displayData.events = data.eventList;
		})
		.error(function(data, status, headers, config) {
		});
	$http.get('/currArchetypesInFormats', {})
		.success(function(data, status, heders, config) {
			$scope.displayData.formats = data.formatList;
		})
		.error(function(data, status, headers, config) {
		});
});