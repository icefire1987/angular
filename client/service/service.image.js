/**
 * Created by Chris on 14.12.16.
 */
angular.module('myApp').service('imageService', function () {

    var vm = this;
        vm.file = {};
    vm.dataURLToFile = function(dataURL){
        var binaryBlob = atob(dataURL.split(',')[1]);
        var arr = [];
        for(var i=0;i<binaryBlob.length;i++){
            arr.push(binaryBlob.charCodeAt(i));
        }
        var blob = new Blob([new Uint8Array(arr)], {type: 'image/png'});

        return blob;

    };

    return vm;
});