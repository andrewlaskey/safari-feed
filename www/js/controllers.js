var safariFeedControllers = angular.module('safariFeedControllers', []);
 
safariFeedControllers.controller('MapCtrl', ['$scope', '$firebase', 'mapService',
  function ($scope, $firebase, mapService) {

  	$scope.isCommenting = false;
	$scope.isThinking = false;
	$scope.isLocating = false;
	$scope.isPosting = false;
	$scope.isCommentReady = false;

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

	$scope.openComments = function() {
		console.log("openComments");
		$scope.isCommenting = true;
		$scope.isThinking = true;
		$scope.isLocating = true;

		if (geoPosition.init()) {
			geoPosition.getCurrentPosition(
				function(p) {
					//geoSuccess
					var userCoord = {
						latitude: p.coords.latitude,
						longitude: p.coords.longitude
					}

					mapService.addUserMarker(userCoord);
					$scope.isThinking = false;
					$scope.isLocating = false;
					$scope.isCommentReady = true;
					$scope.$apply();
				},
				function() {
					//geoError
					alert('Sorry we can not find you');
				},
				{
					enableHighAccuracy: true
				}
			);
		}

	}
	
  }]);