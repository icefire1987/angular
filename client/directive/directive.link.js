angular.module('myApp').directive('multilink', function($state,$filter) {
    return {
        restrict: 'E',
        replace: 'true',
        scope: {
            orderid: "@",
            linktype: "@",
            text: "@"
        },
        templateUrl: function(element, attrs){
            console.log(attrs.linktype)
            switch(attrs.linktype){
                case "order":
                    return '/client/directive/template/tpl.link_order.html';
                    break;
            }
        },
        link: function(scope,elem){
            scope.options = {
                content: "",
                href: ""
            };
            console.log(scope.linktype)
            switch(scope.linktype){
                case "order":
                    scope.options.content = $filter('numberFixedLen')(scope.orderid,6);
                    scope.options.href= "/protected/orders/"+scope.orderid;
                    break;
            }

            scope.$on('$destroy', function () {
                scope.progress=false;
                elem.off('change');
            });


        }
    };
});