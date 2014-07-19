'use strict';

/**
 * @ngdoc function
 * @name WebFiles3App.controller:NavigationCtrl
 * @description
 * # NavigationCtrl
 * Controller of the WebFiles3App
 */
angular.module('WebFiles3App')
  .controller('DatadrivenCtrl', function ($scope, $http) {
	$http.get('/collectionData', {
		params: {
			grid: 'Sets' 
		}
	}).success(function(data, statues, headers, config) {
		$scope.serverTest = data;
	}).error(function(data, status, headers, config) {
		$scope.status = status;
	});
		
	$scope.increment = function(clickEvent, currentRow, incrementColumn, modifier) {
		var relatedColumn = currentRow.columns[incrementColumn.relatedColumn];
		var relatedTextbox = $('#' + currentRow.rowID + '-' + relatedColumn.tableName + '-' + relatedColumn.columnName)[0];
		if (angular.isNumber(parseInt(incrementColumn.change)) && !isNaN(parseInt(incrementColumn.change)) && !$(relatedTextbox).hasClass('ng-invalid')) {
			relatedColumn.valueDisplayed = parseInt(relatedColumn.valueDisplayed) + (parseInt(incrementColumn.change) * modifier);
			incrementColumn.change = '';
		} else {
			incrementColumn.change = '';
		}
	}
	
	$scope.grid = {
		gridName: 'collection',
		searchTerm: 'spellstu',
		rows: [{
			columns: [{
				tableName: 'Sets',
				columnName: 'Name',
				columnType: 'varchar',
				readOnly: false,
				valueDisplayed: 'Alpha'
			},{
				tableName: 'Sets',
				columnName: 'ReleaseDate',
				columnType: 'date',
				readOnly: true,
				valueDisplayed: '1993-08-05'
			},{
				tableName: 'Sets',
				columnName: 'someInteger',
				columnType: 'integer',
				readOnly: false,
				valueDisplayed: '10'
			},{
				tableName: 'Sets',
				columnName: 'incrementSomeInteger',
				columnType: 'increment',
				change: '',
				relatedColumn: 2
			},{
				tableName: 'Sets',
				columnName: 'decrementSomInteger',
				columnType: 'decrement',
				change: '',
				relatedColumn: 2
			},{
				tableName: 'Sets',
				columnName: 'ActiveFlag',
				columnType: 'bit',
				readOnly: true,
				valueDisplayed: true
			}],
			rowID: 1
		},{
			columns: [{
				tableName: 'Sets',
				columnName: 'Name',
				columnType: 'varchar',
				readOnly: true,
				valueDisplayed: 'Beta'
			},{
				tableName: 'Sets',
				columnName: 'ReleaseDate',
				columnType: 'date',
				readOnly: false,
				valueDisplayed: '1993-10-01'
			},{
				tableName: 'Sets',
				columnName: 'someInteger',
				columnType: 'integer',
				readOnly: true,
				valueDisplayed: '5'
			},{
				tableName: 'Sets',
				columnName: 'incrementSomeInteger',
				columnType: 'increment',
				change: '',
				relatedColumn: 2
			},{
				tableName: 'Sets',
				columnName: 'decrementSomeInteger',
				columnType: 'decrement',
				change: '',
				relatedColumn: 2
			},{
				tableName: 'Sets',
				columnName: 'ActiveFlag',
				columnType: 'bit',
				readOnly: false,
				valueDisplayed: false
			}],
			rowID: 2
		}]
	};
  });