console.log("	APP/ROUTES.JS")

var Q = require('q');
var request = require('request');

// app/routes.js
module.exports = function(app) {

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function(req, res) {
        res.render('index.ejs', {
            user : req.user // get the user out of session and pass to template
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
			w1: Day’s Value Change
			w4: Day’s Value Change (Realtime)
			m: Day’s Range
			m2: Day’s Range (Realtime)
		*/
		var url = "http://finance.yahoo.com/d/quotes.csv?s="+req.body.ticker+"&f=nab"
		var deferred = Q.defer();
		request.get(url, function (error, result) {
			deferred.resolve(result.body);
		})
		deferred.promise.then(function (value) {
			console.log(value);
		});
		

    });
};