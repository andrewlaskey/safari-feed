var safariFeedControllers = angular.module('safariFeedControllers', []);
 
safariFeedControllers.controller('MapCtrl', ['$scope', '$firebase', 'mapService',
  function ($scope, $firebase, mapService) {

    //Get Zoo Data
	$scope.zoo = $firebase(new Firebase('https://safarifeed.firebaseio.com/zoos/0'));
	
	//Load map when ready
	$scope.zoo.$on('loaded', function(value) {

		mapService.loadMap(value.center, value.bounds);
		mapService.addHeatMap(value.updates);
		mapService.addRecentUpdates(value.updates);
	});
	
  }]);