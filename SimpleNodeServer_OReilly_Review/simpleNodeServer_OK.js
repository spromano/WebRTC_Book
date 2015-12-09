var static = require('node-static');

var http = require('http');

// Create a node-static server instance listening on port 8181
var file = new(static.Server)();

// We use the http moduleÕs createServer function and
// use our instance of node-static to serve the files
var app = http.createServer(function (req, res) {
  file.serve(req, res);
}).listen(8181);

console.log('Listening on ' + app.address().port);

// Use socket.io JavaScript library for real-time web applications
var io = require('socket.io').listen(app);


// credits to http://stackoverflow.com/questions/6563885/socket-io-how-do-i-get-a-list-of-connected-sockets-clients/24145381#24145381
function findClientsSocket(roomId, namespace) {
    var res = [];
    var ns = io.of(namespace ||"/");    // the default namespace is "/"

    if (ns) {
        for (var id in ns.connected) {
            if(roomId) {
                var index = ns.connected[id].rooms.indexOf(roomId) ;
                if(index !== -1) {
                    res.push(ns.connected[id]);
                }
            } else {
                res.push(ns.connected[id]);
            }
        }
    }
    return res.length;
}

// Let's start managing connections...
io.sockets.on('connection', function (socket){

		// Handle 'message' messages
        socket.on('message', function (message) {
                log('S --> Got message: ', message);
                socket.broadcast.to(message.channel).emit('message', message.message);
        });

		// Handle 'create or join' messages
        socket.on('create or join', function (channel) {
                var numClients = findClientsSocket(channel);
                console.log('numclients = ' + numClients);

                // First client joining...
                if (numClients == 0){
                        socket.join(channel);
                        socket.emit('created', channel);
                // Second client joining...
                } else if (numClients == 1) {
                        // Inform initiator...
                		io.sockets.in(channel).emit('remotePeerJoining', channel);
                		// Let the new peer join channel
                        socket.join(channel);

                        socket.broadcast.to(channel).emit('broadcast: joined', 'S --> \
                        		broadcast(): client ' + socket.id + ' joined channel ' + channel);
                } else { // max two clients
                		console.log("Channel full!");
                        socket.emit('full', channel);
                }
        });

        // Handle 'response' messages
        socket.on('response', function (response) {
            log('S --> Got response: ', response);

            // Just forward message to the other peer
            socket.broadcast.to(response.channel).emit('response', response.message);
        });

        // Handle 'Bye' messages
        socket.on('Bye', function(channel){
        	// Notify other peer
        	socket.broadcast.to(channel).emit('Bye');

        	// Close socket from server's side
        	socket.disconnect();
        });

        // Handle 'Ack' messages
        socket.on('Ack', function () {
            console.log('Got an Ack!');
            // Close socket from server's side
        	socket.disconnect();
        });

		// Utility function used for remote logging
		function log(){
			var array = [">>> "];
			for (var i = 0; i < arguments.length; i++) {
				array.push(arguments[i]);
			}
			socket.emit('log', array);
		};
});
