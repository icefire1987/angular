/**
 * Created by Chris on 14.12.16.
 */
angular.module('myApp').service('teamService', function ($http,authService,componentService,flickrService,cropperService,helperService,imageService,FileUploader) {

    var vm = this;

    vm.input = {
        join_teamIDs: [],
        myTeams_selected_teamIDs: []
    };
    vm.myTeams = {};

    vm.getRoles = function(){
        return $http.get("/api/team/roles");
    };
    vm.getUsers = function(obj){
        if(obj){
            return $http.get("/api/team/users/"+obj.key+"/"+obj.value);
        }
    };
    vm.search = function(obj){
        console.log("search Team")
        console.log(obj)
        if(obj){
            return $http.get("/api/team/"+obj.key+"/"+obj.value);
        }
        return $http.get("/api/team/"+vm.input.teamname);
    };

    vm.cropInit = function(imageElement,type){
        var obj = {};
        obj.type = type;
        obj.cropArea = 'cropper_teamavatar';
        obj.image = imageElement;
        obj.previewArea = '#cropperPreview_teamavatar';


        dialogCtrl.cropper.cropper(obj);

        obj.image.addEventListener('cropstart', function () {
            dialogCtrl.input.avatar = null;
        });

    }

    vm.dialog = {};
    vm.dialog.create =  componentService.getInstance("dialogTab");
    vm.dialog.create.config = {
        controller: function (roles,input,callback) {
            var dialogCtrl = this;
            dialogCtrl.callback = callback;
            dialogCtrl.roles = roles.data;
            dialogCtrl.flickr = flickrService;
            dialogCtrl.cropper = cropperService;
            dialogCtrl.input = input;
            dialogCtrl.input.roleID = 10;
            dialogCtrl.input.avatar_alt = helperService.randomInt(1, 255);
            dialogCtrl.input.avatar = null;
            dialogCtrl.input.avatarFile = null;
            dialogCtrl.input.dojoin = true;

            dialogCtrl.uploader = {};

            dialogCtrl.uploader.localAvatar = new FileUploader();
            dialogCtrl.uploader.localAvatar.filters.push({
                name: 'imageFilter',
                fn: function(item /*{File|FileLikeObject}*/, options) {
                         var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
                         return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
                    }
             });
            dialogCtrl.setCropSource = function(source,type){
                dialogCtrl.input.avatar = null;
                dialogCtrl.input.avatarFile = null;
                var myImage = document.getElementById('cropperImage');
                myImage.onload = function(){
                    dialogCtrl.cropInit(myImage,source,type);
                };
                dialogCtrl.cropper.setSource(source);
            };
            dialogCtrl.cropInit = function(imageElement,source,type){
                var obj = {};
                obj.type = type;
                obj.cropArea = 'cropper_teamavatar';
                obj.image = imageElement;
                obj.previewArea = '#cropperPreview_teamavatar';
                dialogCtrl.cropper.setSource(source);
                dialogCtrl.cropper.cropper(obj);
                obj.image.addEventListener('cropstart', function () {
                    dialogCtrl.input.avatar = null;
                });
            }
        },
        controllerAs: 'dialogCtrl',
        templateUrl: '/client/view/dialog/tabDialog_teamCreate.tmpl.html',
        parent: angular.element(document.body),
        targetEvent: null,
        clickOutsideToClose: false,
        locals: {
            roles: vm.getRoles(),
            input: vm.input,
            callback: vm.dialog.create.callback
        }
    };

    vm.dialog.create.callback.ok = function () {
        if(vm.input.avatar){
            var file = imageService.dataURLToFile(vm.input.avatar);
            vm.input.avatarFile = file;
        }
        vm.create().then(
            function(res){
                if(vm.input.dojoin){
                    vm.input.teamIDArr = [res.data.data.id];
                    vm.join().then(
                        function(data){
                            vm.init();
                            vm.dialog.create.callback.hide();
                        },
                        function(err){
                            console.log("err join")
                            console.log(err);
                            vm.dialog.create.controller.log({text: err.data.debug});
                        }
                    );
                }else{
                    vm.init();
                    vm.dialog.create.callback.hide();
                }
            },
            function(err){
                console.log("err create")
                console.log(err);
                vm.dialog.create.controller.log({text: err.data.debug});
            }
        )
    };

    vm.dialog.edit =  componentService.getInstance("dialogTab");
    vm.dialog.edit.config = {
        controller: function (roles,user) {

            var dialogCtrl = this;
            dialogCtrl.callback = vm.dialog.edit.callback;

            dialogCtrl.roles = roles.data;
            dialogCtrl.flickr = flickrService;
            dialogCtrl.cropper = cropperService;
            dialogCtrl.toggler = helperService.toggler();
            dialogCtrl.changed = false;
            dialogCtrl.change = function(){
                dialogCtrl.changed = true;
            };
            dialogCtrl.input = {};
            dialogCtrl.input.roleID = 10;
            dialogCtrl.input.avatar_alt = helperService.randomInt(1, 255);
            dialogCtrl.input.avatar = null;
            dialogCtrl.input.avatarFile = null;
            dialogCtrl.input.dojoin = true;

            vm.search({key:'id', value: vm.dialog.edit.locals.view.teamID}).then(
                function(res){
                    dialogCtrl.team = res.data[0];

                    dialogCtrl.input = angular.copy(res.data[0]);
                    dialogCtrl.input.avatar_exist = angular.copy(res.data[0].avatar);
                }
            );
            vm.getUsers({key:'teamID', value: vm.dialog.edit.locals.view.teamID}).then(
                function(res){
                    dialogCtrl.users = res.data;

                }
            );

            dialogCtrl.uploader = {};

            dialogCtrl.uploader.localAvatar = new FileUploader();
            dialogCtrl.uploader.localAvatar.filters.push({
                name: 'imageFilter',
                fn: function(item /*{File|FileLikeObject}*/, options) {
                    var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
                    return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
                }
            });
            dialogCtrl.setCropSource = function(source,type){
                dialogCtrl.input.avatar = null;
                dialogCtrl.input.avatarFile = null;
                var myImage = document.getElementById('cropperImage');
                myImage.onload = function(){
                    dialogCtrl.cropInit(myImage,source,type);
                };
                dialogCtrl.cropper.setSource(source);
            };
            dialogCtrl.cropInit = function(imageElement,source,type){
                var obj = {};
                obj.type = type;
                obj.cropArea = 'cropper_teamavatar';
                obj.image = imageElement;
                obj.previewArea = '#cropperPreview_teamavatar';
                dialogCtrl.cropper.setSource(source);
                dialogCtrl.cropper.cropper(obj);
                obj.image.addEventListener('cropstart', function () {
                    dialogCtrl.input.avatar = null;
                });
            };
            dialogCtrl.userKick = function(objID,userID){
                console.log("do kick")
                vm.setInput({});
                vm.input.teamID = dialogCtrl.team.id;
                vm.input.userID = userID;
                vm.leave().then(
                    function(response){
                        dialogCtrl.users.splice(objID,1);
                    }
                );
            };
            dialogCtrl.saveUserRole = function(teamID,userID,roleID){
                vm.userUpdate(teamID,userID,{roleID:roleID}).then(
                    function(data){
                        vm.dialog.edit.controller.log({text: 'Rolle gespeichert'});
                    },
                    function(err){
                        console.log("err join")
                        console.log(err);
                        vm.dialog.edit.controller.log({text: err.data.debug});
                    }
                );
            };

        },
        controllerAs: 'dialogCtrl',
        templateUrl: '/client/view/dialog/tabDialog_teamEdit.tmpl.html',
        parent: angular.element(document.body),
        targetEvent: null,
        clickOutsideToClose:false,
        fullscreen: true,
        locals: {
            roles: vm.getRoles(),
            user: authService.getUser().obj
        }
    };

    vm.dialog.edit.callback.ok = function (data) {
        vm.setInput(data);
        console.log(vm.dialog.edit.locals.view.teamID)

        if(vm.input.avatar && (vm.input.avatar != vm.input.avatar_exist)){
            var file = imageService.dataURLToFile(vm.input.avatar);
            vm.input.avatarFile = file;
        }
        vm.update().then(
            function(res){
                console.log("update done")
                console.log(res)
                vm.init();



            },
            function(err){
                console.log("err update")
                console.log(err);
            }
        )
    };

    vm.dialog.join =  componentService.getInstance("dialogConfirm");
    vm.dialog.join.config = {
        title:  'Team beitreten?',
        textContent:  '',
        ok: 'beitreten',
        cancel: 'abbrechen',
        ariaLabel: 'Team beitreten'
    };
    vm.dialog.join.callback.ok = function () {
        console.log("custom ok")
        vm.input.teamIDArr = Object.keys(vm.input.join_teamIDs);
        vm.input.roleID = 1;
        vm.join().then(
            function (response) {
                vm.init();
            }
        );
    };

    vm.dialog.delete =  componentService.getInstance("dialogConfirm");
    vm.dialog.delete.config = {
        title: 'Team löschen?' ,
        textContent: 'Alle Mitglieder werden aus dem Team entfernt. Die Aktion kann nicht rückgängig gemacht werden.',
        ok: 'Löschen bestätigen',
        cancel: 'abbrechen',
        ariaLabel: 'Team entfernen'
    };
    vm.dialog.delete.callback.ok = function () {
        vm.input.teamIDArr = Object.keys(vm.input.myTeams_selected_teamIDs);
        vm.delete().then(
            function(response){
                vm.init();
            }
        );
    };

    vm.dialog.leave = componentService.getInstance("dialogConfirm");
    vm.dialog.leave.config = {
        title: 'Team verlassen?',
        textContent: 'Du erhälst keine Mitteilungen mehr über Aktivitäten im Team.',
        ok: 'Austritt bestätigen',
        cancel: 'abbrechen',
        ariaLabel: 'Team verlassen'
    };

    vm.dialog.leave.callback.ok = function () {
        console.log(vm.dialog.leave)
        vm.setInput({});
        vm.input.teamID = vm.dialog.leave.locals.view.teamID;
        vm.input.userID = authService.getUser().obj.id;
        vm.leave().then(
            function(response){
                vm.init();
            }
        );
    };

    vm.dialog.post =  componentService.getInstance("dialogTab");
    vm.dialog.post.config = {
        controller: function (roles,callback) {
            var dialogCtrl = this;
            dialogCtrl.callback = callback;
            dialogCtrl.roles = roles.data;
            dialogCtrl.input = {};

            dialogCtrl.change = function(){
                dialogCtrl.changed = true;
            };

            vm.search({key:'id', value: vm.dialog.post.locals.view.teamID}).then(
                function(res){
                    dialogCtrl.team = res.data[0];
                    dialogCtrl.input = angular.copy(res.data[0]);

                }
            );
            vm.getUsers({key:'teamID', value: vm.dialog.post.locals.view.teamID}).then(
                function(res){
                    dialogCtrl.users = res.data;
                }
            );
        },
        controllerAs: 'dialogCtrl',
        templateUrl: '/client/view/dialog/tabDialog_teamPost.tmpl.html',
        parent: angular.element(document.body),
        targetEvent: null,
        clickOutsideToClose: false,
        locals: {
            roles: vm.getRoles(),
            input: vm.input,
            callback: vm.dialog.post.callback
        }
    };

    vm.dialog.post.callback.ok = function (data) {
        vm.setInput(data);
        vm.post().then(
            function(res){

            },
            function(err){
                console.log("err post")
                console.log(err);
                vm.dialog.create.controller.log({text: err.data.debug});
            }
        )
    };
    vm.init = function(){
        vm.myTeams = {};

        vm.search({key:"user",value:authService.getUser().obj.id}).then(
            function(data){
                if(data){
                    for(var item in data.data){
                        data.data[item].name_short = vm.shortenName(data.data[item].name)
                    }
                    vm.myTeams =  data.data;
                }
            },
            function(err){
                //console.log(err)
            }
        );
    };

    vm.setInput = function(data){
        vm.input = data;
    };
    vm.initInput = function(){
        vm.input = {
            join_teamIDs: [],
            myTeams_selected_teamIDs: []
        };
    };



    vm.getRights = function(){
        return $http.get("/api/team/roles");
    };

    vm.shortenName = function (teamname) {
        var upper = teamname.replace(/([a-z])|(\s)/g, '');
        if(teamname.length < 4){
            return teamname;
        }else if(upper.length>1){
            return upper.substr(0,3);
        }else{
            return teamname.substr(0,2)
        }
    };
    vm.create = function(){
        var formdata = new FormData();
        var filename = null;
        if(vm.input.avatarFile){
            filename = 'avatar_'+vm.input.teamname + '.png'
            formdata.append('file', vm.input.avatarFile, filename);

        }

        return $http.post("/api/team",formdata, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined},
            params: {
                teamname: vm.input.teamname,
                description: vm.input.description,
                openJoin: vm.input.openJoin,
                avatar_alt: vm.input.avatar_alt,
                avatar: filename
            }
        });

    };
    vm.update = function(){
        var formdata = new FormData();
        var filename = null;
        if(vm.input.avatarFile){
            filename = 'avatar_'+vm.input.name + '.png'
            formdata.append('file', vm.input.avatarFile, filename);

        }else{
            filename = vm.input.avatar_exist;
        }


        return $http.put("/api/team",formdata, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined},
            params: {
                id: vm.input.id,
                teamname: vm.input.name,
                description: vm.input.description,
                openJoin: vm.input.openJoin,
                userCreate: vm.input.userCreate,
                avatar_alt: vm.input.avatar_alt,
                avatar: filename
            }
        });
    };
    vm.join = function(){
        console.log(vm.input)
        return $http.put("/api/team/user",{
            ids: vm.input.teamIDArr,
            roleID: vm.input.roleID
        });
    };
    vm.delete = function(){
        return $http.delete("/api/team/",{
            params: {
                ids: vm.input.teamIDArr
            }
        });
    };

    vm.post = function(){
        console.log("post")
        console.log(vm.input)
        return $http.put("/api/team/"+vm.input.id+"/post/", {
            params: {
                title: vm.input.title,
                message: vm.input.message,
                userID: vm.input.userID
            }
        });
    };


    vm.leave = function(){
        return $http.delete("/api/team/"+vm.input.teamID+"/user/"+vm.input.userID);
    };
    vm.userUpdate = function(teamID,userID,data){
        console.log("update")
        return $http.put("/api/team/"+teamID+"/user/"+userID,{roleID: data.roleID});
    };

    vm.userDelete = function(teamID,userID){
        return $http.delete("/api/team/",{
            params: {
                ids: vm.input.teamIDArr
            }
        });
    };



    return vm;
});