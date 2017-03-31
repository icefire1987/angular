/**
 * Created by Chris on 11.11.16.
 */

angular.module('myApp').service('userService', function ($localStorage,$http,authService) {

        var vm = this;

        vm.token = $localStorage.token;


        vm.getUser = function(){
            return $http.get("/api/user/id/"+authService.getUser().obj.id);
        };

        vm.update = function(data){
            console.log("update")
            return $http.put("/api/user/"+authService.getUser().obj.id,{prename: data.prename,lastname: data.lastname,avatar_alt: data.avatar_alt});
        };

       return vm;
    });