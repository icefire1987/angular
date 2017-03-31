/**
 * Created by Chris on 11.11.16.
 */
angular.module('myApp').service('socketService', function (socketFactory) {

    var vm = this;
    vm.user = {};
    vm.client = {unread:[]};
    vm.connect = function(){
        console.log("try connect")
        if (!vm.client.socketEventsAttached){
            vm.myIO = io.connect(__env.myURL);
            vm.mySocket = socketFactory({
                ioSocket: vm.myIO
            });


            vm.attachSocketEvents();
        }
    };


    vm.attachSocketEvents = function(){
        vm.client.socketEventsAttached = true;
        // Handshake
            vm.mySocket.on('server_connected', function(data){
                console.log("server_connected");
                vm.mySocket.emit('client_connected', {id: vm.user.obj.id,username: vm.user.obj.username});
            });

            vm.mySocket.on('userlist', function(data){
                console.log("userlist");
                vm.users_connected = data;
            });

        /*vm.mySocket.on('message_receive', function(data){
            console.log(data)
            vm.client.unread[data.teamID] = true;
            var audio = new Audio('/client/media/audio/newmessage.ogg');
            // var audio = new Audio('/client/media/audio/badumtss.mp3');
            audio.addEventListener('canplaythrough', function() {
                audio.play();
            });
        });*/
    };

    return vm;
});