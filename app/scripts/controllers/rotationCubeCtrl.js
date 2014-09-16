'use strict';

/**
 * @ngdoc function
 * @name WebFiles3App.controller:RotationCubeCtrl
 * @description
 * # RotationCubeCtrl
 * Controller of the WebFiles3App
 */
angular.module('WebFiles3App')
  .controller('RotationCubeCtrl', function ($scope, $http) {
	$http.get('/cubeList', {})
		.success(function(data, status, headers, config) {debugger;
			$scope.cubeList = data;
		})
		.error(function(data, status, headers, config) {
			$scope.error = data;
		});
  });