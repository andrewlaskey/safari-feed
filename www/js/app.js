var safariFeed = angular.module('safariFeed',['firebase', 'ngRoute', 'ngAnimate', 'safariFeedControllers', 'safariFeedServices']);

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
		when('/list', {
			templateUrl: 'views/view-list.html',
			controller: 'ListCtrl'
		}).
		when('/update/:updateID', {
			templateUrl: 'views/view-detail.html',
			controller: 'DetailCtrl'
		}).
		otherwise({
			redirectTo: '/'
		});
}]);