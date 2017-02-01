/**
 * Created by Chris on 11.11.16.
 */
myApp.controller('toolbarCtrl', function(componentService){

    vm = this;
    vm.sidebar = {};
    vm.sidebar.componentId = 'menuLeft';
    vm.sidebar.toggle = function(){
        componentService.toggle(vm.sidebar.componentId);
    }



});