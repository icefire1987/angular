/**
 * Created by Chris on 11.11.16.
 */

angular.module('myApp').service('userService', function ($localStorage,$http,authService) {

        var vm = this;

        vm.token = $localStorage.token;


        vm.getUser = function(){
            return $http.get("/api/user/id/"+authService.getUser().obj.id);
        };

        vm.getKeyaccount = function(){
            return $http.get("/api/users/is/keyaccount").then(
                function (result) {
                    return  result.data;
                },
                function (err) {
                    console.log(err);
                }
            )
        };
        vm.search = function(obj){
            console.log("search User")
            console.log(obj)
            if(obj){
                return $http.get("/api/user/"+obj.key+"/"+obj.value);
            }else{
                return $http.get("/api/user/all");
            }

        };
        /*vm.getAll = function(filter){
            if(filter){
                return $http.get("/api/user/"+filter.name, filter.value);
            }else{
                return $http.get("/api/user/all");
            }

        };*/

        vm.update = function(data){
            console.log("update")
            return $http.put("/api/user/"+authService.getUser().obj.id,{prename: data.prename,lastname: data.lastname,avatar_alt: data.avatar_alt});
        };

       return vm;
    });