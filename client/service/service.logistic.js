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
            dialogCtrl.searchtext = "";

            getCustomer();

            dialogCtrl.customers_search = function(query){
                console.log(dialogCtrl.customers)
                return query ? dialogCtrl.customers.filter( createFilterFor(query) ) : dialogCtrl.customers;
            };

            /*

            erste Zeile => neuen Kunden anlegen


             */
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
        vm.create().then(
            function(res){

                    vm.dialog.create.callback.hide();

            },
            function(err){
                console.log("err create")
                console.log(err);
                vm.dialog.create.controller.log({text: err.data.debug});
            }
        )
    };


    return vm;
});