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
    vm.process_search = function(obj,callback){
        if(obj && typeof obj.key !== 'undefined'){
            var config = {};
            if(obj.filter){
                config.params =  obj.filter;
            }
            return $http.get("/api/location/process/"+obj.key+"/"+obj.value,config).then(
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
            return $http.get("/api/location/process/").then(
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
            return $q.reject({
                userFeedback: "Funktion ohne Argument aufgerufen"
            });
        }
        if(!obj.name || obj.name.length<1){
            return $q.reject({
                userFeedback: "Stationsname fehlt",
                serverFeedback: {data:{error:{debug:JSON.stringify(obj)}}}
            });
        }
        var data_Stage = {
            name: obj.name

        };
        return $http.post("/api/location/stage",data_Stage).then(
            function(result){
                return result.data;

            },
            function(err){
                return $q.reject({
                    userFeedback: "Funktionsfehler",
                    serverFeedback: {data:{error:{debug:JSON.stringify(err)}}}
                });
            }
        );
    };
    vm.process_add = function(obj){
        console.log(obj);
        if(!obj){
            return $q.reject({
                userFeedback: "Funktion ohne Argument aufgerufen"
            });
        }
        if(!obj.description || obj.description.length<1){
            return $q.reject({
                userFeedback: "Prozessbeschreibung fehlt",
                serverFeedback: {data:{error:{debug:JSON.stringify(obj)}}}
            });
        }

        var data_Process = {
            description: obj.description,
        };

        return $http.post("/api/location/process/new",data_Process).then(
            function(result){
                return result.data;
            },
            function(err){
                return $q.reject({
                    userFeedback: "Funktionsfehler",
                    serverFeedback: {data:{error:{debug:JSON.stringify(err)}}}
                });
            }
        );
    };
    vm.process_update = function(obj){
        console.log(obj);
        if(!obj){
            return $q.reject({
                userFeedback: "Funktion ohne Argument aufgerufen"
            });
        }
        if(!obj.name || obj.name.length<1){
            return $q.reject({
                userFeedback: "Prozessbeschreibung fehlt",
                serverFeedback: {data:{error:{debug:JSON.stringify(obj)}}}
            });
        }
        if(!obj.id || obj.id<1){
            return $q.reject({
                userFeedback: "ID fehlt",
                serverFeedback: {data:{error:{debug:JSON.stringify(obj)}}}
            });
        }
        if(!obj.stages || obj.stages.length<1){
            return $q.reject({
                userFeedback: "Prozessstationen fehlen",
                serverFeedback: {data:{error:{debug:JSON.stringify(obj)}}}
            });
        }

        var data_Process = {
            id: obj.id,
            description: obj.description,
            stages: obj.stages
        };
        return $http.post("/api/location/process/id/"+obj.id,data_Process).then(
            function(result){
                return result.data;
            },
            function(err){
                return $q.reject({
                    userFeedback: "Funktionsfehler",
                    serverFeedback: {data:{error:{debug:JSON.stringify(err)}}}
                });
            }
        );
    };

    vm.stageset_add = function(obj){
        console.log(obj);
        if(!obj){
            return $q.reject({
                userFeedback: "Funktion ohne Argument aufgerufen"
            });
        }
        if(!obj.processID || !obj.stageset || obj.stageset.length<1){
            return $q.reject({
                userFeedback: "Informationen fehlen",
                serverFeedback: {data:{error:{debug:JSON.stringify(obj)}}}
            });
        }

        var data_stageSet = {
            stages: obj.stageset
        };

        return $http.post("/api/location/process/stageset/"+obj.processID,data_stageSet).then(
            function(result){
                return result.data;
            },
            function(err){
                return $q.reject({
                    userFeedback: "Funktionsfehler",
                    serverFeedback: {data:{error:{debug:JSON.stringify(err)}}}
                });
            }
        );
    };

    vm.update_stage_state = function(obj){
        if(!obj){
            return $q.reject({
                userFeedback: "Funktion ohne Argument aufgerufen"
            });
        }
        if(!obj.stageID || typeof obj.active === undefined){
            return $q.reject({
                userFeedback: "Funktion mit fehelnden Daten aufgerufen",
                serverFeedback: {data:{error:{debug:JSON.stringify(obj)}}}
            });
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
                return $q.reject({
                    userFeedback: "Funktionsfehler",
                    serverFeedback: {data:{error:{debug:JSON.stringify(err)}}}
                });
            }
        );
    };

    vm.update_process_state = function(obj){
        if(!obj){
            return $q.reject({
                userFeedback: "Funktion ohne Argument aufgerufen"
            });
        }
        if(!obj.processID || typeof obj.active === undefined){
            return $q.reject({
                userFeedback: "Funktion mit fehelnden Daten aufgerufen",
                serverFeedback: {data:{error:{debug:JSON.stringify(obj)}}}
            });
        }

        return $http.post("/api/location/process/active",{
                processid:  obj.processID,
                active:  obj.active
            }
        ).then(
            function(result){
                return result;
            },
            function(err){
                return $q.reject({
                    userFeedback: "Funktionsfehler",
                    serverFeedback: {data:{error:{debug:JSON.stringify(err)}}}
                });
            }
        );
    };

    return vm;
});