angular.module('myApp').directive('selectTable', function($interval,dbDataCollectorService) {
    return {
        restrict: 'E',
        replace: 'true',
        scope: {
            table: "@",
            source: "@",
            selected: "=",
            filter: "=",
            hasIcon: "@",
            objectAsValue: "@"

        },
        templateUrl: '/client/directive/template/tpl.selectTable.html',
        link: function(scope,elem){
            scope.progress=false;
            scope.options = [];

            var myCallback = function(res){
                if(res.data.length>0){
                    for(var row in res.data){
                        var depth=1;
                        if(res.data[row].depth){
                            depth=res.data[row].depth;
                        }
                        var value = "";
                        if(scope.objectAsValue=="true"){
                            value = res.data[row];
                        }else{
                            value = res.data[row].id;
                        }
                        if(scope.hasIcon=="false"){
                            scope.options.push({
                                value: value,
                                text: res.data[row].person.concat(" ", res.data[row].street," ", res.data[row].postal," ", res.data[row].city),
                                depth: depth
                            });
                        }else{
                            console.log(res.data[row])
                            if(res.data[row].icon && res.data[row].icon.indexOf('fa')==0) {
                                scope.options.push({
                                    value: value,
                                    text: res.data[row].name,
                                    icon_value: res.data[row].icon,
                                    fontset: 'fa',
                                    depth: depth
                                });
                            }else if(res.data[row].icon && res.data[row].icon.indexOf('icon-')==0){
                                scope.options.push({
                                    value: value,
                                    text: res.data[row].name,
                                    icon_value: res.data[row].icon,
                                    fontset: 'Fontsaddict',
                                    depth: depth
                                });

                            }else if(res.data[row].icon_alt){
                                scope.options.push({
                                    value: value,
                                    text: res.data[row].name,
                                    icon_alt: res.data[row].icon_alt,
                                    depth: depth
                                });
                            }else{
                                scope.options.push({
                                    value: value,
                                    text: res.data[row].name,
                                    icon_md: res.data[row].s,
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
                            dbDataCollectorService.getRetourAddress(scope.filter).then(myCallback);
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
                    case "stages":
                        dbDataCollectorService.getStages().then(myCallback);
                        break;
                    case "process":
                        dbDataCollectorService.getProcess().then(myCallback);
                        break;
                    case "comment":
                        dbDataCollectorService.getCommentTyp().then(myCallback);
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