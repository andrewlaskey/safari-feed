var safariFeed = angular.module('safariFeed',['firebase', 'ngRoute', 'safariFeedControllers']);

safariFeed.config(['$routeProvider', function($routeProvider){
	$routeProvider.

		when('/', {
			templateUrl: 'views/view-map.html',
			controller: 'MapCtrl'
		}).
		otherwise({
			redirectTo: '/'
		});
}]);