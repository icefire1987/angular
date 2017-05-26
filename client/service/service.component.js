/**
 * Created by Chris on 11.11.16.
 */
angular.module('myApp').service('componentService', function ($mdMenu,$mdMedia,$mdDialog,$mdToast) {
    var vm = this;

    vm.menuLeft = {};
    vm.menuLeft.lockedOpen = $mdMedia('gt-sm');

    vm.dialogConfirm = function(){
        var inner_vm = this;
        inner_vm.controller = {};
        inner_vm.config = {};
        inner_vm.locals = {};
        inner_vm.callback = {
            ok : function(){console.log("default ok")},
            cancel: function(){console.log("default cancel")}
        };
        this.show = function($event, viewData){
            inner_vm.locals.view = viewData;
            var confirm = $mdDialog.confirm(inner_vm.config);
            $mdDialog.show(confirm).then(inner_vm.callback.ok,inner_vm.callback.cancel);
        }
    };

    vm.dialogTab = function(){
        var inner_vm = this;
        inner_vm.controller = {
            log: function(data){
                angular.element(document.querySelectorAll(".log")).html(data.text);
            },
            clearLog: function(){
                angular.element(document.querySelectorAll(".log")).html("");
            }
        };
        inner_vm.config = {};
        inner_vm.locals = {view:{}};
        inner_vm.callback = {
            ok : function(){console.log("default ok")},
            cancel: function(){console.log("default cancel")},
            hide: function(){
                console.log("hide")
                //$mdDialog.hide();
            },
            ui_cancel: function(){
                console.log("try cancel")
                $mdDialog.cancel();
            },
            ui_answer: function(answer){
                console.log("try answer")
                $mdDialog.hide(answer);
            }
        };
        this.show = function($event, viewData){
            console.log("show dialogTab")
            inner_vm.locals.view = viewData;
            console.log(inner_vm.config)
            $mdDialog.show(inner_vm.config).then(inner_vm.callback.ok,inner_vm.callback.cancel);
        }
    };


    vm.dialogAlert = function(){
        var inner_vm = this;
        inner_vm.callback = {
            ok : function(){console.log("default ok")},
            cancel: function(){console.log("default cancel")}
        };
        this.show = function($event, viewData){
            inner_vm.config = {
                textContent: viewData,
                title: 'Info',
                clickOutsideToClose: true,
                ok: 'OK'
            };
            var alert = $mdDialog.alert(inner_vm.config);
            $mdDialog.show(alert).then(inner_vm.callback.ok,inner_vm.callback.cancel);
        }
    };


    vm.toggle = function(componentID){
        vm[componentID].lockedOpen = !vm[componentID].lockedOpen;
    };
    vm.getInstance = function(name){
        var obj = new vm[name]();
        return obj;
    };
    vm.getComponent = function (componentID){
        return vm[componentID];

    };

    vm.createFilterLowercase = function(query) {
        var lowercaseQuery = angular.lowercase(query);
        return function filterFn(obj) {
            return (obj.name.toLowerCase().indexOf(lowercaseQuery) !== -1);
        };

    }

    return vm;
});