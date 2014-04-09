var safariFeedServices = angular.module('safariFeedServices',[]);

safariFeedServices.

service('mapService', function() {

	var map, updateMarkers = [];

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

	this.addRecentUpdates = function(updates) {
		
		//We only want updates from the last hour
		var testTime = new Date();
		testTime.setMinutes(testTime.getMinutes() - 60);

		_.each(updates, function(value, key) {
			if (value.time >= testTime.valueOf()) {

				if (typeof value.loc.latitude !== 'undefined' &&
					typeof value.loc.longitude !== 'undefined') {

					var iconMarker = L.AwesomeMarkers.icon({
						icon: 'smiley',
						markerColor: 'green'
					});

					if (value.sentiment === 'neg') {
						iconMarker = L.AwesomeMarkers.icon({
							icon: 'sad',
							markerColor: 'darkred'
						});
					}

					var marker = L.marker([value.loc.latitude, value.loc.longitude], {icon: iconMarker})
						.bindPopup('<strong>' + value.comment + '</strong><br /><i>' + moment(value.time).format("M/D/YY, h:mm a") + '</i>')
					
					updateMarkers.push(marker);
					updateMarkers[updateMarkers.length - 1].addTo(map);
				}
			}
		});
	};

});