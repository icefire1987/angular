/**
 * Created by Chris on 14.12.16.
 */
angular.module('myApp').service('logisticService', function ($q, $http,$filter,componentService) {

    var vm = this;
    console.log("LOGISTIK");

    vm.getCustomer = function(){
        return $http.get("/api/customer");
    };

    vm.dialog = {};
    vm.dialog.create =  componentService.getInstance("dialogTab");
    vm.dialog.create.config = {
        controller: function (input,callback) {
            var dialogCtrl = this;
            dialogCtrl.callback = callback;
            dialogCtrl.input = input;
            dialogCtrl.customers = [];
            dialogCtrl.users = [];
            dialogCtrl.searchtext = "";

            getCustomer();
            getUsers();

            dialogCtrl.customers_search = function(query){
                return query ? dialogCtrl.customers.filter( createFilterFor(query) ) : dialogCtrl.customers;
            };
            dialogCtrl.users_search = function(query){
                return query ? dialogCtrl.users.filter( createFilterFor(query) ) : dialogCtrl.users;
            };

            dialogCtrl.newCustomer = {
                users: [],
                submit: function(){
                    if(!dialogCtrl.newCustomer.name) {
                        vm.dialog.create.controller.log({text: "Kundenname angeben!"});
                    }else{
                        dialogCtrl.addCustomer();
                    }
                }
            };
            dialogCtrl.addCustomer = function(){
                $http.post("/api/customer",dialogCtrl.newCustomer).then(
                    function(result){
                        var temp = dialogCtrl.newCustomer.user;
                        dialogCtrl.customers.push(result.data.customer);
                        dialogCtrl.newCustomer = {
                            show: false,
                            user: temp
                        }
                    }
                );
            }


            function createFilterFor(query) {
                var lowercaseQuery = angular.lowercase(query);
                return function filterFn(customer) {
                    return (customer.name.toLowerCase().indexOf(lowercaseQuery) !== -1);
                };

            }
            function getCustomer(){
                vm.getCustomer().then(
                    function(result){
                        dialogCtrl.customers = result.data;
                    },
                    function(err){
                        console.log(err);
                    }
                )
            }
            function getUsers() {
                $http.get("/api/users/is/keyaccount").then(
                    function (result) {
                        dialogCtrl.users = result.data;
                    },
                    function (err) {
                        console.log(err);
                    }
                )
            }
        },
        controllerAs: 'dialogCtrl',
        templateUrl: '/client/view/dialog/tabDialog_orderCreate.tmpl.html',
        parent: angular.element(document.body),
        targetEvent: null,
        clickOutsideToClose: false,
        locals: {
            input: vm.input,
            callback: vm.dialog.create.callback

        }
    };


    vm.dialog.create.callback.ok = function () {
        console.log("close")
        /*vm.create().then(
            function(res){

                    vm.dialog.create.callback.hide();

            },
            function(err){
                console.log("err create")
                console.log(err);
                vm.dialog.create.controller.log({text: err.data.debug});
            }
        )*/
    };


    return vm;
});