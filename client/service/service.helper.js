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

    vm.input_clean = function(inputval,toLowerCase){
        var clean = "";
        var sandbox = inputval;
        if(toLowerCase != null){
            sandbox = sandbox.toLowerCase();
        }
        var clean = sandbox;
        return clean;

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

    vm.color = {
        hex: "",
        rgb: [],
        hue: "",
        hex_to_rgb : function(){
            if(!vm.color.hex) return;
            vm.color.rgb = [];
            vm.color.rgb.push(parseInt(vm.color.hex.substring(1,3), 16));
            vm.color.rgb.push(parseInt(vm.color.hex.substring(3,5), 16));
            vm.color.rgb.push(parseInt(vm.color.hex.substring(5,7), 16));
            console.log(vm.color.rgb)
            return this;
        },
        rgb_to_hsl : function(){
            var min = Math.min.apply(null,vm.color.rgb);
            var max = Math.max.apply(null,vm.color.rgb);
            console.log(min + ":" + max)
            //red
            if (max == vm.color.rgb[0]) {
                console.log("red")
                vm.color.hue = (vm.color.rgb[1] < vm.color.rgb[2] ? 6 : 0) + (vm.color.rgb[1] - vm.color.rgb[2]) / (max - min);
            //green
            } else if (max == vm.color.rgb[1]) {
                console.log("green")
                vm.color.hue = 2 + (vm.color.rgb[2] - vm.color.rgb[0]) / (max - min);
            //blue
            } else {
                console.log("blue")
                vm.color.hue = 4 + (vm.color.rgb[0] - vm.color.rgb[1]) / (max - min);
            }
            vm.color.hue = vm.color.hue * 60;
            if (vm.color.hue < 0) vm.color.hue = vm.color.hue + 360;
            Math.round(vm.color.hue);
            return this;
        }
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


    vm.time = {
        timestamp: 0,
        setTimestamp: function(value){
            if(value){
                vm.time.timestamp=value;
            }else{
                vm.time.timestamp= Date.now();
            }
            return vm.time.timestamp;
        }
    };

    return vm;
});