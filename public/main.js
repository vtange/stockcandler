(function() {
    //start of function
  var app = angular.module('Candler', []);

app.controller('MainCtrl', ['$scope','$http','$window', function($scope, $http, $window){
	//search stocks form
	$scope.input = {};

	//search returned stocks
	$scope.found = null;

	//search function
	$scope.searchTicker = function(ticker){
		$http.post($window.location.href+"search",$scope.input).success(function(data){
			$scope.found = data;
		});
	};

	//user bookmarked stocks
    $scope.myStocks = [];

	//logged in user
    $scope.activeUser = null;

	//used to transfer server data to client
	$scope.init = function(package) {
		$scope.activeUser = package[0];
		$scope.myStocks = package[1][0];
	};


	
	
}]);//end of controller
	//PlainJS/JQuery goes here if need be
  //end of function
})();
