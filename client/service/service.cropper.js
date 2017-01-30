/**
 * Created by Chris on 11.11.16.
 */
angular.module('myApp').service('cropperService', function ($rootScope) {
    var vm = this;
    vm.croppers = [];
    vm.loading = false;
    vm.cropping = false;
    vm.cropped = false;
    vm.source = "";

    vm.setSource = function(source){
        vm.start();
        vm.source = source;
    };

    vm.start = function(){

        vm.loading = true;
        vm.cropping = true;
        vm.cropped = false;
    };
    vm.finish = function(){

        vm.loading = false;
        vm.cropped=true;
        $rootScope.$apply();
    };


    vm.getCroppedCanvas = function(){
        return vm.aCropper.getCroppedCanvas().toDataURL('image/jpeg');
    };

    vm.cropper = function(obj) {

        if(vm.aCropper){
            vm.aCropper.destroy();
        }

            vm.aCropper = new Cropper(obj.image, {
                aspectRatio: 1,
                preview: obj.previewArea,
                zoomable: false,
                scalable: false,
                ready: function(){
                    vm.finish();
                },
                cropstart: function(){
                    vm.start();
                },
                cropend: function(){
                    vm.finish();
                }
            });

    };

    return vm;
});