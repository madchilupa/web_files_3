'use strict';

/**
 * @ngdoc function
 * @name WebFiles3App.controller:RotationDeleteSlotCtrl
 * @description
 * # RotationDeleteSlotCtrl
 * Controller of the WebFiles3App
 */
angular.module('WebFiles3App')
  .controller('RotationDeleteSlotCtrl', function ($scope, $modalInstance, $http, data) {
	$http.get('/slotDeleteList', {})
		.success(function(data, status, headers, config) {
			$scope.slotList = [];
			$scope.slotList = data;
		})
		.error(function(data, status, headers, config) {
		});
	$scope.data = data;
	
	$scope.ok = function() {
		$modalInstance.close($scope.data);
	};
	
	$scope.cancel = function() {
		$modalInstance.dismiss('cancel');
	};
  });