'use strict';

/**
 * @ngdoc function
 * @name WebFiles3App.controller:NavigationCtrl
 * @description
 * # NavigationCtrl
 * Controller of the WebFiles3App
 */
angular.module('WebFiles3App')
  .controller('NavigationCtrl', function ($scope) {
    $scope.apps = [
		{display: 'Home', route: 'index'},
		{display: 'Collection', route: 'collection'},
		{display: 'Data Management', route: 'data'},
		{display: 'Cube Management', route: 'cube'},
		{display: 'Rotation Cube Display', route: 'cubeBasic'},
		{dipslay: 'Reports', route: 'report'},
		{display: 'Deck View', route: 'decks'}
    ];
  });
