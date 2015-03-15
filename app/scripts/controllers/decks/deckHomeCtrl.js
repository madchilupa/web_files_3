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
});