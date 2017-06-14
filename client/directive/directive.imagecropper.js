angular.module('myApp').directive('imagecropper', function(cropperService) {
    return {
        restrict: 'E',
        replace: 'true',
        scope: {
            cropper: "=",
            input: "="
        },
        templateUrl: '/client/directive/template/tpl.imagecropper.html',
        link: function(scope,elem){
            scope.shorten = function(array_string){

            }

            scope.options = {

            };


            scope.$on('$destroy', function () {
                scope.progress=false;
                elem.off('change');
            });
        }
    };
});