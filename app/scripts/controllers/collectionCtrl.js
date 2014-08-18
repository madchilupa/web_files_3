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
	
	$scope.textBoxChange = function($event, currentRow, currentColumn) {
		if ($($event.target).hasClass('ng-dirty')) {
			$scope.grid.possibleChanges = true;
			currentRow.changes = true;
		}
	};
	
	$scope.prepareToSaveGridChanges = function() {
		var json;
		
		if ($scope.grid.possibleChanges == true) {
			//don't want to just count on ng-dirty to know if we should save a row or not. you can change a cell, then go back later and change it back to it's
			//	original value and ng-dirty is still on the element
			$.each($scope.grid.rows, testToSaveRow);
			json = prepareChangesForServer();
			saveGrid(json);
		}
		
		function testToSaveRow(idx, row) {
			if (row.changes) {
				var rowRequiresSaving = false;
				$.each(row.columns, function(idx, col) {
					if (col.origValue != col.valueDisplayed) {
						col.changed = true;
						rowRequiresSaving = true;
						return false;
					}
				});
				row.changes = rowRequiresSaving;
			}
		};
		
		function prepareChangesForServer() {
			var json = [];
			$.each($scope.grid.rows, function(idx, row) {
				if (row.changes) {
					json.push(row);
				}
			});
			return json;
		};
		
		function saveGrid(json) {
			if (json) {
				$http.post('/collectionData', json, {
				}).success(function(data, status, headers, config) {
				}).error(function(data, status, headers, config) {
				});
			}
		};
	};
	
	$scope.testRowBlur = function() {
		console.log('hi');
	};
  });