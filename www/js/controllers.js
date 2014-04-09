var safariFeedControllers = angular.module('safariFeedControllers', []);
 
safariFeedControllers.controller('MapCtrl', ['$scope', '$firebase', 'mapService',
  function ($scope, $firebase, mapService) {

  	mapService.loadMap();

    //Get Zoo Data
	$scope.zoo = $firebase(new Firebase('https://safarifeed.firebaseio.com/zoos/0'));
	$scope.updates = $firebase(new Firebase('https://safarifeed.firebaseio.com/zoos/0/updates'));
	
	//Load map when ready
	$scope.zoo.$on('loaded', function(value) {
		mapService.getMapReady(value.center, value.bounds);
		mapService.addHeatMap(value.updates);
		
	});

	$scope.updates.$on('child_added', function(value) {
		var blob = value.snapshot.value;
		mapService.addUpdate(blob);
	});
	
  }]);