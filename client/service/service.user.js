/**
 * Created by Chris on 11.11.16.
 */

angular.module('myApp').service('userService', function ($localStorage,$http,authService,$q) {

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
            if(obj && typeof obj.key !== 'undefined'){
                return $http.get("/api/user/"+obj.key+"/"+obj.value);
            }else{
                return $http.get("/api/user/");
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
            var deferred = $q.defer();
            if(!data.id){
                deferred.reject("");
                return deferred.promise;
            }
            var expected = [
                "prename","lastname","avatar_alt","email"
            ];
            var data_to_parse = {};

            for(var element in data){
                if(expected.indexOf(element)>-1){
                    data_to_parse[element] = data[element];
                }
            }
            console.log(data_to_parse);

            return $http.put("/api/user/id/"+data.id,data_to_parse);
        };

        vm.update_user_is = function(userID,f_name,f_value){
            console.log(userID)
            console.log(f_name)
            console.log(f_value)
            if(f_value == 0){
                return $http.delete("/api/user/user_is/",{params: {userID:userID,name:f_name}});
            }else if(f_value == 1){
                return $http.put("/api/user/user_is/",{userID:userID,name:f_name});
            }

        };
       return vm;
    });