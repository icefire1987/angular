angular.module('myApp').filter('html', function($sce) {
    return function(input){
        return $sce.trustAsHtml(input);
    }
});

