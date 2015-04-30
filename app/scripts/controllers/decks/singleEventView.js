'use strict';

/**
 * @ngdoc function
 * @name WebFiles3App.controller:SingleEventView
 * @description
 * # SingleEventView
 * Controller of the WebFiles3App
 */
angular.module('WebFiles3App')
  .controller('SingleEventView', function ($scope, $routeParams, $http) {
	$scope.thisEventID = $routeParams.eventID;
	$scope.displayData = {};

	$http.get('/singleEventInfo', {
		params: {
			eventID: $scope.thisEventID
		}})
		.success(function(data, status, headers, config) {
			$scope.displayData = data.serverData;
			
			$scope.displayData.archetypes = [
				{archetypeID: 1, name: 'G/W Devotion', count: '2'},
				{archetypeID: 2, name: 'Mono Red Aggro', count: '2'},
				{archetypeID: 3, name: 'Abzan Aggro', count: '2'},
				{archetypeID: 4, name: 'Abzan Whip', count: '1'},
				{archetypeID: 5, name: 'Naya Aggro', count: '1'}
			];
		})
		.error(function(data, status, headers, config) {
		});
});