/**
 * Created by Chris on 11.11.16.
 */
myApp.controller('mainCtrl', function($timeout,$scope,$log,authService,dateService,$localStorage,$http,logService,$rootScope,$interval, helperService){
    $rootScope.errors = {};
    var vm = this;
        vm.input = {};
        vm.feedback = [];
        vm.feedback = logService.getFeedback();
        vm.user = authService.getUser();
        vm.helpers = helperService;
        vm.clearError = function(type_string){
            $rootScope.errors[type_string] = "";
        }
/*
    vm.api = {
        output: '',
        call: function(route){
            if(typeof vm.auth.token != "undefined"){
                $http.put("/api/user/authentication/"+vm.auth.token)
                .success(function(data_token){
                    authService.authenticate(data_token.token);
                    $http.get("/api"+route)
                        .success(function(data){
                            vm.api.output = data;
                        })
                })
            }else{
                $http.get("/api"+route)
                    .success(function(res){
                        vm.api.output = res;
                    })
                    .error(function(err){
                        console.log("err:" + err)
                        logService.log({"userFeedback" : err.debug})
                    })
            }
        }
    };
    vm.server = {
        output: '',
        post: function(route,data){
                $http.post("/server"+route,data)
                    .success(function(res){
                        console.log(res)
                    })

        }
    };
    */

    vm.auth = {};
    vm.auth.login = function(){
        authService.login(vm.input);
    };
    
    vm.auth.signup = function(){
        if (vm.form_signup.$valid) {
            authService.signup(vm.input);
        }else{
            logService.log({userFeedback: "Eingabe ungültig"})
        }
    };

    vm.auth.forgotpassword = function(varname){
        vm.auth['var_'+varname] = true;
    };
    vm.auth.sendNewPassword = function(){
        var input_pass = vm.helpers.input_clean(vm.input.login_email,true);
        logService.log({userFeedback: "Versende Mail ...", msecondsToDisplay: 30000, classname: "info", timer: "sendMail"});
        authService.sendNewPassword(input_pass).then(
            function(response){
                console.log(response)
                logService.cancel();
                logService.log({userFeedback: "Mail versendet", classname: "success"});
                vm.auth.var_fp = false;
            },
            function(err){
                console.log(err)
                logService.log({userFeedback: "Fehler", debug: err})
            }
        );
    };

    vm.getSessionDuration = function(){
        if(vm.user && vm.user.obj && vm.user.obj.exp)
        return vm.user.obj.exp*1000;
    };
    vm.imagepath = 'media/';
    vm.setBackground = function(elementID,imagepath){
        angular.element( document.querySelector(elementID) ).css('background',"url(/server/"+imagepath+")");
    };
    $http.get(
        '/server/files/dir/',{
            params:{dirname:vm.imagepath+'backgrounds'}
        }

    ).success(function(data){

        var counter=0;
        $interval(function(){
            vm.setBackground('#public',vm.imagepath+'backgrounds/'+data.files[counter])
            counter++;
            if(counter>=data.files.length){
                counter=0;
            }
        }, 20000);
    }).error(function(err){
        console.log(err)
    });



    $scope.$watch(
        function(){
            return authService.token;
        },
        function(data){
            vm.auth.token = data
        },true
    );


});