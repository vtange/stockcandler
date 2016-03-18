(function() {
    //start of function
  var app = angular.module('Candler', ['socket.io']);
	
//setup socketURL
app.config(function ($socketProvider) {
    $socketProvider.setConnectionUrl('http://localhost:8080');
});
app.config(['$httpProvider', function ($httpProvider) {
    $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
}]);
//fix $http .error not proccing due to intercepter issue
app.config(function ($httpProvider) {
	$httpProvider.interceptors.push(function ($q, $rootScope) {

        return {
            request: function (config) {
                //the same config / modified config / a new config needs to be returned.
                return config;
            },
            requestError: function (rejection) {
                return $q.reject(rejection);
            },
            response: function (response) {
                //the same response/modified/or a new one need to be returned.
                return response;
            },
            responseError: function (rejection) {
                return $q.reject(rejection);
            }
        };
    });
});
	
app.controller('MainCtrl', ['$scope','$http','$window','$socket', function($scope, $http, $window, $socket){
	//search stocks form
	$scope.input = {};
	
	//when no found stock
	$scope.recentStocksList = [];
	
	//when no found stock
	$scope.placeholderTxt = "Search for a Stock";
	
	//search returned stocks
	$scope.found = null;
	
	//ng-style for #stock-info if something was not found
	$scope.placeholder = function(){
		if(!$scope.found){
			return { "display":"static", "opacity":1 }
		}
		else{
			return { "display":"none", "opacity":0 }
		}
	}
	
	//ng-style for #stock-finder if something was found
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
		}).error(function(data){
			$scope.placeholderTxt = data.message;
		});
	};

	//user bookmarked stocks
    $scope.myStocks = [];

	//logged in user
    $scope.activeUser = null;

	//used to transfer server data to client
	$scope.init = function(package) {
		$scope.activeUser = package[0];
		$scope.recentStocksList = package[1];
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

			$socket.emit('stock', $scope.found.ticker);
			$scope.found = null;
			$scope.placeholderTxt = "Search for a Stock";
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
	
	//sets text for stock trade volume
	$scope.checkVolume = function(avg, current){
		avg = parseInt(avg,10);
		return (parseInt((((parseInt(current,10) - avg)/avg)*100),10)+"%").replace("-","");
	}
	$scope.aboveBelow = function(avg, current){
		return avg > current ? " above average " : " below average ";
	}
	$scope.colorText = function(avg, current){
		if(avg > current){
			return { "color":"limegreen" }
		}
		else{
			return { "color":"salmon" }
		}
	}

	//socket stuff here
	$socket.on('stock', function (data) {
		$scope.recentStocksList.push(data);
	});

}]);//end of controller
	//PlainJS/JQuery goes here if need be
  //end of function
})();
