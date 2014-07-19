'use strict';

(function() {
	describe('Test controller: datadrivenCtrl.js', function() {
		var CollectionCtrlMock, scope;
		beforeEach(function() {
			module('WebFiles3App');
		});
		
		describe('Test data driven grid', function() {
			
		});
		
		describe('Test grid actions', function() {
			beforeEach(inject(function($controller, $rootScope) {
				scope = $rootScope.$new();
				
				CollectionCtrlMock = $controller('CollectionCtrl', {
					$scope: scope
				});
			}));
			
			describe('Test increment function', function() {
				var currentRow, incrementColumn;
				
				beforeEach(function() {
					currentRow = {
						columns: [{
							tableName: 'Sets',
							columnName: 'ColumnName',
							columnType: 'varchar',
							readOnly: true,
							valueDisplayed: 'Name'
						},{
							tableName: 'Sets',
							columnName: 'ColType',
							columnType: 'varchar',
							readOnly: true,
							valueDisplayed: 'varchar'
						},{
							tableName: 'Sets',
							columnName: 'ReadOnly',
							columnType: 'varchar',
							readOnly: true,
							valueDisplayed: 0
						},{
							tableName: 'Sets',
							columnName: 'Name Displayed',
							columnType: 'varchar',
							readOnly: true,
							valueDisplayed: 'Set Name'
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
							relatedColumn: 4
						}],
						rowID: 1
					};
					incrementColumn = {
						tableName: 'Sets',
						columnName: 'ColumnName',
						columnType: 'varchar',
						readOnly: true,
						valueDisplayed: 'Name',
						relatedColumn: 4
					};
				});
				
				it ('Test increment function', function() {
					scope.increment(currentRow, incrementColumn, 1);
					expect(currentRow.columns[4].valueDisplayed).toEqual(10);
				});
			});
		});
	});
})();