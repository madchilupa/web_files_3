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
			$scope.dataDrivenGrid.possibleChanges = true;
			currentRow.changes = true;
		}
	};
	
	$scope.checkBoxChange = function($event, currentRow, currentColumn) {
		$scope.dataDrivenGrid.possibleChanges = true;
		currentRow.change = true;
	};
	
	$scope.addRowToGrid = function() {
		var newRow = angular.copy($scope.dataDrivenGrid.rows[0]);
		$scope.dataDrivenGrid.rows.push(newRow);
	};
	
	$scope.prepareToSaveGridChanges = function() {debugger;
		var json;
		
		if ($scope.dataDrivenGrid.possibleChanges == true) {
			//don't want to just count on ng-dirty to know if we should save a row or not. you can change a cell, then go back later and change it back to it's
			//	original value and ng-dirty is still on the element
			$.each($scope.dataDrivenGrid.rows, testToSaveRow);
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
			$.each($scope.dataDrivenGrid.rows, function(idx, row) {
				if (row.changes) {
					json.push(row);
				}
			});
			return json;
		};
		
		function saveGrid(json) {
			if (json) {
				$http.post('/gridSaveRow', {
					gridName: gridNameToFind,
					gridProperties: gridProperties,
					rowData: json
				})
				.success(function(data, status, headers, config) {
				})
				.error(function(data, status, headers, config) {
				});
			}
		};
	};
});