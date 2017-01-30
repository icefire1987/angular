/**
 * Created by Chris on 11.11.16.
 */
myApp.controller('toolCtrl', function(authService,componentService,cropperService,teamService,helperService,imageService,flickrService,$http,$scope){
    console.log("tool")

    var vm = this;


    vm.locals = {
        submit : {}
    };
    vm.submit = {};
    vm.sidebar = componentService.getComponent("menuLeft");

    vm.helpers = helperService;

    vm.user = authService.getUser().obj;


    vm.team = teamService;


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


/*



    // DIALOGCTRL


    vm.team.edit_dialog_show = function(teamID,event){
        vm.dialog_edit.show({
            controller: function(teamdata,roles,users,user) {

                var dialogCtrl = this;
                dialogCtrl.team = angular.copy(teamdata.data[0]);
                dialogCtrl.roles = roles.data;
                dialogCtrl.users = users.data;
                dialogCtrl.user= user;
                dialogCtrl.flickr = flickrService;
                dialogCtrl.cropper = cropperService;
                dialogCtrl.input = angular.copy(teamdata.data[0]);

                dialogCtrl.input.avatar_exist = angular.copy(teamdata.data[0].avatar);
                dialogCtrl.changed = false;
                dialogCtrl.change = function(){
                    dialogCtrl.changed = true;
                };

                dialogCtrl.ctrl = componentService.dialog_tab.ctrl;
                dialogCtrl.toggler = helperService.toggler();
                dialogCtrl.uploader = new FileUploader();

                dialogCtrl.uploader.onAfterAddingFile = function(fileItem) {
                    dialogCtrl.cropper.start();
                    var reader = new FileReader();
                    reader.onload = function(event){
                        dialogCtrl.setCropSource(event.target.result,'local');

                    }
                    reader.readAsDataURL(fileItem._file);

                };

                dialogCtrl.submit = function(){
                    teamService.input = dialogCtrl.input;
                    if(dialogCtrl.input.avatar && (dialogCtrl.input.avatar != dialogCtrl.input.avatar_exist)){
                        var file = imageService.dataURLToFile(dialogCtrl.input.avatar);
                        dialogCtrl.input.avatarFile = file;
                    }
                    teamService.update().then(
                        function(res){
                            console.log("update done")
                            console.log(res)


                            vm.team.init();
                            dialogCtrl.ctrl.hide();


                        },
                        function(err){
                            console.log("err update")
                            console.log(err);
                            dialogCtrl.ctrl.log({text: err.data.debug});
                        }
                    )
                };
                dialogCtrl.userKick = function(objID,userID){
                    console.log("do kick")
                  teamService.input = {};
                  teamService.input.teamID = dialogCtrl.team.id;
                  teamService.input.userID = userID;
                    teamService.leave().then(
                        function(response){
                            dialogCtrl.users.splice(objID,1);
                        }
                    );
                };
                dialogCtrl.setCropSource = function(source,type){
                    dialogCtrl.cropper.start();
                    dialogCtrl.input.avatar = null;
                    dialogCtrl.input.avatarFile = null;
                    var myImage = document.getElementById('cropperImage');
                    myImage.onload = function(){
                        dialogCtrl.cropInit(myImage,type);
                    };
                    dialogCtrl.cropper.setSource(source);
                };
                dialogCtrl.cropInit = function(imageElement,type){
                    var obj = {};
                    obj.type = type;
                    obj.cropArea = 'cropper_teamavatar';
                    obj.image = imageElement;
                    obj.previewArea = '#cropperPreview_teamavatar';
                    dialogCtrl.cropper.cropper(obj);
                    obj.image.addEventListener('cropstart', function () {
                        dialogCtrl.input.avatar = null;
                    });
                };
                dialogCtrl.saveUserRole = function(teamID,userID,roleID){
                    teamService.userUpdate(teamID,userID,{roleID:roleID}).then(
                        function(data){
                            dialogCtrl.ctrl.log({text: 'Rolle gespeichert'});
                        },
                        function(err){
                            console.log("err join")
                            console.log(err);
                            dialogCtrl.ctrl.log({text: err.data.debug});
                        }
                    );
                }
            },
            controllerAs: 'dialogCtrl',
            templateUrl: '/client/view/template/tabDialog_teamEdit.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: event,
            clickOutsideToClose:false,
            fullscreen: true,
            locals: {
                teamdata : teamService.search({key:'id', value: teamID}),
                roles: teamService.getRoles(),
                users: teamService.getUsers({key:'teamID', value: teamID}),
                user: authService.getUser().obj
            },
            onComplete: function(){
                console.log("done");
            },
            onShowing: function(){
                console.log("show");
            }
        });
    };
    // Instant Call




*/



    vm.comparePassword = function(string1,string2,errorObj){
        if(string1!==string2){
            errorObj.$setValidity('notequal', false);
        }else{
            errorObj.$setValidity('notequal', true);
        }
    }

    vm.profileEdit = function(){
        console.log("edit")
        authService.changePassword(vm.input.password_old,vm.input.password_new2);

    };



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
   