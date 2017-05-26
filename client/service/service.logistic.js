/**
 * Created by Chris on 14.12.16.
 */
angular.module('myApp').service('logisticService', function ($q, $http,$filter,componentService,userService) {

    var vm = this;

    vm.getCustomer = function(){
        return $http.get("/api/customer");
    };
    vm.getOrders = function(filter){
        console.log(filter);
       $http.get("/api/order/latest/10").then(
           function(response){
                vm.latestOrders = response.data;
           }
       )
    };


    vm.dialog = {};
    vm.dialog.create =  componentService.getInstance("dialogTab");
    vm.dialog.create.config = {
        controller: function (input,callback) {
            var dialogCtrl = this;
            dialogCtrl.callback = callback;
            dialogCtrl.input = {users:[]};

            dialogCtrl.customers = [];
            dialogCtrl.users = [];
            dialogCtrl.searchtext = "";
            dialogCtrl.row_max=3;
            dialogCtrl.formRowGenerate = {
                show: false
            };
            dialogCtrl.formconfig = {
                show: true,
                cols : []
            };
            dialogCtrl.form_cols = [
                "san","scancode","gender","wg","process","stockkey","comment_logistic","comment_production"
            ];
            dialogCtrl.rows=[];
            dialogCtrl.rows_exlude=[];
            getCustomer();
            getUsers();

            dialogCtrl.customers_search = function(query){
                return query ? dialogCtrl.customers.filter( componentService.createFilterLowercase(query) ) : dialogCtrl.customers;
            };
            dialogCtrl.users_search = function(query){
                return query ? dialogCtrl.users.filter( componentService.createFilterLowercase(query) ) : dialogCtrl.users;
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
            };
            dialogCtrl.fileread = function(input){
                console.log(input)
            };

            dialogCtrl.csv_articlesToForm = function(csvcontent){
                dialogCtrl.filecontent = csvcontent;
                console.log(dialogCtrl.filecontent)
                dialogCtrl.formconfig.show = true


            };

            dialogCtrl.filecontentToRows = function(){
                dialogCtrl.formconfig.show = false;
                if(dialogCtrl.filecontent && dialogCtrl.filecontent.length){
                    for(var x=0;x<dialogCtrl.filecontent.length;x++){
                       if(dialogCtrl.rows_exlude.indexOf(x)==-1){
                           var row = {};
                           for(var item in dialogCtrl.input.cols){
                               if (dialogCtrl.input.cols.hasOwnProperty(item)) {
                                   // item = 1
                                   // arr[item] = san

                                   // row["san"] = ABC_123
                                   row[dialogCtrl.input.cols[item]] = dialogCtrl.filecontent[x][item];
                               }
                           }
                           dialogCtrl.rows.push(row);
                       }
                    }
                }
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
                        var c=0;
                        var mostwanted = [];
                        var normalwanted = [];
                        result.data.sort(function(a,b){
                            return b.orders_count-a.orders_count
                        });
                        for(key in result.data){
                            if(result.data[key].orders_count>0 || c>5){
                                mostwanted.push(result.data[key]);
                            }else{
                                normalwanted.push(result.data[key]);
                            }
                            c++;
                        }
                        mostwanted.sort();
                        normalwanted.sort();
                        dialogCtrl.customers = mostwanted.concat([{id:0,name:""}]).concat(normalwanted);
                    },
                    function(err){
                        console.log(err);
                    }
                )
            }
            function getUsers() {
                userService.getKeyaccount().then(
                    function(data){
                        dialogCtrl.users = data;
                    }
                );
            }


        },
        controllerAs: 'dialogCtrl',
        templateUrl: '/client/view/dialog/tabDialog_orderCreate.tmpl.html',
        parent: angular.element(document.body),
        targetEvent: null,
        clickOutsideToClose: false,
        fullscreen: true,
        locals: {
            input: vm.input,
            callback: vm.dialog.create.callback

        }
    };
    vm.dialog.create.callback.ok = function (input) {
        var data = {};
            data.customerID = input.customer.id;
            data.userKeyAccID = input.users.map(function(d) { return d["id"]; });
            data.description = input.description;


        $http.post("/api/order",data).then(
            function(result){
                console.log(result);
                if(result.data && result.data.id>0){
                    for(var key in data.userKeyAccID){
                        var data_keyAcc = {
                            orderID: result.data.id,
                            userID: data.userKeyAccID[key]
                        };
                        $http.post("/api/order/keyaccount",data_keyAcc).then(
                            function(result){
                                console.log(result);

                            },
                            function(err){
                                console.log("err newOrder")
                                console.log(err);
                                vm.dialog.create.controller.log({text: err.data.debug});
                            }
                        );
                    }
                }
            },
            function(err){
                console.log("err newOrder")
                console.log(err);
                vm.dialog.create.controller.log({text: err.data.debug});
            }
        );
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