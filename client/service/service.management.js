/**
 * Created by Chris on 14.12.16.
 */
angular.module('myApp').service('managementService', function ($q, $http,$filter,customerService,userService,componentService) {

    var vm = this;

    vm.input = {keyaccount:[]};
    vm.locals = {submit:{}};
    vm.customer = {};

    vm.getCustomer = function(customerID){

        customerService.search({key:"id", value: customerID}).then(
            function(data){
                if(data.length==1){
                    vm.customer = data[0];
                }
            }
        );
    };

    vm.customer_edit = function(){
// FULLPAGE?
    };


    vm.locals.submit.keyaccount_delete = function(userObj){
        if(userObj.id) {
            customerService.keyaccount_delete({
                customerID:  vm.customer.id,
                userID: userObj.id
            }).then(
                function (response) {
                    console.log(response)
                    vm.customer.users.splice(vm.customer.users.indexOf(userObj),1);
                }
            );
        }
    };

    vm.locals.submit.keyaccount_add = function(){
        customerService.keyaccount_add({
            customerID: vm.customer.id,
            userIDs: vm.input.keyaccount.map(function(a){return a.id})
        }).then(
            function(response){
                //WAS WENN SCHON VORHANDEN?
                vm.customer.users.push(vm.input.keyaccount[0]);
            }
        );
    }

    vm.getKeyaccountusers = function(){
        userService.getKeyaccount().then(
            function(data){
                vm.locals.keyaccountusers = data;
            }
        );
    };

    vm.search_keyaccountusers = function(query){
        return query ? vm.locals.keyaccountusers.filter( componentService.createFilterLowercase(query) ) : vm.locals.keyaccountusers;
    };

    return vm;
});