/**
 * Created by Chris on 14.12.16.
 */
angular.module('myApp').service('managementService', function ($q, $http,$filter,customerService,userService,componentService,FileUploader,logService,cropperService,imageService,$state) {

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
    vm.locals = {submit:{}};

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
        }
    };
    /*
    vm.uploader = {}
    vm.uploader.customerLogo = new FileUploader();
    vm.uploader.customerLogo.filters.push({
        name: 'imageFilter',
        fn: function(item /*{File|FileLikeObject}*//*, options) {
            var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
            return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
        }
    });

    vm.cropper = cropperService;

    function upload_error(fileItem, response, status, headers){
        logService.log({
            userFeedback: "Dateiupload fehlgeschlagen",
            serverFeedback: { data: { error: {debug: "Details: " + response}}}

        });
    };
    function upload_success(fileItem, response, status, headers,model){
        if(fileItem.length>0){
            var fr = new FileReader;
            fr.onload = function() { // file is loaded
                var img = new Image;
                img.onload = function() {
                    var obj = {};
                    obj.type = "internal";
                    obj.cropArea = 'cropper_customerlogo';
                    obj.image = img;
                    obj.previewArea = '#cropperPreview_customerlogo';
                    vm.cropper.setSource(fileItem[0]);
                    vm.cropper.cropper(obj);
                    obj.image.addEventListener('cropstart', function () {
                        vm.input.newCustomer.logo = null;
                    });
                };
                img.src = fr.result; // is the data URL because called with readAsDataURL
            };
            fr.readAsDataURL(fileItem[0]._file);
        }
    };

    vm.uploader.customerLogo.onWhenAddingFileFailed =
        vm.uploader.customerLogo.onErrorItem =
            vm.uploader.customerLogo.onErrorItem =
                function(fileItem, response, status, headers){upload_error(fileItem, response, status, headers)};

    vm.uploader.customerLogo.onAfterAddingFile =
        vm.uploader.customerLogo.onAfterAddingAll =
            function(fileItem, response, status, headers){ upload_success(fileItem, response, status, headers,vm.input.newCustomer)};
*/
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
                console.log(res.data.user);
                if(res.data.user.length==1){
                    vm.user = res.data.user[0];
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
                //vm.input_reset();
                $state.go("protected.verwaltung.customers.start");
            }
        );

    };
    vm.locals.submit.user_edit = function() {

        userService.edit(vm.customer).then(
            function(){
                //vm.input_reset();
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
        return query ? vm.locals.keyaccountusers.filter( componentService.createFilterLowercase(query) ) : vm.locals.keyaccountusers;
    };

    return vm;
});