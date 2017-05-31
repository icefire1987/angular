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
        vm.getRetourAddress = function(customerID){
            return $http.get("/api/customer/retouraddress/customerID/"+customerID);
        };

       return vm;
    });