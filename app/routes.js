console.log("	APP/ROUTES.JS")

//for mongoDB interaction routes
var User = require('./models/user');

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
		function searchByTicker(SYMBOL){
			var url = "http://finance.yahoo.com/d/quotes.csv?s="+SYMBOL+"&f=p2omava2n"
			var deferred = Q.defer();
			request.get(url, function (error, result) {
				deferred.resolve(result.body);
			})
			deferred.promise.then(function (value) {

				var temp = value.split(",");

				// send the info
					res.send(JSON.stringify({
						ticker: SYMBOL,
						percent: temp[0],
						open: temp[1],
						range: temp[2],
						ask: temp[3],
						volume: temp[4],
						avgvolume: temp[5],
						name: temp[6],
					}));
			});
		};
		searchByTicker(ticker);
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