/**
 * Created by Chris on 11.11.16.
 */
angular.module('myApp').service('dateService', function () {
    var vm = this;

    vm.getDate = function(option){
        return new Date(option);
    };

    return vm;
});