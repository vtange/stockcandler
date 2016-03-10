(function() {
    //start of function
  var app = angular.module('Candler', []);

app.controller('MainCtrl', ['$scope', function($scope){
	$scope.input = {};
    $scope.myStocks = [];
    $scope.activeUser = null;
	$scope.init = function(package) {
		$scope.activeUser = package[0];
		$scope.myStocks = package[1][0];
	}

	
	
	
}]);//end of controller
	//PlainJS/JQuery goes here if need be
  //end of function
})();
