var safariFeedControllers = angular.module('safariFeedControllers', []);
 
safariFeedControllers.controller('MapCtrl', ['$scope', '$firebase',
  function ($scope, $firebase) {
    var map = L.map('map'),
    	heatmapLayer = '';

    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    	attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
	}).addTo(map);

    //Get Zoo Data
	$scope.zoo = $firebase(new Firebase('https://safarifeed.firebaseio.com/zoos/0'));
	
	//Load map when ready
	$scope.zoo.$on('loaded', function(value) {
    	map.setView(value.center.split(','), 15);

    	//Draw rectangle around zoo
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

    	//Add heatmap layer
    	L.control.layers(null, {'Historic Activity': addHeatMap(map, value.updates)}, {collapsed: false}).addTo(map);
    });
	
  }]);

var addHeatMap = function(map, updates) {

	var heatmapLayer = new L.TileLayer.HeatCanvas({},{
		'step': 0.5,
        'degree': HeatCanvas.LINEAR,
        'opacity': 0.7
    });

	_.each(updates, function(value, key){	
		
		var currentHour = new moment().hour();
		var updateHour = new moment(value.time).hour();

		if (updateHour === updateHour) {
			if (typeof value.loc.latitude !== 'undefined' &&
				typeof value.loc.longitude !== 'undefined') {
				heatmapLayer.pushData(
					value.loc.latitude,
					value.loc.longitude,
					15
				);
			}
		}
	});

	return heatmapLayer;
}