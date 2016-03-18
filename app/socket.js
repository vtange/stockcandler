
// app/socket.js
module.exports = function(io) {
	
	io.on('connection', function(socket){
	  console.log('a user connected');

	  //CLOSE OR REFRESH
	  socket.on('disconnect', function(){
		console.log('user disconnected');
	  });

	  //DEFINED INSIDE INDEX.HTML
	  socket.on('echo', function(msg){
		console.log('message: ' + msg);
		//io.emit('chat message', msg);
	  });

	});

};