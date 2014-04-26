var safariFeed = angular.module('safariFeed',['firebase', 'ngRoute', 'safariFeedControllers', 'safariFeedServices']);

safariFeed.config(['$routeProvider', function($routeProvider){
	$routeProvider.

		when('/', {
			templateUrl: 'views/view-map.html',
			controller: 'MapCtrl'
		}).
		when('/about', {
			templateUrl: 'views/view-about.html',
			controller: 'AboutCtrl'
		}).
		otherwise({
			redirectTo: '/'
		});
}]);