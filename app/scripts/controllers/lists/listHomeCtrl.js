'use strict';

/**
 * @ngdoc function
 * @name WebFiles3App.controller:ListHomeCtrl
 * @description
 * # ListHomeCtrl
 * Controller of the WebFiles3App
 */
angular.module('WebFiles3App')
  .controller('ListHomeCtrl', function ($scope, $http, $modal, $timeout) {
	$scope.config = {};
    $scope.displayData = {};
	$scope.displayData.cardsFound = [];
	$scope.displayData.cardsNotFound = [];
	$scope.alerts = [];
	
	$scope.closeAlert = function(index) {
		$scope.alerts.splice(index, 1);
	};
	
	$http.get('/config-list', {})
		.success(function(data, status, headers, config) {
			$scope.config.setInfo = data.serverData.setInfo;
		})
		.error(function(data, status, headers, config) {
			$scope.alerts.push({type: 'danger', msg: 'Error: ' + data.error});
		});
	
	$scope.evalList = function() {
		$scope.displayData.inputText = $scope.displayData.inputText.replace(/\t\n/g, ' ');
		$http.post('/evalList', $scope.displayData.inputText.split('\n'), {})
			.success(function(data, status, headers, config) {
				if (data.serverData.cardsNotFound) {
					$scope.displayData.cardsNotFound = data.serverData.cardsNotFound.join('\n');
				}
				$scope.displayData.cardsFound = data.serverData.cardsFound;
			})
			.error(function(data, status, headers, config) {
			});
	}
	
	$scope.reevalList = function() {
		$http.post('/evalList', $scope.displayData.cardsNotFound.split('\n'), {})
			.success(function(data, status, headers, config) {
				if (data.serverData.cardsNotFound) {
					$scope.displayData.cardsNotFound = data.serverData.cardsNotFound.join('\n');
				}
				$scope.displayData.cardsFound = $scope.displayData.cardsFound.concat(data.serverData.cardsFound);
			})
			.error(function(data, status, headers, config) {
			});
	}
	
	$scope.editRow = function(index) {
		var dataToSend = {
			card: $scope.displayData.cardsFound[index],
			config: $scope.config
		};
		
		var newModal = $modal.open({
			templateUrl: 'views/lists/editCard.html',
			controller: 'EditCard',
			size: 'lg',
			resolve: {
				data: function() {
					return dataToSend;
				}
			}
		});
		
		newModal.opened.then(function() {
			$timeout(function() {
				$('.modalSetID').selectpicker();
				newModal.selectCorrectSet();
			}, 0);
		});
		
		newModal.selectCorrectSet = function() {
			$('.modalSetID').selectpicker('val', dataToSend.card.expansion);
		};
		
		newModal.result.then(function(modalData) {
			$scope.displayData.cardsFound[index] = modalData.card;
		}, function() {
			//Modal dismissed
		});
	}
});