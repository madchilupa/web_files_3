'use strict';

/**
 * @ngdoc function
 * @name WebFiles3App.controller:GridDisplay
 * @description
 * # GridDisplay
 * Controller of the WebFiles3App
 */
angular.module('WebFiles3App')
  .controller('GridDisplay', function ($scope, $routeParams, $http) {
	var gridNameToFind = $scope.gridname;
	var gridProperties = $scope.gridproperties;
	
	if (gridNameToFind != '' && gridNameToFind != null) {
		$http.get('gridDisplay', {
			params: {
				gridName: gridNameToFind,
				gridProperties: gridProperties
			}})
		.success(function(data, status, headers, config) {
			$scope.dataDrivenGrid = data;
		})
		.error(function(data, status, headers, config) {
		});
	}
});