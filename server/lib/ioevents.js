/**
 * Created by cjurthe on 16.03.2017.
 */
module.exports = function(io){
    io.userSocket = {};
    io.socketdata = {users: {}, socket_to_user: {} };
    io.on('connection', function (socket) {

        console.log('connect '+socket.id);

        var clients = io.sockets.clients('');

        //io.socket.disconnect('unauthorized');

        // Handshake Start
        socket.emit('server_connected', {});

        socket.on('client_connected', function(data){
            console.log("client_connected " + data.username + " Socket:"+socket.id);
            io.socketdata.users[data.id] = data.username;
            for (var k in  io.socketdata.socket_to_user) {
                if (! io.socketdata.socket_to_user.hasOwnProperty(k)) continue;
                if ( io.socketdata.socket_to_user[k] === data.id) {
                    delete io.socketdata.socket_to_user[k];
                }
            }
            io.userSocket[data.id] = socket;
            io.socketdata.socket_to_user[socket.id] = data.id;
            io.sockets.emit('userlist', io.socketdata.users);
        });
        // Handshake End

        socket.on('disconnect', function () {
            delete io.socketdata.users[io.socketdata.socket_to_user[socket.id]];
            io.sockets.emit('userlist', io.socketdata.users);
        });
    });
};

/*
 // sending to sender-client only
 socket.emit('message', "this is a test");

 // sending to all clients, include sender
 io.emit('message', "this is a test");

 // sending to all clients except sender
 socket.broadcast.emit('message', "this is a test");

 // sending to all clients in 'game' room(channel) except sender
 socket.broadcast.to('game').emit('message', 'nice game');

 // sending to all clients in 'game' room(channel), include sender
 io.in('game').emit('message', 'cool game');

 // sending to sender client, only if they are in 'game' room(channel)
 socket.to('game').emit('message', 'enjoy the game');

 // sending to all clients in namespace 'myNamespace', include sender
 io.of('myNamespace').emit('message', 'gg');

 // sending to individual socketid
 socket.broadcast.to(socketid).emit('message', 'for your eyes only');
 */




