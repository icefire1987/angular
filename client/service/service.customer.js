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
        if(obj && obj.customerID && obj.address_street && obj.address_city){
            data = {
                customerID: obj.customerID,
                street: obj.address_street,
                postal: obj.address_postal,
                city: obj.address_city,
                person: obj.address_person,
                comment: obj.address_comment,
                active: obj.address_active
            };
        }
        if(obj.id){
            data.id = obj.id;
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
    vm.retouraddress_state = function(obj){
        var data = {};
        if(obj && obj.addressID && typeof obj.active != "undefined"){
            data = {
                addressID: obj.addressID,
                active: obj.active
            };
        }

        return $http.post("/api/customer/retouraddress/state",data).then(
            function(result){
                return result.data;
            },
            function(err){
                console.log("err keyaccount_state");
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

    vm.getRetouraddress = function(options){
        var data = {};
        var config = {params:{}};
        if(options.customerID){
            data.key = "customerID";
            data.value = options.customerID;
        }
        if(options.filter){
            config.params.filter = options.filter;
        }
        return $http.get("/api/customer/retouraddress/"+data.key+"/"+data.value,config).then(
            function(result){
                return result.data;
            },
            function(err){
                console.log("err keyaccount_remove");
                return false;
            }
        );
    };

    vm.add = function(data){
        var formdata = new FormData();
        var data_to_insert = {};
        var filename = "";
        console.log(data)
        if(data.logoFile){
            filename = data.name.toLowerCase().replace(/\s/g,'') + '.png';
            formdata.append('file', data.logoFile, filename);
        }
        data_to_insert = {
            name: data.name,
            users: data.users,
            logo: filename
        }
        return $http.post("/api/customer",formdata,{
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined},
            params: data_to_insert
        });

    };
    vm.edit = function(data){
        var formdata = new FormData();
        var data_to_insert = {};
        var filename = "";
        if(data.logoFile){
            filename = data.name.toLowerCase().replace(/\s/g,'') + '.png';
            formdata.append('file', data.logoFile, filename);
        }
        data_to_insert = {
            id: data.id,
            name: data.name,
            logo: filename,
            logo_filename: data.logo
        }
        return $http.post("/api/customer/edit",formdata,{
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined},
            params: data_to_insert
        });

    };

    vm.update_state = function(obj){
        console.log(obj)
        if(!obj){
            return false;
        }
        if(!obj.customerID || typeof obj.active === undefined){
            return false;
        }

        return $http.post("/api/customer/active",{
                customerid:  obj.customerID,
                active:  obj.active
            }
        ).then(
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