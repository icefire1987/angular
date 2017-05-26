/**
 * Created by Chris on 14.12.16.
 */
angular.module('myApp').service('customerService', function ($q, $http,$filter,componentService) {

    var vm = this;

    vm.input = {};



    vm.search = function(obj,callback){
        if(obj){
            return $http.get("/api/customer/"+obj.key+"/"+obj.value).then(
                    function(res){
                        return res.data;
                    },
                    function(err){
                        console.log(err);
                        return false;
                    }
            );
        }
    };

    vm.keyaccount_add = function(obj){
        console.log(obj);
        if(!obj){
            return false;
        }
        if(!obj.customerID || !obj.userIDs || obj.userIDs.length<1){
            return false;
        }
        var data_keyAcc = {
            customerID: obj.customerID,
            userIDs: obj.userIDs
        };
        return $http.post("/api/customer/keyaccount",data_keyAcc).then(
            function(result){
                return result.data;

            },
            function(err){
                console.log("err keyaccount_add");
                return false;
            }
        );
    };
    vm.keyaccount_delete = function(obj){
        if(!obj){
            return false;
        }
        if(!obj.customerID || !obj.userID ){
            return false;
        }
        return $http.delete("/api/customer/keyaccount/",{
            params: {
                customerid:  obj.customerID,
                userid: obj.userID
            }
        }).then(
            function(result){
                return result;
            },
            function(err){
                console.log("err keyaccount_remove");
                return false;
            }
        );
    };




    return vm;
});