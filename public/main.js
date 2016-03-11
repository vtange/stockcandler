(function() {
    //start of function
  var app = angular.module('Candler', []);

app.controller('MainCtrl', ['$scope','$http','$window', function($scope, $http, $window){
	$scope.input = {};
    $scope.myStocks = [];
    $scope.activeUser = null;
	$scope.init = function(package) {
		$scope.activeUser = package[0];
		$scope.myStocks = package[1][0];
	}
	$scope.searchTicker = function(ticker){
		$http.post($window.location.href+"search",$scope.input).success(function(data){
			
			
			
		});
	}
	
	
	
}]);//end of controller
	//PlainJS/JQuery goes here if need be
  //end of function
})();
