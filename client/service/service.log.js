/**
 * Created by Chris on 19.11.16.
 */
angular.module('myApp').factory('logService',function ($q,$timeout,$anchorScroll,$mdToast) {
    var vm = this;
    vm.timers=[];
    vm.feedback = [];
    vm.setFeedback = function(data){
        console.log(data)
/*
        vm.timers[data.timer] = $timeout(function(){
            data.visible = false;
        },data.msecondsToDisplay);

        vm.feedback.push(data);
        $anchorScroll();
        */
        if(data.debug){
            var toast = $mdToast.simple()
                .textContent(data.text)
                .position('top','right' )
                .hideDelay(data.msecondsToDisplay)
                .parent('#content')
                .action('Details');
            $mdToast.show(toast).then(function(response) {
                if ( response == 'ok' ) {
                    alert(data.debug);
                }
            });
        }else{
            var toast = $mdToast.simple()
                .textContent(data.text)
                .position('top','right' )
                .hideDelay(data.msecondsToDisplay)
                .parent('#content')
                .action('X');
            $mdToast.show(toast).then(function(response) {
                if ( response == 'ok' ) {
                    $mdToast.hide();
                }
            });
        }



    };

    return {
        log: function(source){
            if(typeof source.serverFeedback != "undefined" && source.serverFeedback != ""){
                var obj = {
                    data: angular.toJson(source.serverFeedback)
                };

                var promise = $.post('/server/log',obj);
                promise.done( function(res){
                    //console.log("done"+res)
                });
                promise.fail(function(err){
                    $timeout(
                        function(){
                            var date = new Date();
                            vm.setFeedback({
                                text:"Servererror. Log nicht möglich",
                                msecondsToDisplay: 10000,
                                visible: true,
                                class: "md-highlight",
                                timer: "timer"
                            });
                        }
                    )

                });
            }
            var msecondsToDisplay = 3000;
            if(source.msecondsToDisplay != null){
                msecondsToDisplay = source.msecondsToDisplay;
            }
            var timername = "timer";
            if(source.timername != null){
                timername = source.timername;
            }

            var classbase = "md-";
            var classname = "";
            if(source.classname){
                classname = classbase + source.classname;
            }else{
                classname = classbase + "highlight";
            }
            var debug='';

            if(typeof source.serverFeedback != "undefined" && source.serverFeedback != "" && source.serverFeedback.data != null && source.serverFeedback.data.error != null){
                debug = source.serverFeedback.data.error.debug;
            }else if(typeof source.serverFeedback != "undefined" && source.serverFeedback != "" && source.serverFeedback.data != null && source.serverFeedback.data.code != null){
                debug = source.serverFeedback.data.code;
            }
            vm.setFeedback({
                text:(source.userFeedback ? source.userFeedback : source.code),
                msecondsToDisplay: msecondsToDisplay,
                visible: true,
                class: classname,
                timer: timername,
                debug: debug
            });

        },
        cancel: function(timer){
            for(var x in vm.feedback){
                vm.feedback.splice(x)
            }
        },
        getFeedback : function(){
            return vm.feedback;
        }
    }

});