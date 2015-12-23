'use strict';

angular.module('WebFiles3App')
  .controller('EditCard', function($scope, $http, $modalInstance, data) {
	$scope.modalData = data;
	
	$scope.verifyThenClose = function() {
		$modalInstance.close($scope.modalData);
	};
	
	$scope.verify = function() {
		$http.post('/verifySingleListItem', $scope.modalData.card, {})
			.success(function(data, status, headers, config) {
			})
			.error(function(data, status, headers, config) {
			});
	};
	
	$scope.cancel = function() {
		$modalInstance.dismiss('cancel');
	}
});