'use strict';

/**
 * @ngdoc function
 * @name WebFiles3App.controller:RotationAddSlotCtrl
 * @description
 * # RotationAddSlotCtrl
 * Controller of the WebFiles3App
 */
angular.module('WebFiles3App')
  .controller('RotationAddSlotCtrl', function ($scope, $modalInstance, data) {
	$scope.data = {};
	
	$scope.data.colors = data.colors;
	$scope.data.possibleTypes = data.possibleTypes;
	$scope.data.slots = data.slots;
	defaultData();
	
	function defaultData() {
		if ($scope.data.slots && $scope.data.slots[0]) {
			if (!$scope.data.slots[0].color || $scope.data.slots[0].color == '') {
				$scope.data.slots[0].color = data.colors[0].name;
			}
			if (!$scope.data.slots[0].type || $scope.data.slots[0].type == '') {
				$scope.data.slots[0].type = data.possibleTypes[0];
			}
		}
	}
	
	$scope.ok = function() {
		$modalInstance.close($scope.data);
	};
	
	$scope.cancel = function() {
		$modalInstance.dismiss('cancel');
	};
  });