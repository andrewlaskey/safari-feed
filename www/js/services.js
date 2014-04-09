var safariFeedServices = angular.module('safariFeedServices',[]);

safariFeedServices.

service('mapService', function() {

	var map;

	this.loadMap = function(zooCenter, zooBounds) {

		map = L.map('map');

		L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
	    	attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
		}).addTo(map);

		map.setView(zooCenter.split(','), 15);

		//Draw rectangle around zoo
		L.rectangle(
			[
				[zooBounds.latMin, zooBounds.longMin],
				[zooBounds.latMax, zooBounds.longMax]
			],
			{
				color: '#f06060',
				stroke: 3,
				fill: false
			}).addTo(map);
	};

	this.addHeatMap = function(updates) {
		var heatmapLayer = new L.TileLayer.HeatCanvas({},{
			'step': 0.5,
	        'degree': HeatCanvas.LINEAR,
	        'opacity': 0.7
	    });

		_.each(updates, function(value, key){	
			
			var currentHour = new moment().hour();
			var updateHour = new moment(value.time).hour();

			if (updateHour === currentHour) {
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

		L.control.layers(null, {'Historic Activity': heatmapLayer}, {collapsed: false}).addTo(map);
	};

});