/**
 * Created by Chris on 11.11.16.
 */

angular.module('myApp').service('dbDataCollectorService', function ($localStorage,$http,authService) {

        var vm = this;

        vm.getGender = function(){
            return $http.get("/api/data/articlegender/");
        };
        vm.getWG = function(){
            return $http.get("/api/data/articlewg/");
        };
        vm.getStages = function(){
            return $http.get("/api/data/stage/");
        };

        vm.getCommentTyp = function(){
            return $http.get("/api/data/commenttype/");
        };
        vm.getRetourAddress = function(data){
            if(data.customerID){
                return $http.get("/api/customer/retouraddress/filter/"+JSON.stringify(data));
            }else{
                return false;
            }

        };

       return vm;
    });