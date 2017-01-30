/**
 * Created by Chris on 11.11.16.
 */
angular.module('myApp').service('userService',
    ['$localStorage',
        function ($localStorage) {

            var vm = this;

            vm.token = $localStorage.token;
            vm.user = {};

            vm.getUser = function(){


                return vm.user;
            };

           return vm;
        }]);