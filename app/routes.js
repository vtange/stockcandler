console.log("	APP/ROUTES.JS")

//for mongoDB interaction routes
var User = require('./models/user');
var StockHist = require('./models/stock');

//for date comparison / stock memory
function getDate(){
	return new Date().toString().slice(0,15);
}

//for doing HTTP requests
var Q = require('q');
var request = require('request');

// app/routes.js
module.exports = function(app) {

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function(req, res) {
		res.render('index.ejs', {
			user : req.user, // get the user out of session and pass to template
			packagedUser : JSON.stringify([req.user])
		}); // load the index.ejs file
    });
	
    // =====================================
    // SEARCH STOCKS				========
    // =====================================
    app.post('/search', function(req, res) {
		/*
		s	=ticker
		f:
			n: Name
			a: Ask
			b: Bid
			b2: Ask (Realtime)
			b3: Bid (Realtime)
			p: Previous Close
			o: Open
			c1: Change
			c: Change & Percent Change
			c6: Change (Realtime)
			k2: Change Percent (Realtime)
			p2: Change in Percent
			c8: After Hours Change (Realtime)
			g: Day’s Low
			h: Day’s High
			k1: Last Trade (Realtime) With Time
			l: Last Trade (With Time)
			l1: Last Trade (Price Only)
			k3: Last Trade Size
			v: Volume
			a2: Average Volume
			w1: Day’s Value Change
			w4: Day’s Value Change (Realtime)
			m: Day’s Range
			m2: Day’s Range (Realtime)
		*/
		var ticker = req.body.ticker.toUpperCase();;

		//perform HTTP action
		function searchByTicker(SYMBOL, STOCK){
			var url = "http://finance.yahoo.com/d/quotes.csv?s="+SYMBOL+"&f=p2oghava2n"
			var deferred = Q.defer();
			request.get(url, function (error, result) {
				deferred.resolve(result.body);
			})
			deferred.promise.then(function (value) {

				var temp = value.split(",");
				
				//if no stock, make one
				if(!STOCK){
					STOCK            = new StockHist();
					//if no stock, all data goes to today and not yesterday
					STOCK.name = temp[7];
					STOCK.ticker = SYMBOL;
					STOCK.today.percent = temp[0];
					STOCK.today.open = temp[1];
					STOCK.today.low = temp[2];
					STOCK.today.high = temp[3];
					STOCK.today.ask = temp[4];
					STOCK.today.volume = temp[5];
					STOCK.today.avgvolume = temp[6];
					STOCK.lastUpdated = getDate();
				}
				else{
					//push all old data to yesterday. update lastUpdated.
					STOCK.yesterday.percent = STOCK.today.percent;
					STOCK.yesterday.open = STOCK.today.open;
					STOCK.yesterday.low = STOCK.today.low;
					STOCK.yesterday.high = STOCK.today.high;
					STOCK.yesterday.ask = STOCK.today.ask;
					STOCK.yesterday.volume = STOCK.today.volume;
					STOCK.yesterday.avgvolume = STOCK.today.avgvolume;
					STOCK.today.percent = temp[0];
					STOCK.today.open = temp[1];
					STOCK.today.low = temp[2];
					STOCK.today.high = temp[3];
					STOCK.today.ask = temp[4];
					STOCK.today.volume = temp[5];
					STOCK.today.avgvolume = temp[6];
					STOCK.lastUpdated = getDate();
				}
					//save the STOCK
				STOCK.save(function(err){
					if(err)
						throw err;
					console.log('updated ' + STOCK.ticker);
				})
				
				// send the info
					res.send(JSON.stringify({
						ticker: SYMBOL,
						percent: temp[0],
						open: temp[1],
						low: temp[2],
						high: temp[3],
						ask: temp[4],
						volume: temp[5],
						avgvolume: temp[6],
						name: temp[7],
					}));
			});
		};
		
		//check mongoDB
		StockHist.findOne({ticker:ticker},function(err, stock){
			//if found stock
			if(stock){
				//if lastUpdated = today's date
				//res send data from stock
				if(stock.lastUpdated === getDate()){
					res.send(JSON.stringify({
						ticker: stock.ticker,
						percent: stock.today.percent,
						open: stock.today.open,
						low: stock.today.low,
						high: stock.today.high,
						ask: stock.today.ask,
						volume: stock.today.volume,
						avgvolume: stock.today.avgvolume,
						name: stock.name,
					}));
				}
				else{
					searchByTicker(ticker, stock);
				}

			}
			else{
				searchByTicker(ticker, stock);
			}
		});
    });
	
    // =====================================
    // ADD STOCKS				========
    // =====================================
    app.post('/addstock', function(req, res) {
			if(req.user){
				var user = req.user;

						//add new stock to user's list
							user.stocks.push({ticker:req.body.ticker});

						//save
							user.save(function(err) {
								if (err)
									throw err;
								console.log("user has new stock");
							});
						//send info for angular to update the user's list and grey out add button.
							res.send(JSON.stringify({ticker:req.body.ticker}));

			}
			else {
				res.redirect("/login");
			}
    });	
	
};