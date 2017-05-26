angular.module('myApp').directive('altAvatar', function($interval) {
    return {
        restrict: 'E',
        replace: 'true',
        scope: {
            filepath: "@",
            color: "@",
            text: "@"
        },
        templateUrl: '/client/directive/template/tpl.avatar.html',
        link: function(scope,elem){
            scope.shorten = function(array_string){
                if(!Array.isArray(array_string)){
                    array_string = array_string.split(" ");
                }

                var lastindex = array_string.length;
                if(lastindex==1){
                    return array_string[0].substr(0,2);
                }
                if(lastindex>2){

                    return array_string[0].substr(0,1) + array_string[(lastindex-1)].substr(0,1);
                }
                return array_string[0].substr(0,1) + array_string[1].substr(0,1);
            }

            scope.options = {
                filepath: scope.filepath,
                color: scope.color,
                text: scope.shorten(scope.text)
            };


            scope.$on('$destroy', function () {
                scope.progress=false;
                elem.off('change');
            });


        }
    };
});