console.log("	APP/ROUTES.JS")

//for mongoDB interaction routes
var User = require('./models/user');
var Stock = require('./models/stock');

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
		var url = "http://finance.yahoo.com/d/quotes.csv?s="+req.body.ticker+"&f=np2omava2"
		var deferred = Q.defer();
		request.get(url, function (error, result) {
			deferred.resolve(result.body);
		})
		deferred.promise.then(function (value) {
			var temp = value.split(",");
			//check and add a new ticker to MongoDB if no ticker yet.
				//add the ticker to user's ticker list
			
			res.send(JSON.stringify({
				name: temp[0],
				ticker: req.body.ticker.toUpperCase(),
				percent: temp[1],
				open: temp[2],
				range: temp[3],
				ask: temp[4],
				volume: temp[5],
				avgvolume: temp[6]
			}));
		});
    });
	
    // =====================================
    // ADD STOCKS				========
    // =====================================
    app.post('/addstock', function(req, res) {
			if(req.user){
				var user = req.user;
				Stock.findOne({id:req.body.ticker}, function(err, stock){
					if(!stock){
						//create a new stock if no stock yet
							var newStock            = new Stock();
							newStock.ticker = req.body.ticker;

						//add new stock _id to user's list
							user.stocks.push(newStock);

						//save
							user.save(function(err) {
								if (err)
									throw err;
								console.log("user has new stock");
							});					
						//save
							newStock.save(function(err) {
								if (err)
									throw err;
								console.log("saved new stock");
							});
						//send a id for angular to update the user's list and grey out add button.
							res.send(JSON.stringify({_id:newStock._id}));
					}
					else{
						//add the user to that bar
						user.stocks.push(stock);

						//save
							user.save(function(err) {
								if (err)
									throw err;
								console.log("user has new stock");
							});	

						res.send(JSON.stringify({_id:stock._id}));
					}
				});
			}
			else {
				res.redirect("/login");
			}
    });	
	
};