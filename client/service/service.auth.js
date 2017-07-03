/**
 * Created by Chris on 11.11.16.
 */
angular.module('myApp').service('authService',
    ['$http','$q','$rootScope','$state','$timeout','$localStorage','logService',
        function ($http,$q,$rootScope,$state,$timeout,$localStorage,logService) {

            var vm = this;

            vm.token = undefined;
            vm.user = {};
            vm.user.obj = {};
            vm.authenticated = false;


            vm.randomString = function(size){
                var str = "";
                var possible = "abcdefghjkmnpqrstuvwxyzABCDEGHJKMNPQRSTUVWXYZ123456789!?=-_@$%&";
                for(var i=0; i<size;i++){
                    str += possible.charAt(Math.floor(Math.random() * possible.length));
                }
                return str;
            };
            vm.isIdentityResolved = function(){
                return (vm.token != undefined);
            };
            vm.getToken = function(){
                if(vm.isIdentityResolved()!=false){
                    return  vm.token;
                }else{
                    return "";
                }
            };
            vm.getIdentityFromToken = function(token, callback){
                if(token==null){
                    return false;
                }
                if(vm.isIdentityResolved){
                    $http.get('/api/user/token/'+vm.token)
                        .success(function(data){
                            callback(data);
                        })
                        .error(function(data){
                            callback(data);
                        })
                }else{
                    return null;
                }

            };
            
            
            vm.isAuthenticated = function() {
                return vm.authenticated;
            };
            vm.isInRole = function(role) {
                if (!vm.authenticated || !vm.user.obj.roles) return false;

                return vm.user.obj.roles.indexOf(role) != -1;
            };
            vm.isInAnyRole = function(roles) {
                if (!vm.authenticated || !vm.user.obj.roles) return false;

                for (var i = 0; i < roles.length; i++) {
                    if (this.isInRole(roles[i])) return true;
                }

                return false;
            };
            vm.isInTeam = function(team) {
                if (!vm.authenticated || !vm.user.obj.teams) return false;

                return vm.user.obj.teams.indexOf(team) != -1;
            };
            vm.isInAnyTeam = function(teams) {
                if (!vm.authenticated || !vm.user.obj.teams) return false;

                for (var i = 0; i < teams.length; i++) {
                    if (this.isInTeam(teams[i])) return true;
                }

                return false;
            };

            vm.getIdentity = function(force) {
                //console.log("getIdent")
                var deferred = $q.defer();
                if (force === true){
                    vm.token = undefined;
                }

                var token = null;
                if (angular.isDefined(vm.token) && vm.token != null) {
                    //console.log("token defined" + token)
                    token = vm.token;
                }else if($localStorage.token) {
                    //console.log("token local")
                    token = $localStorage.token;
                }else {
                    deferred.resolve(null);
                }
                if(token != null){
                    //console.log("gotToken" + token)
                    $http.get('/api/user/authentication/'+token, { ignoreErrors: true })
                        .success(function(data) {
                            $http.get('/api/user/token/'+token)
                                .success(function(data) {
                                    data.user.token = token;
                                    vm.authenticate(data.user);
                                    deferred.resolve(vm.token);
                                    return deferred.promise;
                                })
                                .error(function (err) {
                                    console.log(err);
                                    vm.authenticate(null);
                                    deferred.resolve(null);
                                });
                        })
                        .error(function (err) {
                            console.log(err)
                            vm.authenticate(null);
                            deferred.resolve(null);
                        });
                }


                return deferred.promise;
            };

            vm.authorize = function() {
                return vm.getIdentity()
                    .then(function(data) {
                        var defer = $q.defer();
                        var isAuthenticated = vm.isAuthenticated();
/*if (
 $state.current &&
 $state.current.data &&
 $state.current.data.roles &&
 $state.current.data.roles.length > 0 &&
 !vm.isInAnyRole($state.current.data.roles)
 ) */
                        if (
                            $state.current &&
                            $state.current.data &&
                            $state.current.data.teams &&
                            $state.current.data.teams.length > 0 &&
                            !vm.isInAnyTeam($state.current.data.teams)
                        ) {
                            if (isAuthenticated) {
                                defer.reject(403);
                            } else {
                                $rootScope.returnToState
                                    = $rootScope.toState;
                                $rootScope.returnToStateParams
                                    = $rootScope.toParams;
                                defer.reject(401);
                            }
                        }else{
                            defer.resolve(200);
                        }
                        return defer.promise;
                    });
            };



            vm.authenticate = function(user) {
                if(user==null){
                    vm.token = null;
                    vm.user.obj = null;
                    vm.authenticated = false;
                    $localStorage.token = null;
                    $http.defaults.headers.common.Authorization = '';
                }else if(user.token == null){
                    var token = user;
                    vm.token = token;
                    vm.authenticated = token != null;
                    $localStorage.token = token;
                    $http.defaults.headers.common.Authorization = 'Bearer ' + token;
                }else{
                    vm.user.obj = user;
                    vm.token = user.token;
                    vm.authenticated = user.token != null;
                    $localStorage.token = user.token;
                    $http.defaults.headers.common.Authorization = 'Bearer ' + user.token;
                }
            };

            vm.login = function(formData){
                var data= {username: formData.login_username,password: formData.login_password};

                $http.post('/api/user/signin', data)
                    .then(
                        function(res){
                            if(res.data.user && res.data.user.token && res.status==200){

                                vm.authenticate(res.data.user);
                                if ($rootScope.returnToState) $state.go($rootScope.returnToState.name, $rootScope.returnToStateParams);
                                else $state.go('protected.main');
                            }
                            if(res.data.error){
                                $rootScope.errors.login = res.data.error;
                            }
                        },
                        function(err){
                            console.log(err)
                        }
                    );
            };

            vm.signup = function(formData){

                if(
                    angular.isUndefined(formData.signup_email) || formData.signup_email === "" ||
                    angular.isUndefined(formData.signup_username) || formData.signup_username === "" ||
                    angular.isUndefined(formData.signup_password) || formData.signup_password === ""
                ){
                    $rootScope.errors.signup = {error: "fehlende Eingaben"};
                    return false;
                }
                var data= {
                    email: formData.signup_email,
                    username: formData.signup_username,
                    password: formData.signup_password
                };
                $http.post('/api/user/signup', data)
                    .then(
                        function(res){
                            $state.go('public.login');
                        },
                        function(err){
                            console.log(err)
                        }
                    );
            };

            vm.logout = function(){
                vm.authenticate(null);
                $state.go('public.main');
            };

            vm.userSetPassword = function(userObj,password){
                var defer=$q.defer();
                $http.put("/api/user/"+userObj.id, {password: password}).then(
                    function(res){
                        console.log("password is set");
                        var mail = {
                            body:{
                                mailHeader:{
                                    to:userObj.email,subject:'Allo'
                                },
                                mailBody:{
                                    title:'Neues Passwort',content:password
                                }
                            },
                            templateurl:{directory:'simple'}
                        };
                        $http.post("/server/mail/send",mail).then(
                            function(response) {
                                console.log("ok")
                                console.log(response);
                                defer.resolve(response);
                            },
                            function(err){
                                console.log(err)
                                defer.reject(err);
                            }
                        );
                    },
                    function(err){
                        console.log(err);
                        defer.reject(err);
                    }
                );
                return defer.promise;
            };

            vm.changePassword = function(password_old,password_new){
                $http.get("/api/user/passwordication",{params: {userID:vm.user.obj.id,password: password_old}}).then(
                    function(res){
                        if(res.data.error){
                            console.log(res.data)
                            $rootScope.errors.passwordchange = {password: "Passwort nicht korrekt"};
                        }else{
                            return vm.sendCustomPassword(password_new);
                        }

                    },
                    function(err){
                        return err;
                    }
                );

            }
            vm.sendCustomPassword = function(new_password){

                if(typeof vm.user.obj.email=="undefined" || vm.user.obj.email=="" ){
                    return false;
                }
                return vm.userSetPassword(vm.user.obj,new_password).then(
                    function(data){

                        return data
                    },
                    function(err){
                        return err;
                    }
                );
            };

            vm.sendNewPassword = function(mailadress){
                var defer=$q.defer();
                if(typeof mailadress=="undefined" || mailadress==""){
                    defer.reject(400);
                    return defer.promise;
                }
                vm.getUserWithoutAuth(mailadress)
                    .success(function(res){
                        if(res.user.email == mailadress){
                            var new_password = vm.randomString(8);

                            vm.userSetPassword(res.user,new_password).then(
                                function(data){
                                    defer.resolve(200);
                                },
                                function(err){
                                    defer.reject(400);
                                }
                            );
                        }else{
                            console.log("no match");
                            defer.reject(null)
                        }
                    })
                    .error(function(err){
                        defer.reject(err);
                    });
                return defer.promise;
            };
            
            vm.getUserWithoutAuth = function(mailadress){
                return $http.get("/api/user/email/"+mailadress);
            };
            vm.getUser = function(){
                return vm.user;
            };
            vm.checkUnique = function(data){
                var deferred = $q.defer();
                console.log(data)
                switch(data.key){
                    case "mail":
                        $http.get("/api/user/email/"+data.value).then(
                            function(result){

                                if(result.data.user.length>0){
                                    deferred.resolve({unique: 0});
                                }else{
                                    deferred.resolve({unique: 1});
                                }
                            }
                        );
                        break;
                    case "username":
                        $http.get("/api/user/username/"+data.value).then(
                            function(result){

                                if(result.data.user.length>0){
                                    deferred.resolve({unique: 0});
                                }else{
                                    deferred.resolve({unique: 1});
                                }
                            },
                            function(err){
                                console.log(err);
                            }
                        );
                        break;
                }
                return deferred.promise;
            };

           return vm;
        }]);