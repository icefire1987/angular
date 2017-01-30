/**
 * Created by Chris on 11.11.16.
 */
angular.module('myApp').service('helperService', function () {
    var vm = this;

    vm.randomInt = function(start,end){
        if(!end){
            end = 9;
        }
        if(!start){
            start = 1;
        }
        return Math.floor((Math.random()*(end-start+1))+start);
    };

    vm.toggler = function(){
        var toggler = this;
        return {
            init: function(value){
                if(!toggler.default){
                    toggler.default = value;
                }
                if(!toggler.saved){
                    toggler.saved = false;
                }
                if(!toggler.changed){
                    toggler.changed = false;
                }
            },
            change: function(data){
                toggler.changed = true;
                toggler.saved = false;
            },
            save: function(){
                toggler.saved = true;
            },
            reset: function(obj){
                obj = toggler.default;
                toggler.changed = false;
                toggler.saved = false;
            }
        }
    };

    vm.toggler = function(){
        var toggler = {};
        toggler.saveable = false;
        toggler.resetable = false;

        toggler.init = function(value){
            if(!toggler.default){
                toggler.default = value;
            }
        };
        toggler.change = function(data){
            if(toggler.default != data) {
                toggler.saveable = true;
                toggler.resetable = true;
            }else{
                toggler.saveable = false;
                toggler.resetable = false;
            }
            console.log(toggler)
        };
        toggler.save = function(value){
            toggler.saveable = false;
            toggler.resetable = false;
            console.log(toggler)
        };
        toggler.reset = function(obj,key){
            obj[key] = toggler.default;
            toggler.saveable = false;
            toggler.resetable = false;
            console.log(toggler)
        };

        return toggler;

    };

    vm.object_len = function(obj){
        if(obj){
            return Object.keys(obj).length
        }

    };
    vm.object_values = function(obj){
        var arr = [];
        var keys = Object.keys(obj);

        for (var i = 0; i < keys.length; i++) {
            arr.push(obj[keys[i]]);
        }

        return arr;
    };
    vm.selectedClearFalse = function(obj){
        for(var x in obj){
            if(obj[x] === false){
                delete (obj[x]);
            }
        }
    };

    return vm;
});