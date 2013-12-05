
//https://github.com/leaflet-extras/leaflet-providers

(function () {
	'use strict';

	L.TileLayer.Provider = L.TileLayer.extend({
		initialize: function (arg, options) {
			var providers = L.TileLayer.Provider.providers;

			var parts = arg.split('.');

			var providerName = parts[0];
			var variantName = parts[1];

			if (!providers[providerName]) {
				throw 'No such provider (' + providerName + ')';
			}

			var provider = {
				url: providers[providerName].url,
				options: providers[providerName].options
			};

			// overwrite values in provider from variant.
			if (variantName && 'variants' in providers[providerName]) {
				if (!(variantName in providers[providerName].variants)) {
					throw 'No such name in provider (' + variantName + ')';
				}
				var variant = providers[providerName].variants[variantName];
				provider = {
					url: variant.url || provider.url,
					options: L.Util.extend({}, provider.options, variant.options)
				};
			} else if (typeof provider.url === 'function') {
				provider.url = provider.url(parts.splice(1).join('.'));
			}

			// replace attribution placeholders with their values from toplevel provider attribution,
			// recursively
			var attributionReplacer = function (attr) {
				if (attr.indexOf('{attribution.') === -1) {
					return attr;
				}
				return attr.replace(/\{attribution.(\w*)\}/,
					function (match, attributionName) {
						return attributionReplacer(providers[attributionName].options.attribution);
					}
				);
			};
			provider.options.attribution = attributionReplacer(provider.options.attribution);

			// Compute final options combining provider options with any user overrides
			var layerOpts = L.Util.extend({}, provider.options, options);
			L.TileLayer.prototype.initialize.call(this, provider.url, layerOpts);
		}
	});

	/**
	 * Definition of providers.
	 * see http://leafletjs.com/reference.html#tilelayer for options in the options map.
	 */

	//jshint maxlen:220
	L.TileLayer.Provider.providers = {
		OpenStreetMap: {
			url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
			options: {
				attribution:
					'&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
					'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
			},
			variants: {
				Mapnik: {},
				BlackAndWhite: {
					url: 'http://{s}.www.toolserver.org/tiles/bw-mapnik/{z}/{x}/{y}.png'
				},
				DE: {
					url: 'http://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png'
				}
			}
		},
		OpenCycleMap: {
			url: 'http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png',
			options: {
				attribution:
					'&copy; <a href="http://www.opencyclemap.org">OpenCycleMap</a>, {attribution.OpenStreetMap}'
			}
		},
		OpenSeaMap: {
			url: 'http://tiles.openseamap.org/seamark/{z}/{x}/{y}.png',
			options: {
				attribution: 'Map data: &copy; <a href="http://www.openseamap.org">OpenSeaMap</a> contributors'
			}
		},
		Thunderforest: {
			url: 'http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png',
			options: {
				attribution: '{attribution.OpenCycleMap}'
			},
			variants: {
				OpenCycleMap: {},
				Transport: {
					url: 'http://{s}.tile2.opencyclemap.org/transport/{z}/{x}/{y}.png'
				},
				Landscape: {
					url: 'http://{s}.tile3.opencyclemap.org/landscape/{z}/{x}/{y}.png'
				},
				Outdoors: {
					url: 'http://{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png'
				}
			}
		},
		OpenMapSurfer: {
			url: 'http://129.206.74.245:8001/tms_r.ashx?x={x}&y={y}&z={z}',
			options: {
				attribution: 'Imagery from <a href="http://giscience.uni-hd.de/">GIScience Research Group @ University of Heidelberg</a> &mdash; Map data {attribution.OpenStreetMap}'
			},
			variants: {
				Grayscale: {
					url: 'http://129.206.74.245:8008/tms_rg.ashx?x={x}&y={y}&z={z}'
				}
			}
		},
		MapQuestOpen: {
			url: 'http://otile{s}.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpeg',
			options: {
				attribution:
					'Tiles Courtesy of <a href="http://www.mapquest.com/">MapQuest</a> &mdash; ' +
					'Map data {attribution.OpenStreetMap}',
				subdomains: '1234'
			},
			variants: {
				OSM: {},
				Aerial: {
					url: 'http://oatile{s}.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.jpg',
					options: {
						attribution:
							'Tiles Courtesy of <a href="http://www.mapquest.com/">MapQuest</a> &mdash; ' +
							'Portions Courtesy NASA/JPL-Caltech and U.S. Depart. of Agriculture, Farm Service Agency'
					}
				}
			}
		},
		MapBox: {
			url: function (id) {
				return 'http://{s}.tiles.mapbox.com/v3/' + id + '/{z}/{x}/{y}.png';
			},
			options: {
				attribution:
					'Imagery from <a href="http://mapbox.com/about/maps/">MapBox</a> &mdash; ' +
					'Map data {attribution.OpenStreetMap}',
				subdomains: 'abcd'
			}
		},
		Stamen: {
			url: 'http://{s}.tile.stamen.com/toner/{z}/{x}/{y}.png',
			options: {
				attribution:
					'Map tiles by <a href="http://stamen.com">Stamen Design</a>, ' +
					'<a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; ' +
					'Map data {attribution.OpenStreetMap}',
				subdomains: 'abcd',
				minZoom: 0,
				maxZoom: 20
			},
			variants: {
				Toner: {},
				TonerBackground: {
					url: 'http://{s}.tile.stamen.com/toner-background/{z}/{x}/{y}.png'
				},
				TonerHybrid: {
					url: 'http://{s}.tile.stamen.com/toner-hybrid/{z}/{x}/{y}.png'
				},
				TonerLines: {
					url: 'http://{s}.tile.stamen.com/toner-lines/{z}/{x}/{y}.png'
				},
				TonerLabels: {
					url: 'http://{s}.tile.stamen.com/toner-labels/{z}/{x}/{y}.png'
				},
				TonerLite: {
					url: 'http://{s}.tile.stamen.com/toner-lite/{z}/{x}/{y}.png'
				},
				Terrain: {
					url: 'http://{s}.tile.stamen.com/terrain/{z}/{x}/{y}.jpg',
					options: {
						minZoom: 4,
						maxZoom: 18
					}
				},
				TerrainBackground: {
					url: 'http://{s}.tile.stamen.com/terrain-background/{z}/{x}/{y}.jpg',
					options: {
						minZoom: 4,
						maxZoom: 18
					}
				},
				Watercolor: {
					url: 'http://{s}.tile.stamen.com/watercolor/{z}/{x}/{y}.jpg',
					options: {
						minZoom: 3,
						maxZoom: 16
					}
				}
			}
		},
		Esri: {
			url: 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
			options: {
				attribution: 'Tiles &copy; Esri'
			},
			variants: {
				WorldStreetMap: {
					options: {
						attribution:
							'{attribution.Esri} &mdash; ' +
							'Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
					}
				},
				DeLorme: {
					url: 'http://server.arcgisonline.com/ArcGIS/rest/services/Specialty/DeLorme_World_Base_Map/MapServer/tile/{z}/{y}/{x}',
					options: {
						minZoom: 1,
						maxZoom: 11,
						attribution: '{attribution.Esri} &mdash; Copyright: &copy;2012 DeLorme'
					}
				},
				WorldTopoMap: {
					url: 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
					options: {
						attribution:
							'{attribution.Esri} &mdash; ' +
							'Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
					}
				},
				WorldImagery: {
					url: 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
					options: {
						attribution:
							'{attribution.Esri} &mdash; ' +
							'Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
					}
				},
				WorldTerrain: {
					url: 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}',
					options: {
						maxZoom: 13,
						attribution:
							'{attribution.Esri} &mdash; ' +
							'Source: USGS, Esri, TANA, DeLorme, and NPS'
					}
				},
				WorldShadedRelief: {
					url: 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}',
					options: {
						maxZoom: 13,
						attribution: '{attribution.Esri} &mdash; Source: Esri'
					}
				},
				WorldPhysical: {
					url: 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}',
					options: {
						maxZoom: 8,
						attribution: '{attribution.Esri} &mdash; Source: US National Park Service'
					}
				},
				OceanBasemap: {
					url: 'http://services.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer/tile/{z}/{y}/{x}',
					options: {
						maxZoom: 13,
						attribution: '{attribution.Esri} &mdash; Sources: GEBCO, NOAA, CHS, OSU, UNH, CSUMB, National Geographic, DeLorme, NAVTEQ, and Esri'
					}
				},
				NatGeoWorldMap: {
					url: 'http://services.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}',
					options: {
						maxZoom: 16,
						attribution: '{attribution.Esri} &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC'
					}
				},
				WorldGrayCanvas: {
					url: 'http://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
					options: {
						maxZoom: 16,
						attribution: '{attribution.Esri} &mdash; Esri, DeLorme, NAVTEQ'
					}
				}
			}
		},
		OpenWeatherMap: {
			options: {
				attribution: 'Map data &copy; <a href="http://openweathermap.org">OpenWeatherMap</a>',
				opacity: 0.5
			},
			variants: {
				Clouds: {
					url: 'http://{s}.tile.openweathermap.org/map/clouds/{z}/{x}/{y}.png'
				},
				CloudsClassic: {
					url: 'http://{s}.tile.openweathermap.org/map/clouds_cls/{z}/{x}/{y}.png'
				},
				Precipitation: {
					url: 'http://{s}.tile.openweathermap.org/map/precipitation/{z}/{x}/{y}.png'
				},
				PrecipitationClassic: {
					url: 'http://{s}.tile.openweathermap.org/map/precipitation_cls/{z}/{x}/{y}.png'
				},
				Rain: {
					url: 'http://{s}.tile.openweathermap.org/map/rain/{z}/{x}/{y}.png'
				},
				RainClassic: {
					url: 'http://{s}.tile.openweathermap.org/map/rain_cls/{z}/{x}/{y}.png'
				},
				Pressure: {
					url: 'http://{s}.tile.openweathermap.org/map/pressure/{z}/{x}/{y}.png'
				},
				PressureContour: {
					url: 'http://{s}.tile.openweathermap.org/map/pressure_cntr/{z}/{x}/{y}.png'
				},
				Wind: {
					url: 'http://{s}.tile.openweathermap.org/map/wind/{z}/{x}/{y}.png'
				},
				Temperature: {
					url: 'http://{s}.tile.openweathermap.org/map/temp/{z}/{x}/{y}.png'
				},
				Snow: {
					url: 'http://{s}.tile.openweathermap.org/map/snow/{z}/{x}/{y}.png'
				}
			}
		},
		Nokia: {
			options: {
				attribution:
					'Map &copy; <a href="http://developer.here.com">Nokia</a>, Data &copy; NAVTEQ 2012',
				subdomains: '1234',
				devID: 'xyz', //These basemaps are free and you can sign up here:  http://developer.here.com/plans
				appID: 'abc'
			},
			variants: {
				normalDay: {
					url: 'http://{s}.maptile.lbs.ovi.com/maptiler/v2/maptile/newest/normal.day/{z}/{x}/{y}/256/png8?token={devID}&app_id={appID}'
				},
				normalGreyDay: {
					url: 'http://{s}.maptile.lbs.ovi.com/maptiler/v2/maptile/newest/normal.day.grey/{z}/{x}/{y}/256/png8?token={devID}&app_id={appID}'
				},
				satelliteNoLabelsDay: {
					url: 'http://{s}.maptile.lbs.ovi.com/maptiler/v2/maptile/newest/satellite.day/{z}/{x}/{y}/256/png8?token={devID}&app_id={appID}'
				},
				satelliteYesLabelsDay: {
					url: 'http://{s}.maptile.lbs.ovi.com/maptiler/v2/maptile/newest/hybrid.day/{z}/{x}/{y}/256/png8?token={devID}&app_id={appID}'
				},
				terrainDay: {
					url: 'http://{s}.maptile.lbs.ovi.com/maptiler/v2/maptile/newest/terrain.day/{z}/{x}/{y}/256/png8?token={devID}&app_id={appID}'
				}
			}
		},
		Acetate: {
			url: 'http://a{s}.acetate.geoiq.com/tiles/acetate-hillshading/{z}/{x}/{y}.png',
			options: {
				attribution:
					'&copy;2012 Esri & Stamen, Data from OSM and Natural Earth',
				subdomains: '0123',
				minZoom: 2,
				maxZoom: 18
			},
			variants: {
				all: {},
				basemap: {
					url: 'http://a{s}.acetate.geoiq.com/tiles/acetate-base/{z}/{x}/{y}.png'
				},
				terrain: {
					url: 'http://a{s}.acetate.geoiq.com/tiles/terrain/{z}/{x}/{y}.png'
				},
				foreground: {
					url: 'http://a{s}.acetate.geoiq.com/tiles/acetate-fg/{z}/{x}/{y}.png'
				},
				roads: {
					url: 'http://a{s}.acetate.geoiq.com/tiles/acetate-roads/{z}/{x}/{y}.png'
				},
				labels: {
					url: 'http://a{s}.acetate.geoiq.com/tiles/acetate-labels/{z}/{x}/{y}.png'
				},
				hillshading: {
					url: 'http://a{s}.acetate.geoiq.com/tiles/hillshading/{z}/{x}/{y}.png'
				}
			}
		},
		CloudMade: {
			url:'http://{s}.tile.cloudmade.com/{apiKey}/{styleID}/256/{z}/{x}/{y}.png',
			options: {
				attribution:
					'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
					'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
					'Map tile imagery © <a href="http://cloudmade.com">CloudMade</a>',
				minZoom: 0,
				apiKey: 'abc', // Sign up for an API key at http://cloudmade.com/ - first 500,000 tile requests are free
				styleID: '1'
			},
			variants: {
				standardResolution: {
					maxZoom:18
				},
				highResolution: {
					url:'http://{s}.tile.cloudmade.com/{apiKey}/{styleID}@2x/256/{z}/{x}/{y}.png',
					maxZoom:19
				}
			}
		}
	};

	L.tileLayer.provider = function (provider, options) {
		return new L.TileLayer.Provider(provider, options);
	};

	L.Control.Layers.Provided = L.Control.Layers.extend({
		initialize: function (base, overlay, options) {
			var first;

			var labelFormatter = function (label) {
				return label.replace(/\./g, ': ').replace(/([a-z])([A-Z])/g, '$1 $2');
			};

			if (base.length) {
				(function () {
					var out = {},
					    len = base.length,
					    i = 0;

					while (i < len) {
						if (typeof base[i] === 'string') {
							if (i === 0) {
								first = L.tileLayer.provider(base[0]);
								out[labelFormatter(base[i])] = first;
							} else {
								out[labelFormatter(base[i])] = L.tileLayer.provider(base[i]);
							}
						}
						i++;
					}
					base = out;
				}());
				this._first = first;
			}

			if (overlay && overlay.length) {
				(function () {
					var out = {},
					    len = overlay.length,
					    i = 0;

					while (i < len) {
						if (typeof base[i] === 'string') {
							out[labelFormatter(overlay[i])] = L.tileLayer.provider(overlay[i]);
						}
						i++;
					}
					overlay = out;
				}());
			}
			L.Control.Layers.prototype.initialize.call(this, base, overlay, options);
		},
		onAdd: function (map) {
			this._first.addTo(map);
			return L.Control.Layers.prototype.onAdd.call(this, map);
		}
	});

	L.control.layers.provided = function (baseLayers, overlays, options) {
		return new L.Control.Layers.Provided(baseLayers, overlays, options);
	};
}());

/*
  Leaflet.AwesomeMarkers, a plugin that adds colorful iconic markers for Leaflet, based on the Font Awesome icons
  (c) 2012-2013, Lennard Voogdt

  http://leafletjs.com
  https://github.com/lvoogdt
*//*global L*/(function(e,t,n){"use strict";L.AwesomeMarkers={};L.AwesomeMarkers.version="2.0.1";L.AwesomeMarkers.Icon=L.Icon.extend({options:{iconSize:[35,45],iconAnchor:[17,42],popupAnchor:[1,-32],shadowAnchor:[10,12],shadowSize:[36,16],className:"awesome-marker",prefix:"icon",spinClass:"fa-spin",icon:"home",markerColor:"blue",iconColor:"white"},initialize:function(e){e=L.Util.setOptions(this,e)},createIcon:function(){var e=t.createElement("div"),n=this.options;n.icon&&(e.innerHTML=this._createInner());n.bgPos&&(e.style.backgroundPosition=-n.bgPos.x+"px "+ -n.bgPos.y+"px");this._setIconStyles(e,"icon-"+n.markerColor);return e},_createInner:function(){var e,t="",n="",r="",i=this.options;i.icon.slice(0,i.prefix.length+1)===i.prefix+"-"?e=i.icon:e=i.prefix+"-"+i.icon;i.spin&&typeof i.spinClass=="string"&&(t=i.spinClass);i.iconColor&&(i.iconColor==="white"||i.iconColor==="black"?n="icon-"+i.iconColor:r="style='color: "+i.iconColor+"' ");return"<i "+r+"class='"+i.prefix+" "+e+" "+t+" "+n+"'></i>"},_setIconStyles:function(e,t){var n=this.options,r=L.point(n[t==="shadow"?"shadowSize":"iconSize"]),i;t==="shadow"?i=L.point(n.shadowAnchor||n.iconAnchor):i=L.point(n.iconAnchor);!i&&r&&(i=r.divideBy(2,!0));e.className="awesome-marker-"+t+" "+n.className;if(i){e.style.marginLeft=-i.x+"px";e.style.marginTop=-i.y+"px"}if(r){e.style.width=r.x+"px";e.style.height=r.y+"px"}},createShadow:function(){var e=t.createElement("div");this._setIconStyles(e,"shadow");return e}});L.AwesomeMarkers.icon=function(e){return new L.AwesomeMarkers.Icon(e)}})(this,document);

//! moment.js
//! version : 2.4.0
//! authors : Tim Wood, Iskren Chernev, Moment.js contributors
//! license : MIT
//! momentjs.com
(function(a){function b(a,b){return function(c){return i(a.call(this,c),b)}}function c(a,b){return function(c){return this.lang().ordinal(a.call(this,c),b)}}function d(){}function e(a){u(a),g(this,a)}function f(a){var b=o(a),c=b.year||0,d=b.month||0,e=b.week||0,f=b.day||0,g=b.hour||0,h=b.minute||0,i=b.second||0,j=b.millisecond||0;this._input=a,this._milliseconds=+j+1e3*i+6e4*h+36e5*g,this._days=+f+7*e,this._months=+d+12*c,this._data={},this._bubble()}function g(a,b){for(var c in b)b.hasOwnProperty(c)&&(a[c]=b[c]);return b.hasOwnProperty("toString")&&(a.toString=b.toString),b.hasOwnProperty("valueOf")&&(a.valueOf=b.valueOf),a}function h(a){return 0>a?Math.ceil(a):Math.floor(a)}function i(a,b){for(var c=a+"";c.length<b;)c="0"+c;return c}function j(a,b,c,d){var e,f,g=b._milliseconds,h=b._days,i=b._months;g&&a._d.setTime(+a._d+g*c),(h||i)&&(e=a.minute(),f=a.hour()),h&&a.date(a.date()+h*c),i&&a.month(a.month()+i*c),g&&!d&&bb.updateOffset(a),(h||i)&&(a.minute(e),a.hour(f))}function k(a){return"[object Array]"===Object.prototype.toString.call(a)}function l(a){return"[object Date]"===Object.prototype.toString.call(a)||a instanceof Date}function m(a,b,c){var d,e=Math.min(a.length,b.length),f=Math.abs(a.length-b.length),g=0;for(d=0;e>d;d++)(c&&a[d]!==b[d]||!c&&q(a[d])!==q(b[d]))&&g++;return g+f}function n(a){if(a){var b=a.toLowerCase().replace(/(.)s$/,"$1");a=Kb[a]||Lb[b]||b}return a}function o(a){var b,c,d={};for(c in a)a.hasOwnProperty(c)&&(b=n(c),b&&(d[b]=a[c]));return d}function p(b){var c,d;if(0===b.indexOf("week"))c=7,d="day";else{if(0!==b.indexOf("month"))return;c=12,d="month"}bb[b]=function(e,f){var g,h,i=bb.fn._lang[b],j=[];if("number"==typeof e&&(f=e,e=a),h=function(a){var b=bb().utc().set(d,a);return i.call(bb.fn._lang,b,e||"")},null!=f)return h(f);for(g=0;c>g;g++)j.push(h(g));return j}}function q(a){var b=+a,c=0;return 0!==b&&isFinite(b)&&(c=b>=0?Math.floor(b):Math.ceil(b)),c}function r(a,b){return new Date(Date.UTC(a,b+1,0)).getUTCDate()}function s(a){return t(a)?366:365}function t(a){return 0===a%4&&0!==a%100||0===a%400}function u(a){var b;a._a&&-2===a._pf.overflow&&(b=a._a[gb]<0||a._a[gb]>11?gb:a._a[hb]<1||a._a[hb]>r(a._a[fb],a._a[gb])?hb:a._a[ib]<0||a._a[ib]>23?ib:a._a[jb]<0||a._a[jb]>59?jb:a._a[kb]<0||a._a[kb]>59?kb:a._a[lb]<0||a._a[lb]>999?lb:-1,a._pf._overflowDayOfYear&&(fb>b||b>hb)&&(b=hb),a._pf.overflow=b)}function v(a){a._pf={empty:!1,unusedTokens:[],unusedInput:[],overflow:-2,charsLeftOver:0,nullInput:!1,invalidMonth:null,invalidFormat:!1,userInvalidated:!1,iso:!1}}function w(a){return null==a._isValid&&(a._isValid=!isNaN(a._d.getTime())&&a._pf.overflow<0&&!a._pf.empty&&!a._pf.invalidMonth&&!a._pf.nullInput&&!a._pf.invalidFormat&&!a._pf.userInvalidated,a._strict&&(a._isValid=a._isValid&&0===a._pf.charsLeftOver&&0===a._pf.unusedTokens.length)),a._isValid}function x(a){return a?a.toLowerCase().replace("_","-"):a}function y(a,b){return b.abbr=a,mb[a]||(mb[a]=new d),mb[a].set(b),mb[a]}function z(a){delete mb[a]}function A(a){var b,c,d,e,f=0,g=function(a){if(!mb[a]&&nb)try{require("./lang/"+a)}catch(b){}return mb[a]};if(!a)return bb.fn._lang;if(!k(a)){if(c=g(a))return c;a=[a]}for(;f<a.length;){for(e=x(a[f]).split("-"),b=e.length,d=x(a[f+1]),d=d?d.split("-"):null;b>0;){if(c=g(e.slice(0,b).join("-")))return c;if(d&&d.length>=b&&m(e,d,!0)>=b-1)break;b--}f++}return bb.fn._lang}function B(a){return a.match(/\[[\s\S]/)?a.replace(/^\[|\]$/g,""):a.replace(/\\/g,"")}function C(a){var b,c,d=a.match(rb);for(b=0,c=d.length;c>b;b++)d[b]=Pb[d[b]]?Pb[d[b]]:B(d[b]);return function(e){var f="";for(b=0;c>b;b++)f+=d[b]instanceof Function?d[b].call(e,a):d[b];return f}}function D(a,b){return a.isValid()?(b=E(b,a.lang()),Mb[b]||(Mb[b]=C(b)),Mb[b](a)):a.lang().invalidDate()}function E(a,b){function c(a){return b.longDateFormat(a)||a}var d=5;for(sb.lastIndex=0;d>=0&&sb.test(a);)a=a.replace(sb,c),sb.lastIndex=0,d-=1;return a}function F(a,b){var c;switch(a){case"DDDD":return vb;case"YYYY":case"GGGG":case"gggg":return wb;case"YYYYY":case"GGGGG":case"ggggg":return xb;case"S":case"SS":case"SSS":case"DDD":return ub;case"MMM":case"MMMM":case"dd":case"ddd":case"dddd":return zb;case"a":case"A":return A(b._l)._meridiemParse;case"X":return Cb;case"Z":case"ZZ":return Ab;case"T":return Bb;case"SSSS":return yb;case"MM":case"DD":case"YY":case"GG":case"gg":case"HH":case"hh":case"mm":case"ss":case"M":case"D":case"d":case"H":case"h":case"m":case"s":case"w":case"ww":case"W":case"WW":case"e":case"E":return tb;default:return c=new RegExp(N(M(a.replace("\\","")),"i"))}}function G(a){var b=(Ab.exec(a)||[])[0],c=(b+"").match(Hb)||["-",0,0],d=+(60*c[1])+q(c[2]);return"+"===c[0]?-d:d}function H(a,b,c){var d,e=c._a;switch(a){case"M":case"MM":null!=b&&(e[gb]=q(b)-1);break;case"MMM":case"MMMM":d=A(c._l).monthsParse(b),null!=d?e[gb]=d:c._pf.invalidMonth=b;break;case"D":case"DD":null!=b&&(e[hb]=q(b));break;case"DDD":case"DDDD":null!=b&&(c._dayOfYear=q(b));break;case"YY":e[fb]=q(b)+(q(b)>68?1900:2e3);break;case"YYYY":case"YYYYY":e[fb]=q(b);break;case"a":case"A":c._isPm=A(c._l).isPM(b);break;case"H":case"HH":case"h":case"hh":e[ib]=q(b);break;case"m":case"mm":e[jb]=q(b);break;case"s":case"ss":e[kb]=q(b);break;case"S":case"SS":case"SSS":case"SSSS":e[lb]=q(1e3*("0."+b));break;case"X":c._d=new Date(1e3*parseFloat(b));break;case"Z":case"ZZ":c._useUTC=!0,c._tzm=G(b);break;case"w":case"ww":case"W":case"WW":case"d":case"dd":case"ddd":case"dddd":case"e":case"E":a=a.substr(0,1);case"gg":case"gggg":case"GG":case"GGGG":case"GGGGG":a=a.substr(0,2),b&&(c._w=c._w||{},c._w[a]=b)}}function I(a){var b,c,d,e,f,g,h,i,j,k,l=[];if(!a._d){for(d=K(a),a._w&&null==a._a[hb]&&null==a._a[gb]&&(f=function(b){return b?b.length<3?parseInt(b,10)>68?"19"+b:"20"+b:b:null==a._a[fb]?bb().weekYear():a._a[fb]},g=a._w,null!=g.GG||null!=g.W||null!=g.E?h=X(f(g.GG),g.W||1,g.E,4,1):(i=A(a._l),j=null!=g.d?T(g.d,i):null!=g.e?parseInt(g.e,10)+i._week.dow:0,k=parseInt(g.w,10)||1,null!=g.d&&j<i._week.dow&&k++,h=X(f(g.gg),k,j,i._week.doy,i._week.dow)),a._a[fb]=h.year,a._dayOfYear=h.dayOfYear),a._dayOfYear&&(e=null==a._a[fb]?d[fb]:a._a[fb],a._dayOfYear>s(e)&&(a._pf._overflowDayOfYear=!0),c=S(e,0,a._dayOfYear),a._a[gb]=c.getUTCMonth(),a._a[hb]=c.getUTCDate()),b=0;3>b&&null==a._a[b];++b)a._a[b]=l[b]=d[b];for(;7>b;b++)a._a[b]=l[b]=null==a._a[b]?2===b?1:0:a._a[b];l[ib]+=q((a._tzm||0)/60),l[jb]+=q((a._tzm||0)%60),a._d=(a._useUTC?S:R).apply(null,l)}}function J(a){var b;a._d||(b=o(a._i),a._a=[b.year,b.month,b.day,b.hour,b.minute,b.second,b.millisecond],I(a))}function K(a){var b=new Date;return a._useUTC?[b.getUTCFullYear(),b.getUTCMonth(),b.getUTCDate()]:[b.getFullYear(),b.getMonth(),b.getDate()]}function L(a){a._a=[],a._pf.empty=!0;var b,c,d,e,f,g=A(a._l),h=""+a._i,i=h.length,j=0;for(d=E(a._f,g).match(rb)||[],b=0;b<d.length;b++)e=d[b],c=(F(e,a).exec(h)||[])[0],c&&(f=h.substr(0,h.indexOf(c)),f.length>0&&a._pf.unusedInput.push(f),h=h.slice(h.indexOf(c)+c.length),j+=c.length),Pb[e]?(c?a._pf.empty=!1:a._pf.unusedTokens.push(e),H(e,c,a)):a._strict&&!c&&a._pf.unusedTokens.push(e);a._pf.charsLeftOver=i-j,h.length>0&&a._pf.unusedInput.push(h),a._isPm&&a._a[ib]<12&&(a._a[ib]+=12),a._isPm===!1&&12===a._a[ib]&&(a._a[ib]=0),I(a),u(a)}function M(a){return a.replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g,function(a,b,c,d,e){return b||c||d||e})}function N(a){return a.replace(/[-\/\\^$*+?.()|[\]{}]/g,"\\$&")}function O(a){var b,c,d,e,f;if(0===a._f.length)return a._pf.invalidFormat=!0,a._d=new Date(0/0),void 0;for(e=0;e<a._f.length;e++)f=0,b=g({},a),v(b),b._f=a._f[e],L(b),w(b)&&(f+=b._pf.charsLeftOver,f+=10*b._pf.unusedTokens.length,b._pf.score=f,(null==d||d>f)&&(d=f,c=b));g(a,c||b)}function P(a){var b,c=a._i,d=Db.exec(c);if(d){for(a._pf.iso=!0,b=4;b>0;b--)if(d[b]){a._f=Fb[b-1]+(d[6]||" ");break}for(b=0;4>b;b++)if(Gb[b][1].exec(c)){a._f+=Gb[b][0];break}Ab.exec(c)&&(a._f+="Z"),L(a)}else a._d=new Date(c)}function Q(b){var c=b._i,d=ob.exec(c);c===a?b._d=new Date:d?b._d=new Date(+d[1]):"string"==typeof c?P(b):k(c)?(b._a=c.slice(0),I(b)):l(c)?b._d=new Date(+c):"object"==typeof c?J(b):b._d=new Date(c)}function R(a,b,c,d,e,f,g){var h=new Date(a,b,c,d,e,f,g);return 1970>a&&h.setFullYear(a),h}function S(a){var b=new Date(Date.UTC.apply(null,arguments));return 1970>a&&b.setUTCFullYear(a),b}function T(a,b){if("string"==typeof a)if(isNaN(a)){if(a=b.weekdaysParse(a),"number"!=typeof a)return null}else a=parseInt(a,10);return a}function U(a,b,c,d,e){return e.relativeTime(b||1,!!c,a,d)}function V(a,b,c){var d=eb(Math.abs(a)/1e3),e=eb(d/60),f=eb(e/60),g=eb(f/24),h=eb(g/365),i=45>d&&["s",d]||1===e&&["m"]||45>e&&["mm",e]||1===f&&["h"]||22>f&&["hh",f]||1===g&&["d"]||25>=g&&["dd",g]||45>=g&&["M"]||345>g&&["MM",eb(g/30)]||1===h&&["y"]||["yy",h];return i[2]=b,i[3]=a>0,i[4]=c,U.apply({},i)}function W(a,b,c){var d,e=c-b,f=c-a.day();return f>e&&(f-=7),e-7>f&&(f+=7),d=bb(a).add("d",f),{week:Math.ceil(d.dayOfYear()/7),year:d.year()}}function X(a,b,c,d,e){var f,g,h=new Date(Date.UTC(a,0)).getUTCDay();return c=null!=c?c:e,f=e-h+(h>d?7:0),g=7*(b-1)+(c-e)+f+1,{year:g>0?a:a-1,dayOfYear:g>0?g:s(a-1)+g}}function Y(a){var b=a._i,c=a._f;return"undefined"==typeof a._pf&&v(a),null===b?bb.invalid({nullInput:!0}):("string"==typeof b&&(a._i=b=A().preparse(b)),bb.isMoment(b)?(a=g({},b),a._d=new Date(+b._d)):c?k(c)?O(a):L(a):Q(a),new e(a))}function Z(a,b){bb.fn[a]=bb.fn[a+"s"]=function(a){var c=this._isUTC?"UTC":"";return null!=a?(this._d["set"+c+b](a),bb.updateOffset(this),this):this._d["get"+c+b]()}}function $(a){bb.duration.fn[a]=function(){return this._data[a]}}function _(a,b){bb.duration.fn["as"+a]=function(){return+this/b}}function ab(a){var b=!1,c=bb;"undefined"==typeof ender&&(this.moment=a?function(){return!b&&console&&console.warn&&(b=!0,console.warn("Accessing Moment through the global scope is deprecated, and will be removed in an upcoming release.")),c.apply(null,arguments)}:bb)}for(var bb,cb,db="2.4.0",eb=Math.round,fb=0,gb=1,hb=2,ib=3,jb=4,kb=5,lb=6,mb={},nb="undefined"!=typeof module&&module.exports,ob=/^\/?Date\((\-?\d+)/i,pb=/(\-)?(?:(\d*)\.)?(\d+)\:(\d+)(?:\:(\d+)\.?(\d{3})?)?/,qb=/^(-)?P(?:(?:([0-9,.]*)Y)?(?:([0-9,.]*)M)?(?:([0-9,.]*)D)?(?:T(?:([0-9,.]*)H)?(?:([0-9,.]*)M)?(?:([0-9,.]*)S)?)?|([0-9,.]*)W)$/,rb=/(\[[^\[]*\])|(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|mm?|ss?|S{1,4}|X|zz?|ZZ?|.)/g,sb=/(\[[^\[]*\])|(\\)?(LT|LL?L?L?|l{1,4})/g,tb=/\d\d?/,ub=/\d{1,3}/,vb=/\d{3}/,wb=/\d{1,4}/,xb=/[+\-]?\d{1,6}/,yb=/\d+/,zb=/[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i,Ab=/Z|[\+\-]\d\d:?\d\d/i,Bb=/T/i,Cb=/[\+\-]?\d+(\.\d{1,3})?/,Db=/^\s*\d{4}-(?:(\d\d-\d\d)|(W\d\d$)|(W\d\d-\d)|(\d\d\d))((T| )(\d\d(:\d\d(:\d\d(\.\d+)?)?)?)?([\+\-]\d\d:?\d\d|Z)?)?$/,Eb="YYYY-MM-DDTHH:mm:ssZ",Fb=["YYYY-MM-DD","GGGG-[W]WW","GGGG-[W]WW-E","YYYY-DDD"],Gb=[["HH:mm:ss.SSSS",/(T| )\d\d:\d\d:\d\d\.\d{1,3}/],["HH:mm:ss",/(T| )\d\d:\d\d:\d\d/],["HH:mm",/(T| )\d\d:\d\d/],["HH",/(T| )\d\d/]],Hb=/([\+\-]|\d\d)/gi,Ib="Date|Hours|Minutes|Seconds|Milliseconds".split("|"),Jb={Milliseconds:1,Seconds:1e3,Minutes:6e4,Hours:36e5,Days:864e5,Months:2592e6,Years:31536e6},Kb={ms:"millisecond",s:"second",m:"minute",h:"hour",d:"day",D:"date",w:"week",W:"isoWeek",M:"month",y:"year",DDD:"dayOfYear",e:"weekday",E:"isoWeekday",gg:"weekYear",GG:"isoWeekYear"},Lb={dayofyear:"dayOfYear",isoweekday:"isoWeekday",isoweek:"isoWeek",weekyear:"weekYear",isoweekyear:"isoWeekYear"},Mb={},Nb="DDD w W M D d".split(" "),Ob="M D H h m s w W".split(" "),Pb={M:function(){return this.month()+1},MMM:function(a){return this.lang().monthsShort(this,a)},MMMM:function(a){return this.lang().months(this,a)},D:function(){return this.date()},DDD:function(){return this.dayOfYear()},d:function(){return this.day()},dd:function(a){return this.lang().weekdaysMin(this,a)},ddd:function(a){return this.lang().weekdaysShort(this,a)},dddd:function(a){return this.lang().weekdays(this,a)},w:function(){return this.week()},W:function(){return this.isoWeek()},YY:function(){return i(this.year()%100,2)},YYYY:function(){return i(this.year(),4)},YYYYY:function(){return i(this.year(),5)},gg:function(){return i(this.weekYear()%100,2)},gggg:function(){return this.weekYear()},ggggg:function(){return i(this.weekYear(),5)},GG:function(){return i(this.isoWeekYear()%100,2)},GGGG:function(){return this.isoWeekYear()},GGGGG:function(){return i(this.isoWeekYear(),5)},e:function(){return this.weekday()},E:function(){return this.isoWeekday()},a:function(){return this.lang().meridiem(this.hours(),this.minutes(),!0)},A:function(){return this.lang().meridiem(this.hours(),this.minutes(),!1)},H:function(){return this.hours()},h:function(){return this.hours()%12||12},m:function(){return this.minutes()},s:function(){return this.seconds()},S:function(){return q(this.milliseconds()/100)},SS:function(){return i(q(this.milliseconds()/10),2)},SSS:function(){return i(this.milliseconds(),3)},SSSS:function(){return i(this.milliseconds(),3)},Z:function(){var a=-this.zone(),b="+";return 0>a&&(a=-a,b="-"),b+i(q(a/60),2)+":"+i(q(a)%60,2)},ZZ:function(){var a=-this.zone(),b="+";return 0>a&&(a=-a,b="-"),b+i(q(10*a/6),4)},z:function(){return this.zoneAbbr()},zz:function(){return this.zoneName()},X:function(){return this.unix()}},Qb=["months","monthsShort","weekdays","weekdaysShort","weekdaysMin"];Nb.length;)cb=Nb.pop(),Pb[cb+"o"]=c(Pb[cb],cb);for(;Ob.length;)cb=Ob.pop(),Pb[cb+cb]=b(Pb[cb],2);for(Pb.DDDD=b(Pb.DDD,3),g(d.prototype,{set:function(a){var b,c;for(c in a)b=a[c],"function"==typeof b?this[c]=b:this["_"+c]=b},_months:"January_February_March_April_May_June_July_August_September_October_November_December".split("_"),months:function(a){return this._months[a.month()]},_monthsShort:"Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),monthsShort:function(a){return this._monthsShort[a.month()]},monthsParse:function(a){var b,c,d;for(this._monthsParse||(this._monthsParse=[]),b=0;12>b;b++)if(this._monthsParse[b]||(c=bb.utc([2e3,b]),d="^"+this.months(c,"")+"|^"+this.monthsShort(c,""),this._monthsParse[b]=new RegExp(d.replace(".",""),"i")),this._monthsParse[b].test(a))return b},_weekdays:"Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),weekdays:function(a){return this._weekdays[a.day()]},_weekdaysShort:"Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),weekdaysShort:function(a){return this._weekdaysShort[a.day()]},_weekdaysMin:"Su_Mo_Tu_We_Th_Fr_Sa".split("_"),weekdaysMin:function(a){return this._weekdaysMin[a.day()]},weekdaysParse:function(a){var b,c,d;for(this._weekdaysParse||(this._weekdaysParse=[]),b=0;7>b;b++)if(this._weekdaysParse[b]||(c=bb([2e3,1]).day(b),d="^"+this.weekdays(c,"")+"|^"+this.weekdaysShort(c,"")+"|^"+this.weekdaysMin(c,""),this._weekdaysParse[b]=new RegExp(d.replace(".",""),"i")),this._weekdaysParse[b].test(a))return b},_longDateFormat:{LT:"h:mm A",L:"MM/DD/YYYY",LL:"MMMM D YYYY",LLL:"MMMM D YYYY LT",LLLL:"dddd, MMMM D YYYY LT"},longDateFormat:function(a){var b=this._longDateFormat[a];return!b&&this._longDateFormat[a.toUpperCase()]&&(b=this._longDateFormat[a.toUpperCase()].replace(/MMMM|MM|DD|dddd/g,function(a){return a.slice(1)}),this._longDateFormat[a]=b),b},isPM:function(a){return"p"===(a+"").toLowerCase().charAt(0)},_meridiemParse:/[ap]\.?m?\.?/i,meridiem:function(a,b,c){return a>11?c?"pm":"PM":c?"am":"AM"},_calendar:{sameDay:"[Today at] LT",nextDay:"[Tomorrow at] LT",nextWeek:"dddd [at] LT",lastDay:"[Yesterday at] LT",lastWeek:"[Last] dddd [at] LT",sameElse:"L"},calendar:function(a,b){var c=this._calendar[a];return"function"==typeof c?c.apply(b):c},_relativeTime:{future:"in %s",past:"%s ago",s:"a few seconds",m:"a minute",mm:"%d minutes",h:"an hour",hh:"%d hours",d:"a day",dd:"%d days",M:"a month",MM:"%d months",y:"a year",yy:"%d years"},relativeTime:function(a,b,c,d){var e=this._relativeTime[c];return"function"==typeof e?e(a,b,c,d):e.replace(/%d/i,a)},pastFuture:function(a,b){var c=this._relativeTime[a>0?"future":"past"];return"function"==typeof c?c(b):c.replace(/%s/i,b)},ordinal:function(a){return this._ordinal.replace("%d",a)},_ordinal:"%d",preparse:function(a){return a},postformat:function(a){return a},week:function(a){return W(a,this._week.dow,this._week.doy).week},_week:{dow:0,doy:6},_invalidDate:"Invalid date",invalidDate:function(){return this._invalidDate}}),bb=function(b,c,d,e){return"boolean"==typeof d&&(e=d,d=a),Y({_i:b,_f:c,_l:d,_strict:e,_isUTC:!1})},bb.utc=function(b,c,d,e){var f;return"boolean"==typeof d&&(e=d,d=a),f=Y({_useUTC:!0,_isUTC:!0,_l:d,_i:b,_f:c,_strict:e}).utc()},bb.unix=function(a){return bb(1e3*a)},bb.duration=function(a,b){var c,d,e,g=bb.isDuration(a),h="number"==typeof a,i=g?a._input:h?{}:a,j=null;return h?b?i[b]=a:i.milliseconds=a:(j=pb.exec(a))?(c="-"===j[1]?-1:1,i={y:0,d:q(j[hb])*c,h:q(j[ib])*c,m:q(j[jb])*c,s:q(j[kb])*c,ms:q(j[lb])*c}):(j=qb.exec(a))&&(c="-"===j[1]?-1:1,e=function(a){var b=a&&parseFloat(a.replace(",","."));return(isNaN(b)?0:b)*c},i={y:e(j[2]),M:e(j[3]),d:e(j[4]),h:e(j[5]),m:e(j[6]),s:e(j[7]),w:e(j[8])}),d=new f(i),g&&a.hasOwnProperty("_lang")&&(d._lang=a._lang),d},bb.version=db,bb.defaultFormat=Eb,bb.updateOffset=function(){},bb.lang=function(a,b){var c;return a?(b?y(x(a),b):null===b?(z(a),a="en"):mb[a]||A(a),c=bb.duration.fn._lang=bb.fn._lang=A(a),c._abbr):bb.fn._lang._abbr},bb.langData=function(a){return a&&a._lang&&a._lang._abbr&&(a=a._lang._abbr),A(a)},bb.isMoment=function(a){return a instanceof e},bb.isDuration=function(a){return a instanceof f},cb=Qb.length-1;cb>=0;--cb)p(Qb[cb]);for(bb.normalizeUnits=function(a){return n(a)},bb.invalid=function(a){var b=bb.utc(0/0);return null!=a?g(b._pf,a):b._pf.userInvalidated=!0,b},bb.parseZone=function(a){return bb(a).parseZone()},g(bb.fn=e.prototype,{clone:function(){return bb(this)},valueOf:function(){return+this._d+6e4*(this._offset||0)},unix:function(){return Math.floor(+this/1e3)},toString:function(){return this.clone().lang("en").format("ddd MMM DD YYYY HH:mm:ss [GMT]ZZ")},toDate:function(){return this._offset?new Date(+this):this._d},toISOString:function(){return D(bb(this).utc(),"YYYY-MM-DD[T]HH:mm:ss.SSS[Z]")},toArray:function(){var a=this;return[a.year(),a.month(),a.date(),a.hours(),a.minutes(),a.seconds(),a.milliseconds()]},isValid:function(){return w(this)},isDSTShifted:function(){return this._a?this.isValid()&&m(this._a,(this._isUTC?bb.utc(this._a):bb(this._a)).toArray())>0:!1},parsingFlags:function(){return g({},this._pf)},invalidAt:function(){return this._pf.overflow},utc:function(){return this.zone(0)},local:function(){return this.zone(0),this._isUTC=!1,this},format:function(a){var b=D(this,a||bb.defaultFormat);return this.lang().postformat(b)},add:function(a,b){var c;return c="string"==typeof a?bb.duration(+b,a):bb.duration(a,b),j(this,c,1),this},subtract:function(a,b){var c;return c="string"==typeof a?bb.duration(+b,a):bb.duration(a,b),j(this,c,-1),this},diff:function(a,b,c){var d,e,f=this._isUTC?bb(a).zone(this._offset||0):bb(a).local(),g=6e4*(this.zone()-f.zone());return b=n(b),"year"===b||"month"===b?(d=432e5*(this.daysInMonth()+f.daysInMonth()),e=12*(this.year()-f.year())+(this.month()-f.month()),e+=(this-bb(this).startOf("month")-(f-bb(f).startOf("month")))/d,e-=6e4*(this.zone()-bb(this).startOf("month").zone()-(f.zone()-bb(f).startOf("month").zone()))/d,"year"===b&&(e/=12)):(d=this-f,e="second"===b?d/1e3:"minute"===b?d/6e4:"hour"===b?d/36e5:"day"===b?(d-g)/864e5:"week"===b?(d-g)/6048e5:d),c?e:h(e)},from:function(a,b){return bb.duration(this.diff(a)).lang(this.lang()._abbr).humanize(!b)},fromNow:function(a){return this.from(bb(),a)},calendar:function(){var a=this.diff(bb().zone(this.zone()).startOf("day"),"days",!0),b=-6>a?"sameElse":-1>a?"lastWeek":0>a?"lastDay":1>a?"sameDay":2>a?"nextDay":7>a?"nextWeek":"sameElse";return this.format(this.lang().calendar(b,this))},isLeapYear:function(){return t(this.year())},isDST:function(){return this.zone()<this.clone().month(0).zone()||this.zone()<this.clone().month(5).zone()},day:function(a){var b=this._isUTC?this._d.getUTCDay():this._d.getDay();return null!=a?(a=T(a,this.lang()),this.add({d:a-b})):b},month:function(a){var b,c=this._isUTC?"UTC":"";return null!=a?"string"==typeof a&&(a=this.lang().monthsParse(a),"number"!=typeof a)?this:(b=this.date(),this.date(1),this._d["set"+c+"Month"](a),this.date(Math.min(b,this.daysInMonth())),bb.updateOffset(this),this):this._d["get"+c+"Month"]()},startOf:function(a){switch(a=n(a)){case"year":this.month(0);case"month":this.date(1);case"week":case"isoWeek":case"day":this.hours(0);case"hour":this.minutes(0);case"minute":this.seconds(0);case"second":this.milliseconds(0)}return"week"===a?this.weekday(0):"isoWeek"===a&&this.isoWeekday(1),this},endOf:function(a){return a=n(a),this.startOf(a).add("isoWeek"===a?"week":a,1).subtract("ms",1)},isAfter:function(a,b){return b="undefined"!=typeof b?b:"millisecond",+this.clone().startOf(b)>+bb(a).startOf(b)},isBefore:function(a,b){return b="undefined"!=typeof b?b:"millisecond",+this.clone().startOf(b)<+bb(a).startOf(b)},isSame:function(a,b){return b="undefined"!=typeof b?b:"millisecond",+this.clone().startOf(b)===+bb(a).startOf(b)},min:function(a){return a=bb.apply(null,arguments),this>a?this:a},max:function(a){return a=bb.apply(null,arguments),a>this?this:a},zone:function(a){var b=this._offset||0;return null==a?this._isUTC?b:this._d.getTimezoneOffset():("string"==typeof a&&(a=G(a)),Math.abs(a)<16&&(a=60*a),this._offset=a,this._isUTC=!0,b!==a&&j(this,bb.duration(b-a,"m"),1,!0),this)},zoneAbbr:function(){return this._isUTC?"UTC":""},zoneName:function(){return this._isUTC?"Coordinated Universal Time":""},parseZone:function(){return"string"==typeof this._i&&this.zone(this._i),this},hasAlignedHourOffset:function(a){return a=a?bb(a).zone():0,0===(this.zone()-a)%60},daysInMonth:function(){return r(this.year(),this.month())},dayOfYear:function(a){var b=eb((bb(this).startOf("day")-bb(this).startOf("year"))/864e5)+1;return null==a?b:this.add("d",a-b)},weekYear:function(a){var b=W(this,this.lang()._week.dow,this.lang()._week.doy).year;return null==a?b:this.add("y",a-b)},isoWeekYear:function(a){var b=W(this,1,4).year;return null==a?b:this.add("y",a-b)},week:function(a){var b=this.lang().week(this);return null==a?b:this.add("d",7*(a-b))},isoWeek:function(a){var b=W(this,1,4).week;return null==a?b:this.add("d",7*(a-b))},weekday:function(a){var b=(this.day()+7-this.lang()._week.dow)%7;return null==a?b:this.add("d",a-b)},isoWeekday:function(a){return null==a?this.day()||7:this.day(this.day()%7?a:a-7)},get:function(a){return a=n(a),this[a]()},set:function(a,b){return a=n(a),"function"==typeof this[a]&&this[a](b),this},lang:function(b){return b===a?this._lang:(this._lang=A(b),this)}}),cb=0;cb<Ib.length;cb++)Z(Ib[cb].toLowerCase().replace(/s$/,""),Ib[cb]);Z("year","FullYear"),bb.fn.days=bb.fn.day,bb.fn.months=bb.fn.month,bb.fn.weeks=bb.fn.week,bb.fn.isoWeeks=bb.fn.isoWeek,bb.fn.toJSON=bb.fn.toISOString,g(bb.duration.fn=f.prototype,{_bubble:function(){var a,b,c,d,e=this._milliseconds,f=this._days,g=this._months,i=this._data;i.milliseconds=e%1e3,a=h(e/1e3),i.seconds=a%60,b=h(a/60),i.minutes=b%60,c=h(b/60),i.hours=c%24,f+=h(c/24),i.days=f%30,g+=h(f/30),i.months=g%12,d=h(g/12),i.years=d},weeks:function(){return h(this.days()/7)},valueOf:function(){return this._milliseconds+864e5*this._days+2592e6*(this._months%12)+31536e6*q(this._months/12)},humanize:function(a){var b=+this,c=V(b,!a,this.lang());return a&&(c=this.lang().pastFuture(b,c)),this.lang().postformat(c)},add:function(a,b){var c=bb.duration(a,b);return this._milliseconds+=c._milliseconds,this._days+=c._days,this._months+=c._months,this._bubble(),this},subtract:function(a,b){var c=bb.duration(a,b);return this._milliseconds-=c._milliseconds,this._days-=c._days,this._months-=c._months,this._bubble(),this},get:function(a){return a=n(a),this[a.toLowerCase()+"s"]()},as:function(a){return a=n(a),this["as"+a.charAt(0).toUpperCase()+a.slice(1)+"s"]()},lang:bb.fn.lang,toIsoString:function(){var a=Math.abs(this.years()),b=Math.abs(this.months()),c=Math.abs(this.days()),d=Math.abs(this.hours()),e=Math.abs(this.minutes()),f=Math.abs(this.seconds()+this.milliseconds()/1e3);return this.asSeconds()?(this.asSeconds()<0?"-":"")+"P"+(a?a+"Y":"")+(b?b+"M":"")+(c?c+"D":"")+(d||e||f?"T":"")+(d?d+"H":"")+(e?e+"M":"")+(f?f+"S":""):"P0D"}});for(cb in Jb)Jb.hasOwnProperty(cb)&&(_(cb,Jb[cb]),$(cb.toLowerCase()));_("Weeks",6048e5),bb.duration.fn.asMonths=function(){return(+this-31536e6*this.years())/2592e6+12*this.years()},bb.lang("en",{ordinal:function(a){var b=a%10,c=1===q(a%100/10)?"th":1===b?"st":2===b?"nd":3===b?"rd":"th";return a+c}}),nb?(module.exports=bb,ab(!0)):"function"==typeof define&&define.amd?define("moment",function(b,c,d){return d.config().noGlobal!==!0&&ab(d.config().noGlobal===a),bb}):ab()}).call(this);

function FastClick(b){var c,a=this;this.trackingClick=false;this.trackingClickStart=0;this.targetElement=null;this.touchStartX=0;this.touchStartY=0;this.lastTouchIdentifier=0;this.touchBoundary=10;this.layer=b;if(!b||!b.nodeType){throw new TypeError("Layer must be a document node")}this.onClick=function(){return FastClick.prototype.onClick.apply(a,arguments)};this.onMouse=function(){return FastClick.prototype.onMouse.apply(a,arguments)};this.onTouchStart=function(){return FastClick.prototype.onTouchStart.apply(a,arguments)};this.onTouchMove=function(){return FastClick.prototype.onTouchMove.apply(a,arguments)};this.onTouchEnd=function(){return FastClick.prototype.onTouchEnd.apply(a,arguments)};this.onTouchCancel=function(){return FastClick.prototype.onTouchCancel.apply(a,arguments)};if(FastClick.notNeeded(b)){return}if(this.deviceIsAndroid){b.addEventListener("mouseover",this.onMouse,true);b.addEventListener("mousedown",this.onMouse,true);b.addEventListener("mouseup",this.onMouse,true)}b.addEventListener("click",this.onClick,true);b.addEventListener("touchstart",this.onTouchStart,false);b.addEventListener("touchmove",this.onTouchMove,false);b.addEventListener("touchend",this.onTouchEnd,false);b.addEventListener("touchcancel",this.onTouchCancel,false);if(!Event.prototype.stopImmediatePropagation){b.removeEventListener=function(e,g,d){var f=Node.prototype.removeEventListener;if(e==="click"){f.call(b,e,g.hijacked||g,d)}else{f.call(b,e,g,d)}};b.addEventListener=function(f,g,e){var d=Node.prototype.addEventListener;if(f==="click"){d.call(b,f,g.hijacked||(g.hijacked=function(h){if(!h.propagationStopped){g(h)}}),e)}else{d.call(b,f,g,e)}}}if(typeof b.onclick==="function"){c=b.onclick;b.addEventListener("click",function(d){c(d)},false);b.onclick=null}}FastClick.prototype.deviceIsAndroid=navigator.userAgent.indexOf("Android")>0;FastClick.prototype.deviceIsIOS=/iP(ad|hone|od)/.test(navigator.userAgent);FastClick.prototype.deviceIsIOS4=FastClick.prototype.deviceIsIOS&&(/OS 4_\d(_\d)?/).test(navigator.userAgent);FastClick.prototype.deviceIsIOSWithBadTarget=FastClick.prototype.deviceIsIOS&&(/OS ([6-9]|\d{2})_\d/).test(navigator.userAgent);FastClick.prototype.needsClick=function(a){switch(a.nodeName.toLowerCase()){case"button":case"select":case"textarea":if(a.disabled){return true}break;case"input":if((this.deviceIsIOS&&a.type==="file")||a.disabled){return true}break;case"label":case"video":return true}return(/\bneedsclick\b/).test(a.className)};FastClick.prototype.needsFocus=function(a){switch(a.nodeName.toLowerCase()){case"textarea":return true;case"select":return !this.deviceIsAndroid;case"input":switch(a.type){case"button":case"checkbox":case"file":case"image":case"radio":case"submit":return false}return !a.disabled&&!a.readOnly;default:return(/\bneedsfocus\b/).test(a.className)}};FastClick.prototype.sendClick=function(b,c){var a,d;if(document.activeElement&&document.activeElement!==b){document.activeElement.blur()}d=c.changedTouches[0];a=document.createEvent("MouseEvents");a.initMouseEvent(this.determineEventType(b),true,true,window,1,d.screenX,d.screenY,d.clientX,d.clientY,false,false,false,false,0,null);a.forwardedTouchEvent=true;b.dispatchEvent(a)};FastClick.prototype.determineEventType=function(a){if(this.deviceIsAndroid&&a.tagName.toLowerCase()==="select"){return"mousedown"}return"click"};FastClick.prototype.focus=function(a){var b;if(this.deviceIsIOS&&a.setSelectionRange&&a.type.indexOf("date")!==0&&a.type!=="time"){b=a.value.length;a.setSelectionRange(b,b)}else{a.focus()}};FastClick.prototype.updateScrollParent=function(b){var c,a;c=b.fastClickScrollParent;if(!c||!c.contains(b)){a=b;do{if(a.scrollHeight>a.offsetHeight){c=a;b.fastClickScrollParent=a;break}a=a.parentElement}while(a)}if(c){c.fastClickLastScrollTop=c.scrollTop}};FastClick.prototype.getTargetElementFromEventTarget=function(a){if(a.nodeType===Node.TEXT_NODE){return a.parentNode}return a};FastClick.prototype.onTouchStart=function(c){var a,d,b;if(c.targetTouches.length>1){return true}a=this.getTargetElementFromEventTarget(c.target);d=c.targetTouches[0];if(this.deviceIsIOS){b=window.getSelection();if(b.rangeCount&&!b.isCollapsed){return true}if(!this.deviceIsIOS4){if(d.identifier===this.lastTouchIdentifier){c.preventDefault();return false}this.lastTouchIdentifier=d.identifier;this.updateScrollParent(a)}}this.trackingClick=true;this.trackingClickStart=c.timeStamp;this.targetElement=a;this.touchStartX=d.pageX;this.touchStartY=d.pageY;if((c.timeStamp-this.lastClickTime)<200){c.preventDefault()}return true};FastClick.prototype.touchHasMoved=function(a){var c=a.changedTouches[0],b=this.touchBoundary;if(Math.abs(c.pageX-this.touchStartX)>b||Math.abs(c.pageY-this.touchStartY)>b){return true}return false};FastClick.prototype.onTouchMove=function(a){if(!this.trackingClick){return true}if(this.targetElement!==this.getTargetElementFromEventTarget(a.target)||this.touchHasMoved(a)){this.trackingClick=false;this.targetElement=null}return true};FastClick.prototype.findControl=function(a){if(a.control!==undefined){return a.control}if(a.htmlFor){return document.getElementById(a.htmlFor)}return a.querySelector("button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea")};FastClick.prototype.onTouchEnd=function(c){var e,d,b,g,f,a=this.targetElement;if(!this.trackingClick){return true}if((c.timeStamp-this.lastClickTime)<200){this.cancelNextClick=true;return true}this.cancelNextClick=false;this.lastClickTime=c.timeStamp;d=this.trackingClickStart;this.trackingClick=false;this.trackingClickStart=0;if(this.deviceIsIOSWithBadTarget){f=c.changedTouches[0];a=document.elementFromPoint(f.pageX-window.pageXOffset,f.pageY-window.pageYOffset)||a;a.fastClickScrollParent=this.targetElement.fastClickScrollParent}b=a.tagName.toLowerCase();if(b==="label"){e=this.findControl(a);if(e){this.focus(a);if(this.deviceIsAndroid){return false}a=e}}else{if(this.needsFocus(a)){if((c.timeStamp-d)>100||(this.deviceIsIOS&&window.top!==window&&b==="input")){this.targetElement=null;return false}this.focus(a);if(!this.deviceIsIOS4||b!=="select"){this.targetElement=null;c.preventDefault()}return false}}if(this.deviceIsIOS&&!this.deviceIsIOS4){g=a.fastClickScrollParent;if(g&&g.fastClickLastScrollTop!==g.scrollTop){return true}}if(!this.needsClick(a)){c.preventDefault();this.sendClick(a,c)}return false};FastClick.prototype.onTouchCancel=function(){this.trackingClick=false;this.targetElement=null};FastClick.prototype.onMouse=function(a){if(!this.targetElement){return true}if(a.forwardedTouchEvent){return true}if(!a.cancelable){return true}if(!this.needsClick(this.targetElement)||this.cancelNextClick){if(a.stopImmediatePropagation){a.stopImmediatePropagation()}else{a.propagationStopped=true}a.stopPropagation();a.preventDefault();return false}return true};FastClick.prototype.onClick=function(a){var b;if(this.trackingClick){this.targetElement=null;this.trackingClick=false;return true}if(a.target.type==="submit"&&a.detail===0){return true}b=this.onMouse(a);if(!b){this.targetElement=null}return b};FastClick.prototype.destroy=function(){var a=this.layer;if(this.deviceIsAndroid){a.removeEventListener("mouseover",this.onMouse,true);a.removeEventListener("mousedown",this.onMouse,true);a.removeEventListener("mouseup",this.onMouse,true)}a.removeEventListener("click",this.onClick,true);a.removeEventListener("touchstart",this.onTouchStart,false);a.removeEventListener("touchmove",this.onTouchMove,false);a.removeEventListener("touchend",this.onTouchEnd,false);a.removeEventListener("touchcancel",this.onTouchCancel,false)};FastClick.notNeeded=function(b){var a;var c;if(typeof window.ontouchstart==="undefined"){return true}c=+(/Chrome\/([0-9]+)/.exec(navigator.userAgent)||[,0])[1];if(c){if(FastClick.prototype.deviceIsAndroid){a=document.querySelector("meta[name=viewport]");if(a){if(a.content.indexOf("user-scalable=no")!==-1){return true}if(c>31&&window.innerWidth<=window.screen.width){return true}}}else{return true}}if(b.style.msTouchAction==="none"){return true}return false};FastClick.attach=function(a){return new FastClick(a)};if(typeof define!=="undefined"&&define.amd){define(function(){return FastClick})}else{if(typeof module!=="undefined"&&module.exports){module.exports=FastClick.attach;module.exports.FastClick=FastClick}else{window.FastClick=FastClick}};


var HeatCanvas=function(a){if(typeof(a)=="string"){this.canvas=document.getElementById(a)}else{this.canvas=a}if(this.canvas==null){return null}this.worker=new Worker(HeatCanvas.getPath()+"/js/heatcanvas-worker.js");this.width=this.canvas.width;this.height=this.canvas.height;this.onRenderingStart=null;this.onRenderingEnd=null;this.data={}};HeatCanvas.prototype.resize=function(a,b){this.width=this.canvas.width=a;this.height=this.canvas.height=b;this.canvas.style.width=a+"px";this.canvas.style.height=b+"px"};HeatCanvas.prototype.push=function(a,d,b){if(a<0||a>this.width){return}if(d<0||d>this.height){return}var c=a+d*this.width;if(this.data[c]){this.data[c]=this.data[c]+b}else{this.data[c]=b}};HeatCanvas.prototype.render=function(b,c,e){b=b||1;c=c||HeatCanvas.LINEAR;var a=this;this.worker.onmessage=function(f){a.value=f.data.value;a.data={};a._render(e);if(a.onRenderingEnd){a.onRenderingEnd()}};var d={data:a.data,width:a.width,height:a.height,step:b,degree:c,value:a.value};this.worker.postMessage(d);if(this.onRenderingStart){this.onRenderingStart()}};HeatCanvas.prototype._render=function(b){b=b||HeatCanvas.defaultValue2Color;var l=this.canvas.getContext("2d");l.clearRect(0,0,this.width,this.height);defaultColor=this.bgcolor||[0,0,0,255];var d=l.createImageData(this.width,this.height);for(var e=0;e<d.data.length;e+=4){d.data[e]=defaultColor[0];d.data[e+1]=defaultColor[1];d.data[e+2]=defaultColor[2];d.data[e+3]=defaultColor[3]}var f=0;for(var a in this.value){f=Math.max(this.value[a],f)}for(var j in this.value){var k=Math.floor(j%this.width);var h=Math.floor(j/this.width);var g=h*this.width*4+k*4;var c=HeatCanvas.hsla2rgba.apply(null,b(this.value[j]/f));d.data[g]=c[0];d.data[g+1]=c[1];d.data[g+2]=c[2];d.data[g+3]=c[3]}l.putImageData(d,0,0)};HeatCanvas.prototype.clear=function(){this.data={};this.value={};this.canvas.getContext("2d").clearRect(0,0,this.width,this.height)};HeatCanvas.prototype.exportImage=function(){return this.canvas.toDataURL()};HeatCanvas.defaultValue2Color=function(f){var e=(1-f);var c=f*0.6;var d=0.8;var b=1;return[e,d,c,b]};HeatCanvas.hsla2rgba=function(j,o,i,n){var c,k,m;if(o==0){c=k=m=i}else{function f(g,b,a){if(a<0){a+=1}if(a>1){a-=1}if(a<1/6){return g+(b-g)*6*a}if(a<1/2){return b}if(a<2/3){return g+(b-g)*(2/3-a)*6}return g}var d=i<0.5?i*(1+o):i+o-i*o;var e=2*i-d;c=f(e,d,j+1/3);k=f(e,d,j);m=f(e,d,j-1/3)}return[c*255,k*255,m*255,n*255]};HeatCanvas.LINEAR=1;HeatCanvas.QUAD=2;HeatCanvas.CUBIC=3;HeatCanvas.getPath=function(){var c=document.getElementsByTagName("script");for(var b=0;b<c.length;b++){var d=c[b].src;var a=d.match(/heatcanvas(-[a-z0-9]{32})?\.js/);var e=a?a.index:0;if(e>0){return d.substring(0,e)}}return""};L.TileLayer.HeatCanvas=L.Class.extend({initialize:function(a,b){this.heatCanvasOptions=b;this.data=[];this._onRenderingStart=null;this._onRenderingEnd=null},onRenderingStart:function(a){this._onRenderingStart=a},onRenderingEnd:function(a){this._onRenderingEnd=a},onAdd:function(a){this.map=a;this._initHeatCanvas(this.map,this.heatCanvasOptions);a.on("moveend",this._redraw,this);this._redraw()},onRemove:function(a){a.getPanes().overlayPane.removeChild(this._div);a.off("moveend",this._redraw,this)},_initHeatCanvas:function(c,b){b=b||{};this._step=b.step||1;this._degree=b.degree||HeatCanvas.LINEAR;this._opacity=b.opacity||0.6;this._colorscheme=b.colorscheme||null;var a=L.DomUtil.create("div","leaflet-heatmap-container");a.style.position="absolute";a.style.width=this.map.getSize().x+"px";a.style.height=this.map.getSize().y+"px";var d=document.createElement("canvas");d.width=this.map.getSize().x;d.height=this.map.getSize().y;d.style.width=d.width+"px";d.style.height=d.height+"px";d.style.opacity=this._opacity;a.appendChild(d);this.heatmap=new HeatCanvas(d);this.heatmap.onRenderingStart=this._onRenderingStart;this.heatmap.onRenderingEnd=this._onRenderingEnd;this._div=a;this.map.getPanes().overlayPane.appendChild(this._div)},pushData:function(b,c,a){this.data.push({lat:b,lon:c,v:a})},_resetCanvasPosition:function(){var b=this.map.getBounds();var a=this.map.latLngToLayerPoint(b.getNorthWest());L.DomUtil.setPosition(this._div,a)},_redraw:function(){this._resetCanvasPosition();this.heatmap.clear();if(this.data.length>0){for(var c=0,b=this.data.length;c<b;c++){var d=new L.LatLng(this.data[c].lat,this.data[c].lon);var a=this.map.latLngToLayerPoint(d);a=this.map.layerPointToContainerPoint(a);this.heatmap.push(Math.floor(a.x),Math.floor(a.y),this.data[c].v)}this.heatmap.render(this._step,this._degree,this._colorscheme)}return this},clear:function(){this.heatmap.clear();this.data=[]},redraw:function(){this._redraw()}});L.TileLayer.heatcanvas=function(a){return new L.TileLayer.HeatCanvas(a)};

//     Underscore.js 1.5.2
//     http://underscorejs.org
//     (c) 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.
(function(){var n=this,t=n._,r={},e=Array.prototype,u=Object.prototype,i=Function.prototype,a=e.push,o=e.slice,c=e.concat,l=u.toString,f=u.hasOwnProperty,s=e.forEach,p=e.map,h=e.reduce,v=e.reduceRight,g=e.filter,d=e.every,m=e.some,y=e.indexOf,b=e.lastIndexOf,x=Array.isArray,w=Object.keys,_=i.bind,j=function(n){return n instanceof j?n:this instanceof j?(this._wrapped=n,void 0):new j(n)};"undefined"!=typeof exports?("undefined"!=typeof module&&module.exports&&(exports=module.exports=j),exports._=j):n._=j,j.VERSION="1.5.2";var A=j.each=j.forEach=function(n,t,e){if(null!=n)if(s&&n.forEach===s)n.forEach(t,e);else if(n.length===+n.length){for(var u=0,i=n.length;i>u;u++)if(t.call(e,n[u],u,n)===r)return}else for(var a=j.keys(n),u=0,i=a.length;i>u;u++)if(t.call(e,n[a[u]],a[u],n)===r)return};j.map=j.collect=function(n,t,r){var e=[];return null==n?e:p&&n.map===p?n.map(t,r):(A(n,function(n,u,i){e.push(t.call(r,n,u,i))}),e)};var E="Reduce of empty array with no initial value";j.reduce=j.foldl=j.inject=function(n,t,r,e){var u=arguments.length>2;if(null==n&&(n=[]),h&&n.reduce===h)return e&&(t=j.bind(t,e)),u?n.reduce(t,r):n.reduce(t);if(A(n,function(n,i,a){u?r=t.call(e,r,n,i,a):(r=n,u=!0)}),!u)throw new TypeError(E);return r},j.reduceRight=j.foldr=function(n,t,r,e){var u=arguments.length>2;if(null==n&&(n=[]),v&&n.reduceRight===v)return e&&(t=j.bind(t,e)),u?n.reduceRight(t,r):n.reduceRight(t);var i=n.length;if(i!==+i){var a=j.keys(n);i=a.length}if(A(n,function(o,c,l){c=a?a[--i]:--i,u?r=t.call(e,r,n[c],c,l):(r=n[c],u=!0)}),!u)throw new TypeError(E);return r},j.find=j.detect=function(n,t,r){var e;return O(n,function(n,u,i){return t.call(r,n,u,i)?(e=n,!0):void 0}),e},j.filter=j.select=function(n,t,r){var e=[];return null==n?e:g&&n.filter===g?n.filter(t,r):(A(n,function(n,u,i){t.call(r,n,u,i)&&e.push(n)}),e)},j.reject=function(n,t,r){return j.filter(n,function(n,e,u){return!t.call(r,n,e,u)},r)},j.every=j.all=function(n,t,e){t||(t=j.identity);var u=!0;return null==n?u:d&&n.every===d?n.every(t,e):(A(n,function(n,i,a){return(u=u&&t.call(e,n,i,a))?void 0:r}),!!u)};var O=j.some=j.any=function(n,t,e){t||(t=j.identity);var u=!1;return null==n?u:m&&n.some===m?n.some(t,e):(A(n,function(n,i,a){return u||(u=t.call(e,n,i,a))?r:void 0}),!!u)};j.contains=j.include=function(n,t){return null==n?!1:y&&n.indexOf===y?n.indexOf(t)!=-1:O(n,function(n){return n===t})},j.invoke=function(n,t){var r=o.call(arguments,2),e=j.isFunction(t);return j.map(n,function(n){return(e?t:n[t]).apply(n,r)})},j.pluck=function(n,t){return j.map(n,function(n){return n[t]})},j.where=function(n,t,r){return j.isEmpty(t)?r?void 0:[]:j[r?"find":"filter"](n,function(n){for(var r in t)if(t[r]!==n[r])return!1;return!0})},j.findWhere=function(n,t){return j.where(n,t,!0)},j.max=function(n,t,r){if(!t&&j.isArray(n)&&n[0]===+n[0]&&n.length<65535)return Math.max.apply(Math,n);if(!t&&j.isEmpty(n))return-1/0;var e={computed:-1/0,value:-1/0};return A(n,function(n,u,i){var a=t?t.call(r,n,u,i):n;a>e.computed&&(e={value:n,computed:a})}),e.value},j.min=function(n,t,r){if(!t&&j.isArray(n)&&n[0]===+n[0]&&n.length<65535)return Math.min.apply(Math,n);if(!t&&j.isEmpty(n))return 1/0;var e={computed:1/0,value:1/0};return A(n,function(n,u,i){var a=t?t.call(r,n,u,i):n;a<e.computed&&(e={value:n,computed:a})}),e.value},j.shuffle=function(n){var t,r=0,e=[];return A(n,function(n){t=j.random(r++),e[r-1]=e[t],e[t]=n}),e},j.sample=function(n,t,r){return arguments.length<2||r?n[j.random(n.length-1)]:j.shuffle(n).slice(0,Math.max(0,t))};var k=function(n){return j.isFunction(n)?n:function(t){return t[n]}};j.sortBy=function(n,t,r){var e=k(t);return j.pluck(j.map(n,function(n,t,u){return{value:n,index:t,criteria:e.call(r,n,t,u)}}).sort(function(n,t){var r=n.criteria,e=t.criteria;if(r!==e){if(r>e||r===void 0)return 1;if(e>r||e===void 0)return-1}return n.index-t.index}),"value")};var F=function(n){return function(t,r,e){var u={},i=null==r?j.identity:k(r);return A(t,function(r,a){var o=i.call(e,r,a,t);n(u,o,r)}),u}};j.groupBy=F(function(n,t,r){(j.has(n,t)?n[t]:n[t]=[]).push(r)}),j.indexBy=F(function(n,t,r){n[t]=r}),j.countBy=F(function(n,t){j.has(n,t)?n[t]++:n[t]=1}),j.sortedIndex=function(n,t,r,e){r=null==r?j.identity:k(r);for(var u=r.call(e,t),i=0,a=n.length;a>i;){var o=i+a>>>1;r.call(e,n[o])<u?i=o+1:a=o}return i},j.toArray=function(n){return n?j.isArray(n)?o.call(n):n.length===+n.length?j.map(n,j.identity):j.values(n):[]},j.size=function(n){return null==n?0:n.length===+n.length?n.length:j.keys(n).length},j.first=j.head=j.take=function(n,t,r){return null==n?void 0:null==t||r?n[0]:o.call(n,0,t)},j.initial=function(n,t,r){return o.call(n,0,n.length-(null==t||r?1:t))},j.last=function(n,t,r){return null==n?void 0:null==t||r?n[n.length-1]:o.call(n,Math.max(n.length-t,0))},j.rest=j.tail=j.drop=function(n,t,r){return o.call(n,null==t||r?1:t)},j.compact=function(n){return j.filter(n,j.identity)};var M=function(n,t,r){return t&&j.every(n,j.isArray)?c.apply(r,n):(A(n,function(n){j.isArray(n)||j.isArguments(n)?t?a.apply(r,n):M(n,t,r):r.push(n)}),r)};j.flatten=function(n,t){return M(n,t,[])},j.without=function(n){return j.difference(n,o.call(arguments,1))},j.uniq=j.unique=function(n,t,r,e){j.isFunction(t)&&(e=r,r=t,t=!1);var u=r?j.map(n,r,e):n,i=[],a=[];return A(u,function(r,e){(t?e&&a[a.length-1]===r:j.contains(a,r))||(a.push(r),i.push(n[e]))}),i},j.union=function(){return j.uniq(j.flatten(arguments,!0))},j.intersection=function(n){var t=o.call(arguments,1);return j.filter(j.uniq(n),function(n){return j.every(t,function(t){return j.indexOf(t,n)>=0})})},j.difference=function(n){var t=c.apply(e,o.call(arguments,1));return j.filter(n,function(n){return!j.contains(t,n)})},j.zip=function(){for(var n=j.max(j.pluck(arguments,"length").concat(0)),t=new Array(n),r=0;n>r;r++)t[r]=j.pluck(arguments,""+r);return t},j.object=function(n,t){if(null==n)return{};for(var r={},e=0,u=n.length;u>e;e++)t?r[n[e]]=t[e]:r[n[e][0]]=n[e][1];return r},j.indexOf=function(n,t,r){if(null==n)return-1;var e=0,u=n.length;if(r){if("number"!=typeof r)return e=j.sortedIndex(n,t),n[e]===t?e:-1;e=0>r?Math.max(0,u+r):r}if(y&&n.indexOf===y)return n.indexOf(t,r);for(;u>e;e++)if(n[e]===t)return e;return-1},j.lastIndexOf=function(n,t,r){if(null==n)return-1;var e=null!=r;if(b&&n.lastIndexOf===b)return e?n.lastIndexOf(t,r):n.lastIndexOf(t);for(var u=e?r:n.length;u--;)if(n[u]===t)return u;return-1},j.range=function(n,t,r){arguments.length<=1&&(t=n||0,n=0),r=arguments[2]||1;for(var e=Math.max(Math.ceil((t-n)/r),0),u=0,i=new Array(e);e>u;)i[u++]=n,n+=r;return i};var R=function(){};j.bind=function(n,t){var r,e;if(_&&n.bind===_)return _.apply(n,o.call(arguments,1));if(!j.isFunction(n))throw new TypeError;return r=o.call(arguments,2),e=function(){if(!(this instanceof e))return n.apply(t,r.concat(o.call(arguments)));R.prototype=n.prototype;var u=new R;R.prototype=null;var i=n.apply(u,r.concat(o.call(arguments)));return Object(i)===i?i:u}},j.partial=function(n){var t=o.call(arguments,1);return function(){return n.apply(this,t.concat(o.call(arguments)))}},j.bindAll=function(n){var t=o.call(arguments,1);if(0===t.length)throw new Error("bindAll must be passed function names");return A(t,function(t){n[t]=j.bind(n[t],n)}),n},j.memoize=function(n,t){var r={};return t||(t=j.identity),function(){var e=t.apply(this,arguments);return j.has(r,e)?r[e]:r[e]=n.apply(this,arguments)}},j.delay=function(n,t){var r=o.call(arguments,2);return setTimeout(function(){return n.apply(null,r)},t)},j.defer=function(n){return j.delay.apply(j,[n,1].concat(o.call(arguments,1)))},j.throttle=function(n,t,r){var e,u,i,a=null,o=0;r||(r={});var c=function(){o=r.leading===!1?0:new Date,a=null,i=n.apply(e,u)};return function(){var l=new Date;o||r.leading!==!1||(o=l);var f=t-(l-o);return e=this,u=arguments,0>=f?(clearTimeout(a),a=null,o=l,i=n.apply(e,u)):a||r.trailing===!1||(a=setTimeout(c,f)),i}},j.debounce=function(n,t,r){var e,u,i,a,o;return function(){i=this,u=arguments,a=new Date;var c=function(){var l=new Date-a;t>l?e=setTimeout(c,t-l):(e=null,r||(o=n.apply(i,u)))},l=r&&!e;return e||(e=setTimeout(c,t)),l&&(o=n.apply(i,u)),o}},j.once=function(n){var t,r=!1;return function(){return r?t:(r=!0,t=n.apply(this,arguments),n=null,t)}},j.wrap=function(n,t){return function(){var r=[n];return a.apply(r,arguments),t.apply(this,r)}},j.compose=function(){var n=arguments;return function(){for(var t=arguments,r=n.length-1;r>=0;r--)t=[n[r].apply(this,t)];return t[0]}},j.after=function(n,t){return function(){return--n<1?t.apply(this,arguments):void 0}},j.keys=w||function(n){if(n!==Object(n))throw new TypeError("Invalid object");var t=[];for(var r in n)j.has(n,r)&&t.push(r);return t},j.values=function(n){for(var t=j.keys(n),r=t.length,e=new Array(r),u=0;r>u;u++)e[u]=n[t[u]];return e},j.pairs=function(n){for(var t=j.keys(n),r=t.length,e=new Array(r),u=0;r>u;u++)e[u]=[t[u],n[t[u]]];return e},j.invert=function(n){for(var t={},r=j.keys(n),e=0,u=r.length;u>e;e++)t[n[r[e]]]=r[e];return t},j.functions=j.methods=function(n){var t=[];for(var r in n)j.isFunction(n[r])&&t.push(r);return t.sort()},j.extend=function(n){return A(o.call(arguments,1),function(t){if(t)for(var r in t)n[r]=t[r]}),n},j.pick=function(n){var t={},r=c.apply(e,o.call(arguments,1));return A(r,function(r){r in n&&(t[r]=n[r])}),t},j.omit=function(n){var t={},r=c.apply(e,o.call(arguments,1));for(var u in n)j.contains(r,u)||(t[u]=n[u]);return t},j.defaults=function(n){return A(o.call(arguments,1),function(t){if(t)for(var r in t)n[r]===void 0&&(n[r]=t[r])}),n},j.clone=function(n){return j.isObject(n)?j.isArray(n)?n.slice():j.extend({},n):n},j.tap=function(n,t){return t(n),n};var S=function(n,t,r,e){if(n===t)return 0!==n||1/n==1/t;if(null==n||null==t)return n===t;n instanceof j&&(n=n._wrapped),t instanceof j&&(t=t._wrapped);var u=l.call(n);if(u!=l.call(t))return!1;switch(u){case"[object String]":return n==String(t);case"[object Number]":return n!=+n?t!=+t:0==n?1/n==1/t:n==+t;case"[object Date]":case"[object Boolean]":return+n==+t;case"[object RegExp]":return n.source==t.source&&n.global==t.global&&n.multiline==t.multiline&&n.ignoreCase==t.ignoreCase}if("object"!=typeof n||"object"!=typeof t)return!1;for(var i=r.length;i--;)if(r[i]==n)return e[i]==t;var a=n.constructor,o=t.constructor;if(a!==o&&!(j.isFunction(a)&&a instanceof a&&j.isFunction(o)&&o instanceof o))return!1;r.push(n),e.push(t);var c=0,f=!0;if("[object Array]"==u){if(c=n.length,f=c==t.length)for(;c--&&(f=S(n[c],t[c],r,e)););}else{for(var s in n)if(j.has(n,s)&&(c++,!(f=j.has(t,s)&&S(n[s],t[s],r,e))))break;if(f){for(s in t)if(j.has(t,s)&&!c--)break;f=!c}}return r.pop(),e.pop(),f};j.isEqual=function(n,t){return S(n,t,[],[])},j.isEmpty=function(n){if(null==n)return!0;if(j.isArray(n)||j.isString(n))return 0===n.length;for(var t in n)if(j.has(n,t))return!1;return!0},j.isElement=function(n){return!(!n||1!==n.nodeType)},j.isArray=x||function(n){return"[object Array]"==l.call(n)},j.isObject=function(n){return n===Object(n)},A(["Arguments","Function","String","Number","Date","RegExp"],function(n){j["is"+n]=function(t){return l.call(t)=="[object "+n+"]"}}),j.isArguments(arguments)||(j.isArguments=function(n){return!(!n||!j.has(n,"callee"))}),"function"!=typeof/./&&(j.isFunction=function(n){return"function"==typeof n}),j.isFinite=function(n){return isFinite(n)&&!isNaN(parseFloat(n))},j.isNaN=function(n){return j.isNumber(n)&&n!=+n},j.isBoolean=function(n){return n===!0||n===!1||"[object Boolean]"==l.call(n)},j.isNull=function(n){return null===n},j.isUndefined=function(n){return n===void 0},j.has=function(n,t){return f.call(n,t)},j.noConflict=function(){return n._=t,this},j.identity=function(n){return n},j.times=function(n,t,r){for(var e=Array(Math.max(0,n)),u=0;n>u;u++)e[u]=t.call(r,u);return e},j.random=function(n,t){return null==t&&(t=n,n=0),n+Math.floor(Math.random()*(t-n+1))};var I={escape:{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#x27;"}};I.unescape=j.invert(I.escape);var T={escape:new RegExp("["+j.keys(I.escape).join("")+"]","g"),unescape:new RegExp("("+j.keys(I.unescape).join("|")+")","g")};j.each(["escape","unescape"],function(n){j[n]=function(t){return null==t?"":(""+t).replace(T[n],function(t){return I[n][t]})}}),j.result=function(n,t){if(null==n)return void 0;var r=n[t];return j.isFunction(r)?r.call(n):r},j.mixin=function(n){A(j.functions(n),function(t){var r=j[t]=n[t];j.prototype[t]=function(){var n=[this._wrapped];return a.apply(n,arguments),z.call(this,r.apply(j,n))}})};var N=0;j.uniqueId=function(n){var t=++N+"";return n?n+t:t},j.templateSettings={evaluate:/<%([\s\S]+?)%>/g,interpolate:/<%=([\s\S]+?)%>/g,escape:/<%-([\s\S]+?)%>/g};var q=/(.)^/,B={"'":"'","\\":"\\","\r":"r","\n":"n","	":"t","\u2028":"u2028","\u2029":"u2029"},D=/\\|'|\r|\n|\t|\u2028|\u2029/g;j.template=function(n,t,r){var e;r=j.defaults({},r,j.templateSettings);var u=new RegExp([(r.escape||q).source,(r.interpolate||q).source,(r.evaluate||q).source].join("|")+"|$","g"),i=0,a="__p+='";n.replace(u,function(t,r,e,u,o){return a+=n.slice(i,o).replace(D,function(n){return"\\"+B[n]}),r&&(a+="'+\n((__t=("+r+"))==null?'':_.escape(__t))+\n'"),e&&(a+="'+\n((__t=("+e+"))==null?'':__t)+\n'"),u&&(a+="';\n"+u+"\n__p+='"),i=o+t.length,t}),a+="';\n",r.variable||(a="with(obj||{}){\n"+a+"}\n"),a="var __t,__p='',__j=Array.prototype.join,"+"print=function(){__p+=__j.call(arguments,'');};\n"+a+"return __p;\n";try{e=new Function(r.variable||"obj","_",a)}catch(o){throw o.source=a,o}if(t)return e(t,j);var c=function(n){return e.call(this,n,j)};return c.source="function("+(r.variable||"obj")+"){\n"+a+"}",c},j.chain=function(n){return j(n).chain()};var z=function(n){return this._chain?j(n).chain():n};j.mixin(j),A(["pop","push","reverse","shift","sort","splice","unshift"],function(n){var t=e[n];j.prototype[n]=function(){var r=this._wrapped;return t.apply(r,arguments),"shift"!=n&&"splice"!=n||0!==r.length||delete r[0],z.call(this,r)}}),A(["concat","join","slice"],function(n){var t=e[n];j.prototype[n]=function(){return z.call(this,t.apply(this._wrapped,arguments))}}),j.extend(j.prototype,{chain:function(){return this._chain=!0,this},value:function(){return this._wrapped}})}).call(this);
//# sourceMappingURL=underscore-min.map

/******** APP FUNCTIONS ***********/
(function($) {

	var app = {
		map: '',
		zoo: {},
		userCoord: '',
		heatmapLayer: '',
		updateMarkers: new Array(),
		updateListener: '',
		init: function() {
			var self = this;

			//Load the map
			self.map = L.map('map');
			L.tileLayer.provider('OpenStreetMap').addTo(self.map);

			var zooRef = new Firebase('https://safarifeed.firebaseio.com/zoos/0');

			zooRef.once('value', function(data) {
				//get zoo data
				self.zoo = data.val();

				//Position the map over Zoo
				self.map.setView(self.zoo.center.split(','), 15);
			});

			//Add the heatmap
			self.addHeatmap();

			var overlayMaps = {
				'Historic Activity': self.heatmapLayer
			};

			var controls = L.control.layers(null, overlayMaps, {collapsed: false});

			controls.addTo(self.map);

			//Add the listener	
			self.updateListener = new Firebase('https://safarifeed.firebaseio.com/zoos/0/updates');

			//get the current time on page load
			var currentTime = new Date();

			//How many minutes before the current time should we query from Firebase
			var checkMinutes = 60;
			currentTime.setMinutes(currentTime.getMinutes() - checkMinutes);

			self.updateListener.on('child_added', function(snapshot) {
				self.getUpdates(snapshot, currentTime);
			});
		},
		addHeatmap: function() {
			var self = this;

			self.heatmapLayer = new L.TileLayer.HeatCanvas({},{
				'step':0.5,
                'degree':HeatCanvas.LINEAR,
                'opacity':0.7
            });

			var heatmapDataRef = new Firebase('https://safarifeed.firebaseio.com/zoos/0/updates');

			heatmapDataRef.once('value', function(data) {

				var updates = data.val();

				_.each(updates, function(value, key){	
					
					var currentHour = new moment().hour();
					var updateHour = new moment(value.time).hour();

					if (updateHour === currentHour) {
						self.heatmapLayer.pushData(
							value.loc.latitude,
							value.loc.longitude,
							15
						);
					}
				});
			});

		},
		postUpdate: function(comment, sentiment, loc) {
			//test if in bounds
			if (this.testBounds(loc)) {
				//push update to firebase
				var updatesRef = new Firebase('https://safarifeed.firebaseio.com/zoos/0/updates');

				updatesRef.push({
					comment: comment,
					sentiment: sentiment,
					loc: loc,
					time: Date.now()
				});

				//clear input for next update
				$('#jingle').val('');
				$('.Comments').removeClass('is-thinking');

			} else {
				alert('You need to be in the zoo to post an update.');
				$('#jingle').val('');
				$('.Comments').removeClass('is-thinking');
			}	
		},
		getUpdates: function(snapshot, testTime) {
			var self = this;
			var updateData = snapshot.val();

			if (updateData.time >= testTime.valueOf()) {

				var iconMarker = L.AwesomeMarkers.icon({
					icon: 'smiley',
					markerColor: 'green'
				});

				if (updateData.sentiment === 'neg') {
					iconMarker = L.AwesomeMarkers.icon({
						icon: 'sad',
						markerColor: 'darkred'
					});
				}

				var marker = L.marker([updateData.loc.latitude, updateData.loc.longitude], {icon: iconMarker})
					.bindPopup('<strong>' + updateData.comment + '</strong><br /><i>' + moment(updateData.time).format("M/D/YY, h:mm a") + '</i>')
				
				self.updateMarkers.push(marker);
				self.updateMarkers[self.updateMarkers.length - 1].addTo(self.map);
			}
		},
		testBounds: function(loc) {
			if (Math.abs(loc.latitude) >= Math.abs(this.zoo.bounds.latMax)) {return 0;}
			if (Math.abs(loc.latitude) <= Math.abs(this.zoo.bounds.latMin)) {return 0;}
			if (Math.abs(loc.longitude) >= Math.abs(this.zoo.bounds.longMax)) {return 0;}
			if (Math.abs(loc.longitude) <= Math.abs(this.zoo.bounds.longMin)) {return 0;}

			return 1;
		},
		refreshApp: function() {
			var self = this;

			//Clear Heatmap and Reload Data
			self.heatmapLayer.clear();

			var heatmapDataRef = new Firebase('https://safarifeed.firebaseio.com/zoos/0/updates');

			heatmapDataRef.once('value', function(data) {

				var updates = data.val();

				_.each(updates, function(value, key){	
					
					var currentHour = new moment().hour();
					var updateHour = new moment(value.time).hour();

					if (updateHour === currentHour) {
						self.heatmapLayer.pushData(
							value.loc.latitude,
							value.loc.longitude,
							15
						);
					}
				});
				
			});

			//Clear all the markers
			for(i = 0; i < self.updateMarkers.length; i++) {
				self.map.removeLayer(self.updateMarkers[i]);
			}

		}
	}

	FastClick.attach(document.body);

	$(document).ready(function() {

		app.init();

		//Listener
		

		//Button actions
		$('#update').on('click', function() {
			if ($('.FillSection--info').hasClass('is-hidden')) {
				$('.Comments').toggleClass('is-open');
			} else {
				$('.FillSection--info').addClass('is-hidden');
				$('.Comments').addClass('is-open');
			}
		});

		$('#settings').on('click', function() {
			$('.FillSection--info').toggleClass('is-hidden');
		});

		$('#refresh').on('click', function() {
			app.refreshApp();
		});

		$('.js-postUpdate').on('click', function() {
			var comment = $('#jingle').val();
			var sentiment = $(this).attr('data-sentiment');

			$('.Comments').addClass('is-thinking');

			if (geoPosition.init()) {
				geoPosition.getCurrentPosition(
					function(p) {
						//geoSuccess
						app.userCoord = {
							latitude: p.coords.latitude,
							longitude: p.coords.longitude
						}

						app.postUpdate(comment, sentiment, app.userCoord);
					}, 
					function() {
						//geoError
						alert('Sorry we can not find you');
						$('.Comments').removeClass('is-thinking');
					});
			}
		})
	});

}(jQuery));