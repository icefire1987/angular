angular.module('myApp').directive('selectTable', function($interval,dbDataCollectorService) {
    return {
        restrict: 'E',
        replace: 'true',
        scope: {
            table: "@",
            source: "@",
            selected: "="
        },
        templateUrl: '/client/directive/template/tpl.selectTable.html',
        link: function(scope,elem){
            scope.progress=false;
            scope.options = [];
            var myCallback = function(res){
                if(res.data.length>0){
                    for(var row in res.data){
                        if(res.data[row].icon.indexOf('&')==0){
                            scope.options.push({
                                value: res.data[row].id,
                                text: res.data[row].name,
                                icon_fa: res.data[row].icon,
                                fontset: 'fa'
                            });
                        }else{
                            scope.options.push({
                                value: res.data[row].id,
                                text: res.data[row].name,
                                icon_md: res.data[row].icon
                            });
                        }
                    }
                }else{
                    scope.options = []
                }
            };
            switch(scope.source){
                case "gender":
                    dbDataCollectorService.getGender().then(myCallback);
                    break;
                case "wg":
                    /*

                    !!!!!!!!!!!!!!!!!!!!!!!!
DIENSTAG
                    !!!!!!!!!!!!!!!!!!!!!!!!!
                     */
                    // md-option GROUP!!!!
                    dbDataCollectorService.getWG().then(myCallback);
                    break;
            }


            elem.bind('change', function(event){

            });
            scope.$on('$destroy', function () {
                scope.progress=false;
                elem.off('change');
            });
        },
        controller: function(){

        }
    };
});