// app/models/stock.js
// load the things we need
var mongoose = require('mongoose');

// define the schema for our user model
var stockHistorySchema = mongoose.Schema({
			name: String,
			ticker: String,
			lastUpdated : String,
			yesterday:{
				percent: String,
				open: String,
				low: String,
				high: String,
				ask: String,
				volume: String,
				avgvolume: String
			},
			today:{
				percent: String,
				open: String,
				low: String,
				high: String,
				ask: String,
				volume: String,
				avgvolume: String
			}
	
});

// methods ======================


// create the model for users and expose it to our app
module.exports = mongoose.model('StockHist', stockHistorySchema);
