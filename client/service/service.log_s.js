/**
 * Created by Chris on 19.11.16.
 */
angular.module('myApp').service('logService',function ($rootScope) {

    var vm = this;
    
    vm.feedback = {text:"Test"};
    vm.setFeedback = function(data){
        vm.feedback.text = data;
        console.log(vm.feedback)
    };

    return {
        log: function(source){
            console.log(source);
            $.post('/server/log',
                {
                    "source": angular.toJson(source)
                })
                .done(
                    function(res){
                        console.log("done"+res)
                    }
                )
                .fail(
                    function(err){
                        vm.setFeedback({"text":"Servererror. Log nicht möglich"})
                    }
                );
        },
        feedback: vm.feedback
    };
});