'use strict';

/**
 * @ngdoc function
 * @name WebFiles3App.controller:RotationCubeCtrl
 * @description
 * # RotationCubeCtrl
 * Controller of the WebFiles3App
 */
angular.module('WebFiles3App')
  .controller('RotationCubeCtrl', function ($scope, $http, $modal, $timeout) {
	/** List of elligible cube **/
	$http.get('/cubeList', {})
		.success(function(data, status, headers, config) {
			$scope.cubeList = {};
			$scope.cubeList.cube = data;
			
			//The DOM doesn't seem to be ready at this point, do a sloppy $timeout here
			$timeout(function() {
				$('.colorPicker').selectpicker();
			}, 0);
		})
		.error(function(data, status, headers, config) {
			$scope.error = 'Error: ' + data;
		});
	
	/** List of cards in selected cube **/
	$http.get('/cubeView', {})
		.success(function(data, status, headers, config) {debugger;
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
		var dataToSend = {
			colors: $scope.displayData.meta.colors,
			possibleTypes: [],
			slots: []
		};
		dataToSend.possibleTypes.push('Creature');
		dataToSend.possibleTypes.push('Spell');
		dataToSend.slots.push({
			type: 'Creature',
			cmc: '1'
		});
		
		var modalSlotAdd = $modal.open({
			templateUrl: 'views/rotationAddSlotView.html',
			controller: 'RotationAddSlotCtrl',
			size: 'lg',
			resolve: {
				data: function() {
					return dataToSend;
				}
			}
		});
		
		modalSlotAdd.opened.then(function() {
			$timeout(function() {
				$('.colorPickerModal').selectpicker();
				$('.typePickerModal').selectpicker();
			}, 0);
		});
		
		modalSlotAdd.result.then(function (modalData) {
			//modalData.slots[0].cmc		.name		.type
			if (modalData && modalData.slots && modalData.slots[0]) {
				var slotToSave = {
					cmc: modalData.slots[0].cmc,
					slotName: modalData.slots[0].name,
					slotType: modalData.slots[0].type,
					color: modalData.slots[0].color
				};
				$http.post('/addSlot', slotToSave, {})
					.success(function(data, status, headers, config) {
						if (data.newSlot.generatedSlotName) {
							$scope.alerts.push({type: 'success', msg: 'Slot ' + data.newSlot.generatedSlotName + ' added to the cube'});
							var newSlot = {
								cards: [],//add generated slot name as a card
								colorID: data.newSlot.colorID,
								generatedSlotName: data.newSlot.generatedSlotName,
								slotID: data.newSlot.slotID,
								slotName: data.newSlot.slotName
							};
							newSlot.cards.push({
								name: data.newSlot.generatedSlotName,
								draggable: false
							});
							$scope.displayData.slots.push(newSlot);
						} else {
							$scope.alerts.push({type: 'success', msg: 'Slot added to the cube. There was a problem retrieving data from the server. Please refresh page to view the new slot.'});
						}
					})
					.error(function(data, status, headers, config) {
						if (data.errors) {
							$scope.alerts.push({type: 'danger', msg: 'There was an error creating the cube slot. ' + data.errors.toString()});
						} else {
							$scope.alerts.push({type: 'danger', msg: 'There was an error creating the cube slot.'});
						}
					});
			}
		}, function() {
			//Modal dismissed
		});
	};
	
	$scope.alerts = [];
	$scope.closeAlert = function(index) {
		$scope.alerts.splice(index, 1);
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