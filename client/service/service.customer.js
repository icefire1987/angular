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

    vm.retouraddress_add = function(obj){
        var data = {};
        console.log(obj);
        if(obj && obj.customerID && obj.address_street && obj.address_city){
            data = {
                customerID: obj.customerID,
                street: obj.address_street,
                postal: obj.address_postal,
                city: obj.address_city,
                person: obj.address_person
            };
        }

        return $http.post("/api/customer/retouraddress",data).then(
            function(result){
                 return result.data;
            },
            function(err){
                console.log("err keyaccount_add");
                return false;
            }
        );
    };

    vm.retouraddress_delete = function(obj){
        if(!obj){
            return false;
        }
        if(!obj.customerID || !obj.addressID ){
            return false;
        }
        return $http.delete("/api/customer/retouraddress/",{
            params: {
                customerid:  obj.customerID,
                addressid: obj.addressID
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

    vm.getRetouraddress = function(filter){
        var data = {};
        if(filter.customerID){
            data.key = "customerID";
            data.value = filter.customerID;
        }
        return $http.get("/api/customer/retouraddress/"+data.key+"/"+data.value).then(
            function(result){
                return result.data;
            },
            function(err){
                console.log("err keyaccount_remove");
                return false;
            }
        );
    };



    return vm;
});