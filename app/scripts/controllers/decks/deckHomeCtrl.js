'use strict';

/**
 * @ngdoc function
 * @name WebFiles3App.controller:DeckHomeCtrl
 * @description
 * # DeckHomeCtrl
 * Controller of the WebFiles3App
 */
angular.module('WebFiles3App')
  .controller('DeckHomeCtrl', function ($scope) {
    $scope.displayData = {};
	$scope.displayData.decks = [];
	$scope.displayData.viewTypeOptions = [
		{code: 'Default', order: 1, title: 'Overview'},
		{code: 'Cmc', order: 3, title: 'Converted Mana Cost'},
		{code: 'Type', order: 2, title: 'Card Type'}
	];
	$scope.displayData.viewType = $scope.displayData.viewTypeOptions[0];
	
	var newDeck = {
		name: 'G/W Devotion',
		creditedTo: 'Daniel Ceccheti',
		eventName: 'Grand Prix Miami',
		place: '1st',
		date: '03/07/2015',
		cards: []
	};
	newDeck.cards.push({
		cardName: 'Elvish Mystic',
		quantity: '4',
		cardType: 'Creature',
		cmc: '1',
		color: 'Green'
	});
	newDeck.cards.push({
		cardName: 'Fleecemane Lion',
		quantity: '2',
		cardType: 'Creature',
		cmc: '2',
		color: 'Multicolor'
	});
	newDeck.cards.push({
		cardName: 'Genesis Hydra',
		quantity: '4',
		cardType: 'Creature',
		cmc: 'X',
		color: 'Green'
	});
	newDeck.cards.push({
		cardName: 'Sylvan Caryatid',
		quantity: '4',
		cardType: 'Creature',
		cmc: '2',
		color: 'Green'
	});
	newDeck.cards.push({
		cardName: 'Temur Sabertooth',
		quantity: '1',
		cardType: 'Creature',
		cmc: '4',
		color: 'Green'
	});
	newDeck.cards.push({
		cardName: 'Voyaging Satyr',
		quantity: '4',
		cardType: 'Creature',
		cmc: '2',
		color: 'Green'
	});
	newDeck.cards.push({
		cardName: 'Whisperwood Elemental',
		quantity: '4',
		cardType: 'Creature',
		cmc: '5',
		color: 'Green'
	});
	newDeck.cards.push({
		cardName: 'Courser of Kruphix',
		quantity: '4',
		cardType: 'Creature',
		cmc: '3',
		color: 'Green'
	});
	newDeck.cards.push({
		cardName: 'Polukranos, World Eater',
		quantity: '4',
		cardType: 'Creature',
		cmc: '4',
		color: 'Green'
	});
	newDeck.cards.push({
		cardName: 'Forest',
		quantity: '9',
		cardType: 'Land',
		cmc: '0',
		color: 'Land'
	});
	newDeck.cards.push({
		cardName: 'Plains',
		quantity: '2',
		cardType: 'Land',
		cmc: '0',
		color: 'Land'
	});
	newDeck.cards.push({
		cardName: 'Blossoming Sands',
		quantity: '1',
		cardType: 'Land',
		cmc: '0',
		color: 'Land'
	});
	newDeck.cards.push({
		cardName: 'Temple of Plenty',
		quantity: '4',
		cardType: 'Land',
		cmc: '0',
		color: 'Land'
	});
	newDeck.cards.push({
		cardName: 'Windswept Heath',
		quantity: '4',
		cardType: 'Land',
		cmc: '0',
		color: 'Land'
	});
	newDeck.cards.push({
		cardName: 'Nykthos, Shrine to Nyx',
		quantity: '4',
		cardType: 'Land',
		cmc: '0',
		color: 'Land'
	});
	newDeck.cards.push({
		cardName: 'Banishing Light',
		quantity: '1',
		cardType: 'Enchantment',
		cmc: '3',
		color: 'White'
	});
	newDeck.cards.push({
		cardName: 'Mastery of the Unseen',
		quantity: '4',
		cardType: 'Enchantment',
		cmc: '2',
		color: 'White'
	});
	newDeck.cards.push({
		cardName: 'Fleecemane Lion',
		quantity: '2',
		cardType: 'Sideboard',
		cmc: '2',
		color: 'Multicolor'
	});
	newDeck.cards.push({
		cardName: 'Hornet Nest',
		quantity: '2',
		cardType: 'Sideboard',
		cmc: '3',
		color: 'Green'
	});
	newDeck.cards.push({
		cardName: 'Hornet Queen',
		quantity: '1',
		cardType: 'Sideboard',
		cmc: '7',
		color: 'Green'
	});
	newDeck.cards.push({
		cardName: 'Reclamation Sage',
		quantity: '2',
		cardType: 'Sideboard',
		cmc: '3',
		color: 'Green'
	});
	newDeck.cards.push({
		cardName: 'Last Breath',
		quantity: '1',
		cardType: 'Sideboard',
		cmc: '2',
		color: 'White'
	});
	newDeck.cards.push({
		cardName: 'Setessan Tactics',
		quantity: '1',
		cardType: 'Sideboard',
		cmc: '2',
		color: 'Green'
	});
	newDeck.cards.push({
		cardName: 'Valorous Stance',
		quantity: '1',
		cardType: 'Sideboard',
		cmc: '2',
		color: 'White'
	});
	newDeck.cards.push({
		cardName: 'Nissa, Worldwaker',
		quantity: '2',
		cardType: 'Sideboard',
		cmc: '5',
		color: 'Green'
	});
	newDeck.cards.push({
		cardName: 'Glare of Heresy',
		quantity: '1',
		cardType: 'Sideboard',
		cmc: '2',
		color: 'White'
	});
	newDeck.cards.push({
		cardName: 'Hunt the Hunter',
		quantity: '2',
		cardType: 'Sideboard',
		cmc: '1',
		color: 'Green'
	});
	
	$scope.displayData.decks.push(newDeck);
});