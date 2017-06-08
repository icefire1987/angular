angular.module('myApp').directive('selectTable', function($interval,dbDataCollectorService) {
    return {
        restrict: 'E',
        replace: 'true',
        scope: {
            table: "@",
            source: "@",
            selected: "=",
            filter: "=",
            hasIcon: "@"

        },
        templateUrl: '/client/directive/template/tpl.selectTable.html',
        link: function(scope,elem){
            scope.progress=false;
            scope.options = [];

            var myCallback = function(res){
                console.log(res)
                if(res.data.length>0){
                    for(var row in res.data){
                        var depth=1;
                        if(res.data[row].depth){
                            depth=res.data[row].depth;
                        }
                        if(scope.hasIcon=="false"){
                            console.log("false")
                            scope.options.push({
                                value: res.data[row].id,
                                text: res.data[row].person.concat(" ", res.data[row].street," ", res.data[row].postal," ", res.data[row].city),
                                depth: depth
                            });
                        }else{
                            console.log("true")
                            if(res.data[row].icon.indexOf('fa')==0) {
                                scope.options.push({
                                    value: res.data[row].id,
                                    text: res.data[row].name,
                                    icon_value: res.data[row].icon,
                                    fontset: 'fa',
                                    depth: depth
                                });
                            }else if(res.data[row].icon.indexOf('icon-')==0){
                                scope.options.push({
                                    value: res.data[row].id,
                                    text: res.data[row].name,
                                    icon_value: res.data[row].icon,
                                    fontset: 'Fontsaddict',
                                    depth: depth
                                });

                            }else{
                                scope.options.push({
                                    value: res.data[row].id,
                                    text: res.data[row].name,
                                    icon_md: res.data[row].icon,
                                    depth: depth
                                });
                            }
                        }

                    }
                }else{
                    scope.options = []
                }
            };
            if(scope.filter){
                scope.$watch('filter', function() {
                    switch(scope.source){
                        case "retouraddress":
                            dbDataCollectorService.getRetourAddress(scope.filter.customerID).then(myCallback);
                            break;
                    }
                });
            }else{
                switch(scope.source){
                    case "gender":
                        dbDataCollectorService.getGender().then(myCallback);
                        break;
                    case "wg":
                        dbDataCollectorService.getWG().then(myCallback);
                        break;
                }
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