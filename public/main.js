(function() {
    //start of function
  var app = angular.module('Candler', []);

app.controller('MainCtrl', ['$scope','$http','$window', function($scope, $http, $window){
	//search stocks form
	$scope.input = {};

	//search returned stocks
	$scope.found = null;
	
	//ng-style for #stock-info
	$scope.stockPopup = function(){
		if($scope.found){
			return { "height": "100%", "opacity":1 }
		}
		else{
			return { "height": "0px", "opacity":0 }
		}
	}
	
	//process data for presentation
	function processText(txt){
		//if text has quotes, remove them
		if (/(["])/g.test(txt)){
			txt = txt.match(/([\w\s+.%-]+)/g)[0];
		}
		//if text has digits{2}.digits{2}, add "$" in front of those
		if (/(\d+\.\d{2})/g.test(txt)){
			txt = txt.replace(/(\d+\.\d{2})/g,'$$$1');
		}
		//if text is greater than 1 thousand, add commas -> 1,000
		if (/\d{1,3}(?=(\d{3})+(?!\d))/g.test(txt)){
			txt = txt.replace( /\d{1,3}(?=(\d{3})+(?!\d))/g , "$&,");
		}
		return txt;
	}
	function processData(obj){
		for (var prop in obj){
			obj[prop] = processText(obj[prop]);
		}
		return obj;
	}
	
	//search function
	$scope.searchTicker = function(ticker){
		$http.post($window.location.href+"search",$scope.input).success(function(data){
			$scope.found = processData(data);
		});
	};

	//user bookmarked stocks
    $scope.myStocks = [];

	//logged in user
    $scope.activeUser = null;

	//used to transfer server data to client
	$scope.init = function(package) {
		$scope.activeUser = package[0];
		
	};

	$scope.userAddStock = function(){
		var info = {user:$scope.activeUser,ticker:$scope.found.ticker}
		$http.post($window.location.href+"addstock",info).success(function(data){
			console.log("added you to stock");
			$scope.activeUser.stocks.push(data);
		});
	}
	
	
}]);//end of controller
	//PlainJS/JQuery goes here if need be
  //end of function
})();
