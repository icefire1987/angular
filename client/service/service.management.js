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
                    customerService.getRetouraddress({"customerID":customerID}).then(
                        function(data){
                            console.log(data);
                            vm.customer.retouraddress = data;
                        }
                    );
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
                var found = false;
                if(!vm.customer.users || vm.customer.users.length<1) {
                    vm.customer.users = [];
                }
                found = vm.customer.users.some(function (el) {
                    return el.id === vm.input.keyaccount[0].id;
                });
                if (!found) {
                    vm.customer.users.push(vm.input.keyaccount[0]);
                }
                vm.input = {keyaccount: []};
            }
        );
    };
    vm.locals.submit.retouraddress_add = function(){
        var data = {};
        if(vm.customer.id && vm.input.retouraddress && vm.input.retouraddress.street && vm.input.retouraddress.postal && vm.input.retouraddress.city ) {
            data = {
                customerID: vm.customer.id,
                address_street: vm.input.retouraddress.street,
                address_postal: vm.input.retouraddress.postal,
                address_city: vm.input.retouraddress.city,
                address_person: vm.input.retouraddress.person,
                address_comment: vm.input.retouraddress.comment
            };
        }
        customerService.retouraddress_add(data).then(
            function(response){

                if(!vm.customer.retouraddress || vm.customer.retouraddress.length<1) {
                    vm.customer.retouraddress = [];
                }
                vm.input.retouraddress.id = response.addressID;
                vm.customer.retouraddress.push(vm.input.retouraddress);

                vm.input = {keyaccount: []};
            }
        );
    };
    vm.locals.submit.retouraddress_delete = function(addressObj){
        if(addressObj.id) {
            customerService.retouraddress_delete({
                customerID:  vm.customer.id,
                addressID: addressObj.id
            }).then(
                function (response) {
                    console.log(response)
                    vm.customer.retouraddress.splice(vm.customer.retouraddress.indexOf(addressObj),1);
                }
            );
        }
    };
    vm.locals.edit = function(address){
        vm.input.retouraddress = address;

        location.href = "#management_customer_form";
    };


    vm.getKeyaccountusers = function(){
        userService.getKeyaccount().then(
            function(data){
                vm.locals.keyaccountusers = data;
            }
        );
    };
    vm.getRetouraddress = function(customerID){
        customerService.getRetouraddress({"customerID":customerID}).then(
            function(data){
                console.log(data);
                vm.customer.retouraddress = data;
            }
        );
    };

    vm.search_keyaccountusers = function(query){
        return query ? vm.locals.keyaccountusers.filter( componentService.createFilterLowercase(query) ) : vm.locals.keyaccountusers;
    };

    return vm;
});