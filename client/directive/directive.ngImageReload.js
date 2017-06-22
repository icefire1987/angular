angular.module('myApp').directive('ngImageReload', function($timeout,helperService) {
    return {
        restrict: 'A',

        link: function(scope,elem,attr){
            $timeout(function(){
                if(elem[0].tagName == "IMG"){
                    elem.attr('src', attr.ngSrc +'?'+ helperService.time.setTimestamp());
                }else{
                    var image = elem.find("img");

                    image.attr('src', image.attr("src") +'?'+ helperService.time.setTimestamp());
                }



            }, 0);

        }

    };
});