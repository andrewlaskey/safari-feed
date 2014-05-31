var firebasePath = 'https://safarifeed.firebaseio.com';
//var firebasePath = 'https://safarifeedtest.firebaseio.com';

var safariFeedControllers = angular.module('safariFeedControllers', []);
 
safariFeedControllers.controller('MapCtrl', ['$scope', '$firebase', '$sanitize', 'mapService',
  function ($scope, $firebase, $sanitize, mapService) {

  	$scope.isCommenting = false;
	$scope.isThinking = false;
	$scope.isLocating = false;
	$scope.isPosting = false;
	$scope.isCommentReady = false;

  	mapService.loadMap('map');

    //Get Zoo Data
	$scope.zoo = $firebase(new Firebase(firebasePath + '/zoos/0'));
	$scope.updates = $firebase(new Firebase(firebasePath + '/zoos/0/updates'));
	
	//Load map when ready
	$scope.zoo.$on('loaded', function(value) {
		mapService.getMapReady(value.center, value.bounds);
		mapService.addHeatMap(value.updates);
		
	});

	$scope.updates.$on('child_added', function(value) {
		mapService.addUpdate(value.snapshot.value, value.snapshot.name);
	});

	$scope.openComments = function() {
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
					$scope.loc = userCoord;
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

	$scope.addComment = function(sentiment) {
		$scope.isCommentReady = false;
		$scope.isThinking = true;
		$scope.isPosting = true;

		if (typeof $scope.email === 'undefined') {
			if (mapService.testBounds($scope.loc, $scope.zoo.bounds)) {
				$scope.updates
					.$add({
						comment: $sanitize($scope.comment),
						sentiment: sentiment,
						loc: $scope.loc,
						time: Date.now()
					})
					.then(function(ref){
						$scope.isThinking = false;
						$scope.isPosting = false;
						$scope.isCommenting = false;
						mapService.removeUserMarker();
					});

				$scope.comment = '';
				
			} else {
				alert('You need to be in the zoo to post an update.');
				$scope.isCommentReady = true;
				$scope.isThinking = false;
				$scope.isPosting = false;
			}
		}
	}

	$scope.closeComment = function() {
		$scope.isCommenting = false;
		$scope.isCommentReady = false;
		mapService.removeUserMarker();
	}
	
  }]);

safariFeedControllers.controller('ListCtrl', ['$scope', '$firebase', '$sanitize',
	function ($scope, $firebase, $sanitize) {
		$scope.updates = $firebase(new Firebase(firebasePath + '/zoos/0/updates'));

		$scope.formatTime = function(dbTime) {
			return moment(dbTime).format("M/D/YY, h:mm A");
		}
}]);

safariFeedControllers.controller('DetailCtrl', ['$scope', '$firebase', '$routeParams', '$sanitize','mapService',
	function ($scope, $firebase, $routeParams, $sanitize, mapService) {

		mapService.loadMap('detail-map');

		$scope.update = $firebase(new Firebase(firebasePath + '/zoos/0/updates/' + $routeParams.updateID));

		$scope.update.$on('loaded', function(value) {
			mapService.centerOnLocation(value.loc.latitude, value.loc.longitude);
			mapService.addSingleMarker(value);
		});
		
		$scope.formatTime = function(dbTime) {
			return moment(dbTime).format("M/D/YY, h:mm A");
		}
}]);

safariFeedControllers.controller('AboutCtrl', ['$scope',
	function ($scope) {

}]);