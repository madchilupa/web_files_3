'use strict';

/**
 * @ngdoc function
 * @name WebFiles3App.controller:RotationCubeCtrl
 * @description
 * # RotationCubeCtrl
 * Controller of the WebFiles3App
 */
angular.module('WebFiles3App')
  .controller('RotationCubeCtrl', function ($scope, $http, $modal) {
	/** List of elligible cube **/
	$http.get('/cubeList', {})
		.success(function(data, status, headers, config) {
			$scope.cubeList = {};
			$scope.cubeList.cube = data;
		})
		.error(function(data, status, headers, config) {
			$scope.error = 'Error: ' + data;
		});
	
	/** List of cards in selected cube **/
	$http.get('/cubeView', {})
		.success(function(data, status, headers, config) {
			$scope.displayData = data;
			
			$scope.displayData.meta.colors = [];
			$scope.displayData.meta.colors.push({name: 'White', ID: 1});
			$scope.displayData.meta.colors.push({name: 'Blue', ID: 2});
			$scope.displayData.meta.colors.push({name: 'Black', ID: 3});
			$scope.displayData.meta.colors.push({name: 'Red', ID: 4});
			$scope.displayData.meta.colors.push({name: 'Green', ID: 5});
			$scope.displayData.meta.colors.push({name: 'Colorless', ID: 6});
			$scope.displayData.meta.colors.push({name: 'Multicolor', ID: 7});
			$scope.displayData.meta.colors.push({name: 'Land', ID: 8});
		})
		.error(function(data, status, headers, config) {
			$scope.error = 'Error: ' + data;
		});
	
	/** Modal for adding a slot **/
	$scope.openSlotModal = function () {
		var modalSlotAdd = $modal.open({
			templateUrl: 'views/rotationAddSlotView.html',
			controller: 'RotationAddSlotCtrl',
			size: 'lg',
			resolve: {
			}
		});
		
		modalSlotAdd.result.then(function (/*selectedItem*/) {
			//$scope.something = selectedItem;
		}, function() {
			//Modal dismissed
		});
	};
	
	$scope.stopDrag = function(a, b, c) {
	};
	
	$scope.stopSlotDrag = function(event, draggedItem, droppedIndex) {
		var draggedIndex = $(draggedItem.helper[0]).attr('slotIndex');
		var temp = $scope.displayData.slots[droppedIndex];
		$scope.displayData.slots[droppedIndex] = $scope.displayData.slots[draggedIndex];
		$scope.displayData.slots[draggedIndex] = temp;
	};
	
	$scope.colorButtonClicked = function(color) {
		this.deselectOtherButtons(color);
		$scope.displayData.meta.colorSelected = color;
	};
	
	$scope.deselectOtherButtons = function(color) {
		$('#buttonsColorSwitching label[color!=\'' + color + '\']').removeClass('active');
	};
	
	$scope.saveChanges = function() {
		var dataToSave = [];
		for (var i = 0; i < $scope.displayData.slots.length; i++) {
			if ($scope.displayData.slots[i].cards && $scope.displayData.slots[i].cards[0] && $scope.displayData.slots[i].cards[0].color == $scope.displayData.meta.colorSelected) {
				dataToSave.push($scope.displayData.slots[i]);
			}
		}
		$http.post('/cubeSave', dataToSave, {})
			.success(function(data, status, headers, config) {
			})
			.error(function(data, status, headers, config) {
			});
	};
  });