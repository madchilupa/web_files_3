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
            templateUrl: '/views/datadrivenGridView.html',
            controller: 'DatadrivenCtrl'
        }).
		when('/decks', {
			templateUrl: '/views/decks/decksHome.html',
			controller: 'DeckHomeCtrl'
		}).
		when('/multiDeck/:archetypeID', {
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
