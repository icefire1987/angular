/**
 * Created by Chris on 11.11.16.
 */
myApp.controller('toolCtrl', function(
    authService,componentService,cropperService,
    teamService,helperService,imageService,flickrService,
    $http,$scope,
    socketService,newsService,userService,logisticService,managementService,customerService,userService){
console.log("tool")

    var vm = this;
    vm.locals = {
        submit : {}
    };
    vm.submit = {};
    vm.sidebar = componentService.getComponent("menuLeft");
    vm.simpleAlert = componentService.getInstance("dialogAlert");


    vm.helpers = helperService;

    vm.user = authService.getUser().obj;
    vm.profile = userService;


    vm.news = newsService;



    vm.socket = socketService;
    vm.socket.connect();
    vm.socket.user = authService.getUser();

    vm.news.unread = vm.socket.client.unread;

    vm.team = teamService;
    vm.logistic = logisticService;
    vm.customer = customerService;
    vm.management = managementService;
    /* Local - Vars START */

    vm.locals.submit.teamsearch = function(){
        vm.team.search({key:"name",value:vm.team.input.teamname}).then(
            function(data){
                if(data){
                    for(var item in data.data){
                        data.data[item].name_short = vm.team.shortenName(data.data[item].name)
                    }
                    vm.team.searchResult = data.data;
                }
            },
            function(err){
                console.log(err)
            }
        );
    };




    /* Local - Vars END */
    vm.attachSocketEvents = function(){
        vm.socket.socketEventsAttachedTool = true;
        vm.socket.mySocket.on('message_receive', function(data){
            console.log(data)
            vm.news.unread[data.teamID] = true;
            vm.news.updateNews(data.teamID);

            var audio = new Audio('/client/media/audio/newmessage.ogg');
            audio.addEventListener('canplaythrough', function() {
                audio.play();
            });
        });
    };
    if (!vm.socket.socketEventsAttachedTool) {
        vm.attachSocketEvents();
    }


    vm.comparePassword = function(string1,string2,errorObj){
        if(string1!==string2){
            errorObj.$setValidity('notequal', false);
        }else{
            errorObj.$setValidity('notequal', true);
        }
    }

    vm.profileEditPassword = function(){
        console.log("edit pw")
        authService.changePassword(vm.input.password_old,vm.input.password_new2);

    };
    vm.profileEditData = function(){
        console.log("edit data")
        userService.update(vm.input);
    };

    vm.getProfile = function(){
        userService.getUser().then(
            function(result){
                vm.input = result.data.user[0];
            }
        );
    };
    vm.profileColorConvert = function(){
        helperService.color.hex =  vm.input.colorhex;
        helperService.color.hex_to_rgb().rgb_to_hsl();
        vm.input.avatar_alt = helperService.color.hue;
    };


    // ROUTES



    $scope.labels = ["January", "February", "March", "April", "May", "June", "July"];
    $scope.series = ['Series A', 'Series B'];
    $scope.data = [
        [65, 59, 80, 81, 56, 55, 40],
        [28, 48, 40, 19, 86, 27, 90]
    ];
    $scope.onClick = function (points, evt) {
        console.log(points, evt);
    };
    $scope.datasetOverride = [{ yAxisID: 'y-axis-1' }, { yAxisID: 'y-axis-2' }];
    $scope.options = {
        scales: {
            yAxes: [
                {
                    id: 'y-axis-1',
                    type: 'linear',
                    display: true,
                    position: 'left'
                },
                {
                    id: 'y-axis-2',
                    type: 'linear',
                    display: true,
                    position: 'right'
                }
            ]
        }
    };



});
   