angular.module('myApp').directive('buttonSubmit', function($state,$filter) {
    return {
        restrict: 'A',
        require: '^form',
        link: function(scope, element, attributes, formCtrl){
            element.on('click', clickHandler);

            function clickHandler() {
                formCtrl.$setDirty(true);
                formCtrl.$setSubmitted(true);
                angular.element(element[0].form).triggerHandler('submit');
                console.info('Form Submitted');
            }

            scope.$on('$destroy', function () {
                scope.progress=false;
                elem.off('change');
            });


        }
    };
});