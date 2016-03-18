
// app/socket.js
module.exports = function(io) {
	
	io.on('connection', function(socket){
	  console.log('a user connected');

	  //CLOSE OR REFRESH
	  socket.on('disconnect', function(){
		console.log('user disconnected');
	  });

	  //DEFINED INSIDE INDEX.HTML
	  socket.on('stock', function(msg){
		console.log('message: ' + msg);
		io.emit('stock', msg);
	  });

	});

};