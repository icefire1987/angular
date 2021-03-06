/**
 * Created by Chris on 14.12.16.
 */
angular.module('myApp').service('managementService', function ($q, $http,$filter,customerService,userService,componentService,FileUploader,logService,cropperService,imageService,locationService,helperService,$state,$rootScope) {

    var vm = this;

    vm.input = {
        keyaccount: [],
        newCustomer: {}
    }
    vm.input_reset = function(){
        vm.input = {
            keyaccount:[],
            newCustomer: {}
        };
    };
    vm.dialog = {};
    vm.locals = {
        submit:{},
        switch_functions: {
            keyaccount: false
        }
    };

    vm.customer = {};
    vm.filter = {
        customer: {active: 1},
        retouraddress: {active: 1}
    };

    var initDataTable = {
        model: [],
        page: 1
    };

    vm.tables = {
        users: {
            model: [],
            page: 1,
            orderBy: 'username'
        },
        customers: {
            model: [],
            page: 1,
            orderBy: 'name'
        },
        stage: {
            model: [],
            page: 1,
            orderBy: 'name'
        },
        process: {
            model: [],
            page: 1,
            orderBy: 'name'
        },
    };


    vm.getCustomer = function(customerID){
        customerService.search({key:"id", value: customerID}).then(
            function(data){
                console.log(data);
                if(data.length==1){
                    vm.customer = data[0];
                    customerService.getRetouraddress({"customerID":customerID, filter: {active:1}}).then(
                        function(data){

                            vm.customer.retouraddress = data;
                        }
                    );
                }
            }
        );
    };

    vm.getUser = function(userID){
        userService.search({key:"id", value:userID}).then(
            function(res){
                if(res.data.user.length==1){
                    vm.user = res.data.user[0];
                }
            }
        );
    };
    vm.getStage = function(stageID){
        locationService.stage_search({key:"id", value:stageID}).then(
            function(res){
                console.log(res)
                if(res.stage.length==1){
                    vm.stage = res.stage[0];
                }
            }
        );
    };
    vm.getProcess = function(processID){
        locationService.process_search({key:"id", value:processID}).then(
            function(res){
                console.log(res)
                if(res.length==1){
                    vm.process = res[0];
                    vm.input.process = res[0];
                }
            }
        );
    };


    vm.retouraddress_switch_view = function(active){
        var filter = {};
        if(typeof active!="undefined"){
            vm.filter.retouraddress.active= active
        }else{
            vm.filter.retouraddress.active= +!vm.filter.retouraddress.active
        }
        if(vm.filter.retouraddress.active){
            filter = {active:vm.filter.retouraddress.active};
        }
        customerService.getRetouraddress({"customerID":vm.customer.id, filter: filter}).then(
            function(data){
                console.log(data);
                vm.customer.retouraddress = data;
            }
        );
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
                vm.input_reset();
            }
        );
    };

    vm.locals.submit.retouraddress_state = function(addressObj){
        if(addressObj.id) {
            customerService.retouraddress_state({
                active: addressObj.active,
                addressID: addressObj.id
            }).then(
                function (response) {
                    vm.retouraddress_switch_view()
                    console.log(response);
                }
            );
        }
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
                address_comment: vm.input.retouraddress.comment,
                address_active: vm.input.retouraddress.active
            };
        }
        if(vm.input.retouraddress.id){
            data.id = vm.input.retouraddress.id;
        }else{
            // default: activated
            vm.input.retouraddress.active = 1;
            data.address_active = 1;
        }
        customerService.retouraddress_add(data).then(
            function(response){
                if(!vm.customer.retouraddress || vm.customer.retouraddress.length<1) {
                    vm.customer.retouraddress = [];
                }
                vm.retouraddress_switch_view(vm.input.retouraddress.active);
                vm.input.retouraddress.id = response.addressID;
                vm.customer.retouraddress.push(vm.input.retouraddress);

                vm.input_reset();
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
    vm.locals.submit.stage_search = function(){
        var obj = {};
        if(vm.input.stage && vm.input.stage.name){
            obj = {key:"name",value:vm.input.stage.name};
        }
        locationService.stage_search(obj).then(
            function(data){
                vm.searchResult = {stage: data};
            }
        )
    };
    vm.locals.submit.stage_add = function() {
        locationService.stage_search({key:"name",value:vm.input.stage.name}).then(
            function(data){
                if(data.length==0){
                    locationService.stage_add(vm.input.stage).then(
                        function(){
                            vm.input_reset();
                        }
                    );
                }else{
                    vm.dialog.dublicate =  componentService.getInstance("dialogConfirm");
                    vm.dialog.dublicate.config = {
                        title:  'Station mit ähnlichem Namen vorhanden',
                        textContent:  data.map(function(customer){
                            return customer.name;
                        }).join(", "),
                        ok: 'Station trotzdem anlegen',
                        cancel: 'abbrechen',
                        ariaLabel: 'Station erstellen'
                    };
                    vm.dialog.dublicate.callback.ok = function () {
                        locationService.stage_add(vm.input.stage).then(
                            function(){
                                vm.input_reset();
                            }
                        );
                    };
                    vm.dialog.dublicate.show();
                }
                vm.locals.show_newStage=false;
            }
        );
    };
    vm.locals.submit.stage_state= function(active){
        if(vm.stage.id) {
            locationService.update_stage_state({
                stageID:  vm.stage.id,
                active: active
            }).then(
                function (response) {
                    console.log(response)
                    //$state.reload();
                },
                function(err){
                    console.log("res err")
                    logService.log(err);
                }
            );
        }
    };
    vm.locals.submit.process_state= function(active){
        if(vm.process.id) {
            locationService.update_process_state({
                processID:  vm.process.id,
                active: active
            }).then(
                function (response) {
                    console.log(response)
                    //$state.reload();
                },
                function(err){
                    console.log("res err")
                    logService.log(err);
                }
            );
        }
    };

    vm.locals.submit.view_addStage = function(model) {
        if(model){
            if(!model){
                model=[];
            }
            var stage = JSON.parse(vm.input.process.stage);
            stage.final = helperService.valueIfUndefined(vm.input.process.final,0);
            var dublicate = model.findIndex(x => x.id == stage.id);

            if(dublicate>=0){

                    model.splice(dublicate,1);


            }

            model.push(stage);




        }else{
            if(!vm.input.process){
                vm.input.process={
                    stageset:[]
                }
            }
            if(!vm.input.process.stageset){
                vm.input.process.stageset=[];
            }
            var stage = JSON.parse(vm.input.process.stage);
            stage.final = helperService.valueIfUndefined(vm.input.process.final,0);
            vm.input.process.stageset.push(stage);
        }

    };
    vm.locals.submit.process_search = function(processID) {
        var obj = {};
        if(typeof processID != "undefined"){
            obj = {key:"id",value:processID};
        }else if(vm.input.process && vm.input.process.name){
            obj = {key:"name",value:vm.input.process.name};
        }

        locationService.process_search(obj).then(
            function(data){
                vm.searchResult = {process: data};
            }
        )
    };
    vm.locals.submit.process_add = function() {
        var sorted_string = "";
        var sorted_array = angular.copy(vm.input.process.stageset);
        helperService.sortByProperty(sorted_array, 'id');
        sorted_string = sorted_array.map(function(elem){
            return elem.id;
            }
        ).join(",");
        locationService.process_search({key:"join_id",value:sorted_string}).then(
            function(data){
                if(data.length==0){
                    locationService.process_add(vm.input.process).then(
                        function(data){
                            console.log(data)
                            vm.input.process.processID = data.id;
                            locationService.stageset_add(vm.input.process).then(
                                function(){
                                    vm.input_reset();
                                }
                            );
                        }
                    );
                }else{
                    vm.dialog.dublicate =  componentService.getInstance("dialogConfirm");
                    vm.dialog.dublicate.config = {
                        title:  'Prozess mit gleichen Stationen vorhanden',
                        textContent:  data.map(function(stage){
                            return stage.name;
                        }).join(", "),
                        ok: 'Prozess trotzdem anlegen',
                        cancel: 'abbrechen',
                        ariaLabel: 'Prozess erstellen'
                    };
                    vm.dialog.dublicate.callback.ok = function () {
                        locationService.process_add(vm.input.process).then(
                            function(data){
                                console.log(data)
                                vm.input.process.processID = data.id;
                                locationService.stageset_add(vm.input.process).then(
                                    function(){
                                        vm.input_reset();
                                    }
                                );
                            }
                        );
                    };
                    vm.dialog.dublicate.show();
                }
                vm.locals.show_newProcess=false;
            }
        );

    };
    vm.locals.submit.process_edit = function() {
        var sorted_string = "";
        var sorted_array = angular.copy(vm.input.process.stages);

        helperService.sortByProperty(sorted_array, 'id');
        sorted_string = sorted_array.map(function(elem){
                return elem.id;
            }
        ).join(",");

        locationService.process_search({key:"join_id",value:sorted_string,filter:{id:vm.input.process.id}}).then(
            function(data){
                if(data.length==0){
                    locationService.process_update(vm.input.process).then(
                        function(data){
                            vm.input_reset();
                            $state.go("protected.verwaltung.process.start");

                        }
                    );
                }else{
                    vm.dialog.dublicate =  componentService.getInstance("dialogConfirm");
                    vm.dialog.dublicate.config = {
                        title:  'Prozess mit gleichen Stationen vorhanden',
                        textContent:  data.map(function(stage){
                            return "["+ stage.id + "] "+stage.description+" (" + stage.name + ") ";
                        }).join(", "),
                        ok: 'Prozess trotzdem ändern',
                        cancel: 'abbrechen',
                        ariaLabel: 'Prozess ändern'
                    };
                    vm.dialog.dublicate.callback.ok = function () {
                        locationService.process_update(vm.input.process).then(
                            function(data){
                                vm.input_reset();
                                $state.go("protected.verwaltung.process.start");
                            }
                        );
                    };
                    vm.dialog.dublicate.show();
                }
                vm.locals.show_newProcess=false;
            }
        );

    };

    vm.locals.submit.customer_add = function() {
        if (vm.input.newCustomer.logo_data) {
            var file = imageService.dataURLToFile(vm.input.newCustomer.logo_data);
            vm.input.newCustomer.logoFile = file;
        }
        customerService.search({key:"name",value:vm.input.newCustomer.name}).then(
            function(data){
                vm.input.newCustomer.users = vm.input.keyaccount;
                if(data.length==0){
                    customerService.add(vm.input.newCustomer).then(
                        function(){
                            vm.input_reset();
                        }
                    );
                }else{
                    vm.dialog.dublicate =  componentService.getInstance("dialogConfirm");
                    vm.dialog.dublicate.config = {
                        title:  'Kunde mit ähnlichem Namen vorhanden',
                        textContent:  data.map(function(customer){
                            return customer.name;
                        }).join(", "),
                        ok: 'Kunden trotzdem anlegen',
                        cancel: 'abbrechen',
                        ariaLabel: 'Kunden erstellen'
                    };
                    vm.dialog.dublicate.callback.ok = function () {
                        customerService.add(vm.input.newCustomer).then(
                            function(){
                                vm.input_reset();
                            }
                        );
                    };
                    vm.dialog.dublicate.show();
                }
            }
        );

    };
    vm.locals.submit.customer_edit = function() {
        if (vm.customer.logo_data) {
            var file = imageService.dataURLToFile(vm.customer.logo_data);
            vm.customer.logoFile = file;
        }else{

        }
        customerService.edit(vm.customer).then(
            function(){

                $state.go("protected.verwaltung.customers.start");
            }
        );

    };
    vm.locals.submit.user_edit = function() {
        console.log("user_edit")
        userService.update(vm.user).then(
            function(){
                vm.locals.submit.usersearch();
                $state.go("protected.verwaltung.users.start");
            }
        );

    };

    vm.locals.submit.customersearch = function(){
        var obj = {};
        if(vm.input.customername){
            obj = {key:"name",value:vm.input.customername};
        }
        customerService.search(obj).then(
            function(data){
                vm.searchResult = data;
            }
        )
    };
    vm.locals.submit.customer_state= function(active){
        if(vm.customer.id) {
            customerService.update_state({
                customerID:  vm.customer.id,
                active: active
            }).then(
                function (response) {
                    console.log(response)
                    $state.reload();
                }
            );
        }
    };
    vm.locals.submit.user_state= function(active){
        if(vm.user.id) {
            // TO DO !!
            /*
            customerService.update_state({
                customerID:  vm.customer.id,
                active: active
            }).then(
                function (response) {
                    console.log(response)
                    $state.reload();
                }
            );
            */
        }
    };

    vm.locals.submit.usersearch = function(){
        var obj = {};
        if(vm.input.username){
           obj = {key:"name",value:vm.input.username};
        }
        userService.search(obj).then(
            function(data){
                if(data){
                    console.log(data)
                    vm.searchResult = data.data;

                }
            },
            function(err){
                console.log(err)
            }
        );
    };
    vm.locals.submit.user_is_keyaccount = function(f_value){
        vm.locals.switch_functions.keyaccount = true;
        userService.update_user_is(vm.user.id,"keyaccount",f_value).then(
            function(data){
                vm.locals.switch_functions.keyaccount = false;
            }
        );
    };

    vm.locals.edit = function(address){
        vm.input.retouraddress = angular.copy(address);
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
        customerService.getRetouraddress({customerID:customerID}).then(
            function(data){
                console.log(data);
                vm.customer.retouraddress = data;
            }
        );
    };

    vm.search_keyaccountusers = function(query){
        console.log(query)
        return query ? vm.locals.keyaccountusers.filter( componentService.createFilterLowercase(query) ) : vm.locals.keyaccountusers;
    };


    return vm;
});