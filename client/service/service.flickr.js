/**
 * Created by Chris on 14.12.16.
 */
angular.module('myApp').service('flickrService', function ($http,helperService) {

    var vm = this;

    vm.config = {
        key:"03bf3fcd0e23500ea780ac28cc9bda35",
        secret:"92a7bda79166a57f"
    }
    vm.input = {};
    vm.result = null;
    vm.loading = false;
    vm.setInput = function(data){
        vm.input = data;
    };
    vm.search = function(){
        vm.loading = true;
        var keystorage = [];
        var tempHeader = $http.defaults.headers.common['Authorization'];
        delete $http.defaults.headers.common['Authorization'];
        $http.get("https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key="+vm.config.key+"&tags="+vm.input.query+"&format=json&nojsoncallback=1").then(
            function(res) {
                vm.result = [];
                var innercounter = 0;
                if (res.data.photos.photo.length > 3) {
                    var x=0;
                    while(x<3){
                        innercounter++;
                        var element = helperService.randomInt(1,100);
                        if(keystorage.indexOf(element) === -1){
                            if(res.data.photos.photo[element]){
                                x++;
                                keystorage.push(element);
                                var temp = {};
                                var img = res.data.photos.photo[element];
                                temp.imageurl = "https://farm"+img.farm+".staticflickr.com/"+img.server+"/"+img.id+"_"+img.secret+".jpg";
                                temp.id = element;
                                vm.result.push(temp);
                            }

                        }

                        if(innercounter>10){
                            x=4;
                        }
                    }
                } else if (res.data.photos.photo.length > 0){
                    for(var element in res.data.photos.photo){
                        var img = res.data.photos.photo[element];
                        temp.imageurl = "https://farm"+img.farm+".staticflickr.com/"+img.server+"/"+img.id+"_"+img.secret+".jpg";
                        temp.id = element;
                        vm.result.push(temp);
                    }
                }
                vm.loading = false;
                return vm.result;
            },
            function(err){
                vm.loading = false;
                console.log(err)
            }
        )
        $http.defaults.headers.common['Authorization'] = tempHeader;
    };

    return vm;
});