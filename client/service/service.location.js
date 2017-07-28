/**
 * Created by Chris on 14.12.16.
 */
angular.module('myApp').service('locationService', function ($q, $http,$filter,componentService) {

    var vm = this;

    vm.input = {};



    vm.stage_search = function(obj,callback){
        if(obj && typeof obj.key !== 'undefined'){
            return $http.get("/api/location/stage/"+obj.key+"/"+obj.value).then(
                function(res){
                    console.log(res)
                    return res.data;
                },
                function(err){
                    console.log(err);
                    return false;
                }
            );
        }else{
            return $http.get("/api/location/stage/").then(
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

    vm.stage_add = function(obj){
        console.log(obj);
        if(!obj){
            return false;
        }
        if(!obj.name || obj.name.length<1){
            return false;
        }
        var data_Stage = {
            name: obj.name

        };
        return $http.post("/api/location/stage",data_Stage).then(
            function(result){
                return result.data;

            },
            function(err){
                console.log("err keyaccount_add");
                return false;
            }
        );
    };
    vm.update_stage_state = function(obj){

        if(!obj){
            return false;
        }
        if(!obj.customerID || typeof obj.active === undefined){
            return false;
        }

        return $http.post("/api/location/stage/active",{
                stageid:  obj.stageID,
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