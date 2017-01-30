/**
 * Created by Chris on 11.11.16.
 */
angular.module('myApp').service('inputService', function () {
    var vm = this;

    vm.cleanInput = function(inputval,toLowerCase){
        var clean = "";
        var sandbox = inputval;
        if(toLowerCase != null){
            sandbox = sandbox.toLowerCase();
        }
        var clean = sandbox;
        return clean;

    };

    return vm;
});