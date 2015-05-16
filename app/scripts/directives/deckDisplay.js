'use strict';

/**
 * @ngdoc function
 * @name WebFiles3App.controller:SingleDeckView
 * @description
 * # SingleDeckView
 * Controller of the WebFiles3App
 */
angular.module('WebFiles3App')
  .controller('DeckDisplay', function ($scope, $routeParams, $http) {
	$scope.deckIDToFind = $scope.thisDeckID;
	
	if ($scope.deckIDToFind > 0) {
		$http.get('/singleDeckInfo', {
			params: {
				deckID: $scope.deckIDToFind
			}})
		.success(function(data, status, headers, config) {
			$scope.displayData = data.serverData;
			
			for (var deckIdx = 0; deckIdx < $scope.displayData.decks.length; deckIdx++) {
				var currDeck = $scope.displayData.decks[deckIdx];
				currDeck.numCreatures = 0;
				currDeck.numPlaneswalkers = 0;
				currDeck.numLands = 0;
				currDeck.numSorceries = 0;
				currDeck.numInstants = 0;
				currDeck.numArtifacts = 0;
				currDeck.numEnchantments = 0;
				
				for (var cardIdx = 0; cardIdx < currDeck.cards.length; cardIdx++) {
					var currCard = currDeck.cards[cardIdx];
					
					switch (currCard.cardType.toUpperCase()) {
						case 'CREATURE':
							currDeck.numCreatures++;
							break;
						case 'PLANESWALKER':
							currDeck.numPlaneswalkers++;
							break;
						case 'LAND':
							currDeck.numLands++;
							break;
						case 'SORCERY':
							currDeck.numSorceries++;
							break;
						case 'INSTANT':
							currDeck.numInstants++;
							break;
						case 'ARTIFACT':
							currDeck.numArtifacts++;
							break;
						case 'ENCHANTMENT':
							currDeck.numEnchantments++;
							break;
					}
				}
			}
			
			$scope.displayData.viewTypeOptions = [
				{code: 'Type', order: 2, title: 'Card Type'},
				{code: 'Overview', order: 1, title: 'Overview'},
				{code: 'Cmc', order: 3, title: 'Converted Mana Cost'}
			];
			$scope.displayData.viewType = $scope.displayData.viewTypeOptions[0];
		})
		.error(function(data, status, headers, config) {
		});
	} 
});