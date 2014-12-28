'use strict';

/**
 * @ngdoc function
 * @name WebFiles3App.controller:RotationAddSlotCtrl
 * @description
 * # RotationAddSlotCtrl
 * Controller of the WebFiles3App
 */
angular.module('WebFiles3App')
  .controller('RotationAddSlotCtrl', function ($scope, $modalInstance) {
	$scope.ok = function() {
		$modalInstance.close();
	};
	
	$scope.cancel = function() {
		$modalInstance.dismiss('cancel');
	};
  });