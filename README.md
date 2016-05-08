![](http://res.cloudinary.com/dmj8qtant/image/upload/c_scale,w_600/v1458695460/hi12fjlvazyjmnqnrfjp.png)
# stockcandler
Client sends ticker, Server performs Yahoo Finance Search on behalf of Client and returns to Client the results. Clients collect tickers.

## Tech
Express, EJS, MongoDB, AngularJS, Socket.IO (![Angular-Socket](https://github.com/vtange/stockcandler/blob/master/public/angular-socket.js)), Yahoo Finance API(request + q), ```Q``` module

## Niceties
Socket.IO -> Update upper bar with newly added stocks. CSS-generated Candles. Update Stock-data by Date(). X-to-Close stock.

### Details
#### Routes
| GET        | POST           | PUT  | DELETE  |
| ---------- |:--------------:| ----:| -------:|
| Home   |   Ticker Search   |      |         |
|        |   Stock(Add)      |      |         |
|        |   Stock(Remove)   |      |         |

| SOCKETS   | 
| ---------- |
| Connect/Disconnect   |   
| Stock(Add)       |  

#### CSS
 - (First-use) Background Color && Image
 
 ```
 body {
    margin: 0;/*reset page*/
	background-color: #223;
	background-image: url("http://res.cloudinary.com/dmj8qtant/image/upload/c_limit,w_1600/v1458020372/parts/40324d1322809259-gridwhite.png");
	background-repeat: repeat;
	background-position: top;
	background-size: 30%;
     z-index: -10;
	color:white;
}
body:after{
  content: "";
  position: fixed;
  top: 0; 
  left: 0;
  width: 100%; 
  height: 100%;
  z-index: -1;
  background-color:rgba(20,20,30,0.8);
}
```

- Work with ```nth-child```
```
#user-stock-gallery > .stock-info-tall:last-child, .stock-info-tall:nth-child(4n), #stock-finder > .stock-info-tall{
	/*for gallery */
	border-right: 1px solid #ddd;
}
#user-stock-gallery > .stock-info-tall:nth-last-child(-n+4), #stock-finder > .stock-info-tall {
	/*last four gets border bottom */
	border-bottom: 1px solid #ddd;
}
```

#### JS
- Display error message on search ticker fail.
```
//routes.js ====
	res.status(400).send({status:"error", message: 'Invalid Ticker.'});
	
//app.js ====

	//search function
	$scope.searchTicker = function(ticker){
		$http.post($window.location.href+"search",$scope.input).success(function(data){
			$scope.found = processData(data);
		}).error(function(data){
			$scope.found = null;
			$scope.placeholderTxt = data.message;
		});
  };
```

- Socket.IO use with Angular
![Works like routes](https://github.com/vtange/stockcandler/blob/master/app/socket.js)
```
//server.js ====

// socket.io setup
var http = require('http').Server(app);
var io = require('socket.io')(http);
require('./app/socket.js')(io);
```
```
//app.js ====

var app = angular.module('Candler', ['socket.io']);
	
//setup socketURL
app.config(function ($socketProvider) {
    $socketProvider.setConnectionUrl('http://localhost:8080');
});
...
$socket.emit('stock', $scope.found.ticker);
...
	//socket events
	$socket.on('stock', function (data) {
		$scope.recentStocksList.push(data);
});
```

-

##### Hindsight
Main Page should find all ```req.user```'s Stocks and send it in packagedUser instead of multiple HTTP requests.
