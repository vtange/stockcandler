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
			return { "display":"static", "opacity":1 }
		}
		else{
			return { "display":"none", "opacity":0 }
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
		$scope.activeUser.detailedStocks = [];
		if($scope.activeUser){
			$scope.activeUser.stocks.forEach(function(stockObj){
				$http.post($window.location.href+"search",stockObj).success(function(data){
					$scope.activeUser.detailedStocks.push(processData(data));
				});
			})
		}
	};

	//add stock to user's list
	$scope.userAddStock = function(){
		var info = {user:$scope.activeUser,ticker:$scope.found.ticker};
		$http.post($window.location.href+"addstock",info).success(function(data){
			$scope.activeUser.stocks.push(data);
			$scope.activeUser.detailedStocks.push($scope.found);
		});
	}
	
	//remove stock to user's list
	$scope.userRemStock = function(stock, index){
		var info = {ticker:stock.ticker, index:index};
		$http.post($window.location.href+"remstock",info).success(function(data){
			$scope.activeUser.stocks.splice(index,1);
			$scope.activeUser.detailedStocks.splice($scope.activeUser.detailedStocks.indexOf(stock),1);
		});
	}

	//greys out add stock button
	$scope.userHasStock = function(){
		if($scope.activeUser && $scope.found){
			return !(stockScan($scope.activeUser.stocks, $scope.found.ticker));
		}
		else{
			return false;
		}
	}
	function stockScan(arr, ticker){
		return arr.every(function(obj){
			return obj.ticker !== ticker;
		})
	}

	//candleStyling -> Candle maker
	$scope.candleMakerThick = function(stockInfo){
		if(stockInfo){
			//remove commas for $1,000+ stocks
			var range = getRange(stockInfo.low.replace(",",""),stockInfo.high.replace(",",""));
			var open = parseFloat(stockInfo.open.replace(",","").substring(1),10);
			var ask = parseFloat(stockInfo.ask.replace(",","").substring(1),10);
			var openAskRange = Math.max(open,ask) - Math.min(open,ask);
			var openAskMdpt = (Math.max(open,ask) - Math.min(open,ask))/2;

			// calc positions and height of fat part
			var heightSetting = parseInt((openAskRange/range)*100,10) + "%"
			var topSetting =  parseInt((openAskMdpt/range)*100,10) + "%"

			// positive = green candle
			// negative = red candle
			if(ask-open>0)
				return { "background-color":"limegreen", "height": heightSetting, "transform":"translate(-50%,-"+topSetting+")" }

			else
				return{"background-color":"orangered", "height": heightSetting, "transform":"translate(-50%,-"+topSetting+")" }
		}
	}
	$scope.candleMakerThin = function(stockInfo){
	}
	function getRange(low,high){
		var zero = parseFloat(low.substring(1),10).toFixed(2);
		var hundred = parseFloat(high.substring(1),10).toFixed(2);
		return (hundred - zero).toFixed(2);
	}
	
}]);//end of controller
	//PlainJS/JQuery goes here if need be
  //end of function
})();
