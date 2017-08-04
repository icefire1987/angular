/**
 * Created by Chris on 19.11.16.
 */
angular.module('myApp').service('myHttpInterceptor',
    ['$q','$injector','$rootScope','$localStorage',
    function($q,$injector,$rootScope) {
        $rootScope.requestRunning = false;
        return {
            request: function(config) {
                $rootScope.requestRunning = true;
                return config;
            },

            requestError: function(config) {
                $rootScope.requestRunning = false;
                return config;
            },

            response: function(response) {
                $rootScope.requestRunning = false;
                if(response.data.userFeedback) {
                    $injector.get('logService').log({
                            userFeedback: response.data.userFeedback, 
                            msecondsToDisplay: 15000,
                            classname: response.data.type
                        }
                    );
                }
                //return res;
                return $q.resolve(response);
            },

            responseError: function(response) {
                $rootScope.requestRunning = false;
                if(response.status === 401) {
                    if(response.data.error){
                        $injector.get('logService').log(
                            {
                                //userFeedback : response.data.error,
                                userFeedback : "Bitte log dich ein",
                                msecondsToDisplay: 20000,
                                classname: "danger"

                            });
                    }else{
                        $injector.get('logService').log({userFeedback : "Bitte log dich ein."});
                    }
                    $injector.get('$state').transitionTo('public.login');
                }else if(response.status === 403) {
                    $injector.get('logService').log(
                        {
                            userFeedback : "Bitte log dich ein",
                            msecondsToDisplay: 20000,
                            classname: "danger"

                        });

                    $injector.get('$state').transitionTo('public.login');
                }else if(response.status === 420){
                    $injector.get('logService').log({userFeedback: response.data.debug});
                }else{
                    $injector.get('logService').log({serverFeedback: response, userFeedback: "Abfragefehler"});
                }
                return $q.reject(response);
            }

        }
    }
]);