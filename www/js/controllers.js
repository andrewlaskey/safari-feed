var safariFeedControllers = angular.module('safariFeedControllers', []);
 
safariFeedControllers.controller('MapCtrl', ['$scope', '$firebase',
  function ($scope, $firebase) {
    var map = L.map('map');

    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    	attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
	}).addTo(map);

    //Get Zoo Data
	$scope.zoo = $firebase(new Firebase('https://safarifeed.firebaseio.com/zoos/0'));
	
	//Load map when ready
	$scope.zoo.$on('loaded', function(value) {
    	map.setView(value.center.split(','), 15);

    	L.rectangle(
    		[
    			[value.bounds.latMin, value.bounds.longMin],
    			[value.bounds.latMax, value.bounds.longMax]
    		],
    		{
    			color: '#f06060',
    			stroke: 3,
    			fill: false
    		}).addTo(map);
    });
	
  }]);