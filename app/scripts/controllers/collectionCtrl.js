'use strict';

/**
 * @ngdoc function
 * @name WebFiles3App.controller:CollectionCtrl
 * @description
 * # CollectionCtrl
 * Controller of the WebFiles3App
 */
angular.module('WebFiles3App')
  .controller('CollectionCtrl', function ($scope, $http) {
	$http.get('/collectionData', {
		params: {
			grid: 'Sets' 
		}
	}).success(function(data, status, headers, config) {
		$scope.grid = data;
	}).error(function(data, status, headers, config) {
		$scope.status = status;
	});
		
	$scope.increment = function(currentRow, incrementColumn, modifier) {
		var relatedColumn = currentRow.columns[incrementColumn.relatedColumn];
		var relatedTextbox = $('#' + currentRow.rowID + '-' + relatedColumn.tableName + '-' + relatedColumn.columnName)[0];
		if (angular.isNumber(parseInt(incrementColumn.change)) && !isNaN(parseInt(incrementColumn.change)) && !$(relatedTextbox).hasClass('ng-invalid')) {
			relatedColumn.valueDisplayed = parseInt(relatedColumn.valueDisplayed) + (parseInt(incrementColumn.change) * modifier);
			incrementColumn.change = '';
		} else {
			incrementColumn.change = '';
		}
	};
  });