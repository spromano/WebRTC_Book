var static = require('node-static');
var http = require('http');
// Create a node-static server instance
var file = new(static.Server)();

// We use the http module�s createServer function and
// rely on our instance of node-static to serve the files
var app = http.createServer(function (req, res) {
  file.serve(req, res);
}).listen(8181);

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
                log('S --> got message: ', message);
                // channel-only broadcast...
                socket.broadcast.to(message.channel).emit('message', message);
        });
        
        // Handle 'create or join' messages
        socket.on('create or join', function (room) {
                var numClients = findClientsSocket(room);

                log('S --> Room ' + room + ' has ' + numClients + ' client(s)');
                log('S --> Request to create or join room', room);

                // First client joining...
                if (numClients == 0){
                        socket.join(room);
                        socket.emit('created', room);
                } else if (numClients == 1) {
                // Second client joining...                	
                        io.sockets.in(room).emit('join', room);
                        socket.join(room);
                        socket.emit('joined', room);
                } else { // max two clients
                        socket.emit('full', room);
                }
        });
        
        function log(){
            var array = [">>> "];
            for (var i = 0; i < arguments.length; i++) {
            	array.push(arguments[i]);
            }
            socket.emit('log', array);
        }
});
