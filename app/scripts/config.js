'use strict';

var app = angular.module('WebFiles3App');

app.config(['$routeProvider',
    function($routeProvider) {

        $routeProvider.
        when('/', {
            templateUrl: '/views/main.html',
            controller: 'MainCtrl'
        }).
        when('/collection', {
            templateUrl: '/views/datadrivenGridView.html',
            controller: 'CollectionCtrl'
        }).
		when('/cube', {
			templateUrl: '/views/rotationCubeView.html',
			controller: 'RotationCubeCtrl'
		}).
		when('/cubeBasic', {
			templateUrl: '/views/basicCubeView.html',
			controller: 'BasicCubeCtrl'
		}).
		when('/data', {
            templateUrl: '/views/dataMgmt/dataManagementView.html',
            controller: 'DataManagementCtrl'
        }).
		when('/decks', {
			templateUrl: '/views/decks/decksHome.html',
			controller: 'DeckHomeCtrl'
		}).
		when('/lists', {
			templateUrl: '/views/lists/listsHome.html',
			controller: 'ListHomeCtrl'
		}).
		when('/multiDeck/:deckTypeID', {
			templateUrl: '/views/decks/multiDeckView.html',
			controller: 'MultiDeckView'
		}).
		when('/singleDeck/:deckID', {
			templateUrl: '/views/decks/singleDeckView.html',
			controller: 'SingleDeckView'
		}).
		when('/singleDeck/:eventID', {
			templateUrl: '/views/decks/singleDeckView.html',
			controller: 'SingleDeckView'
		}).
		when('/singleDeckType/:deckTypeID', {
			templateUrl: '/views/decks/singleDeckTypeView.html',
			controller: 'SingleDeckTypeView'
		}).
		when('/singleEvent/:eventID', {
			templateUrl: '/views/decks/singleEventView.html',
			controller: 'SingleEventView'
		}).
		when('/singlePlayer/:playerID', {
			templateUrl: '/views/decks/singlePlayerView.html',
			controller: 'SinglePlayerView'
		}).
        /*when('/:id/edit', {
            templateUrl: '/views/editofficesupply.html',
            controller: 'EditOfficeSupply'
        }).*/
        otherwise({
            redirectTo: '/'
        });
    }
]);

angular.module('WebFiles3App')
	.directive('deckDisplay', function() {
		return {
			restrict: 'E',
			templateUrl: 'views/directives/deckDisplay.html',
			controller: 'DeckDisplay',
			scope: {
				deckid: '=',
				deckproperties: '='
			}
		}
	})
	.directive('gridDisplay', function() {
		return {
			restrict: 'E',
			templateUrl: '/views/directives/gridDisplay.html',
			controller: 'GridDisplay',
			scope: {
				gridname: '=',
				gridproperties: '='
			}
		}
	});

app.filter('orderObjectByNum', function() {
  return function(input, attribute) {
	if (!angular.isObject(input)) {
		return input;
	}
	
	var array = [];
	for (var objectKey in input) {
		if (input.hasOwnProperty(objectKey)) {
			array.push(input[objectKey]);
		}
	}
		
	array.sort(function(a, b) {
		a = parseInt(a[attribute]);
		b = parseInt(b[attribute]);
		return a - b;
	});
	return array;
  }
});

app.filter('orderObjectByString', function() {
  return function(input, attribute) {
	if (!angular.isObject(input)) {
		return input;
	}
	
	var array = [];
	for (var objectKey in input) {
		if (input.hasOwnProperty(objectKey)) {
			array.push(input[objectKey]);
		}
	}
	
	array.sort(function(a, b) {
		var alc = a[attribute].toLowerCase(),
			blc = b[attribute].toLowerCase();
		return alc > blc ? 1 : alc < blc ? -1 : 0;
	});
	return array;
  }
});