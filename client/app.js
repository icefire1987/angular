/**
 * Created by Chris on 10.11.16.
 */
var env = {};

// Import variables if present (from env.js)
if(window){
    Object.assign(env, window.__env);
}


var myApp = angular.module('myApp', ['ui.router','ngStorage','ngMessages','ngMaterial','chart.js','angularFileUpload']);

    // Register environment in AngularJS as constant
    myApp.constant('__env', env);

    myApp.config(function ($stateProvider, $urlRouterProvider,$locationProvider,$provide,$httpProvider,$logProvider,$mdThemingProvider) {

        $locationProvider.html5Mode({enabled: true, requireBase: false});


        $logProvider.debugEnabled(true);
        //$httpProvider.defaults.withCredentials = true;
        $httpProvider.defaults.useXDomain = true;

        $httpProvider.interceptors.push('myHttpInterceptor');
        var states = [
            {
                name: 'public',
                val: {
                    url: '/public',
                    data:{
                        roles: []
                    },
                    views: {
                        'toolbar': {
                            templateUrl: '/client/view/toolbar_public.html',
                            controller: 'toolbarCtrl as toolbarCtrl'
                        },
                        '': {
                            templateUrl: '/client/view/public.html',
                            //controller: 'mainCtrl as mainCtrl'
                        }
                    },
                }
            },
            {
                name: 'public.main',
                val: {
                    url: '/main',
                    views: {
                        'card': {
                            templateUrl: '/client/view/public_main.html',
                        }
                    }
                }
            },
            {
                name: 'public.contact',
                val: {
                    url: '/contact',
                    views: {
                        'card': {
                            templateUrl: '/client/view/public_contact.html',
                        }
                    }
                }
            },
            {
                name: 'public.login',
                val: {
                    url: '/login',

                    views: {
                        'login': {
                            templateUrl: '/client/view/public_login.html',

                        }
                    }
                }

            },
            {
                name: 'public.logout',
                val: {
                    url: '/logout',

                    views: {
                        'logout': {
                            templateUrl: '/client/view/logout.html',
                        }
                    },
                    resolve: {
                        auth: ["authService", "logService", "$state", function (authService, logService, $state) {
                            authService.logout();
                        }]
                    }
                }
            },
            {
                name: 'protected',
                val: {
                    url: '/protected',
                    data:{
                        roles: ["User"]
                    },
                    resolve:{
                        auth: ["authService","logService","$state",function(authService,logService,$state){
                            authService.authorize().then(
                                function(status){
                                    console.log("auth:"+status)
                                },
                                function(err){
                                    console.log(err)
                                    switch(err){
                                        case 401:
                                            logService.log({"userFeedback":"Nicht eingeloggt!"});
                                            $state.go("public.login");

                                            break;
                                        case 403:
                                            logService.log({"userFeedback":"Keine ausreichenden Rechte!"})
                                            $state.go("protected.main");
                                            break;
                                    }
                                }
                            );

                        }]
                    },
                    views: {
                        'toolbar': {
                            templateUrl: '/client/view/toolbar_protected.html',
                            controller: 'toolbarCtrl as toolbarCtrl'
                        },
                        '': {
                            templateUrl: '/client/view/protected.html',
                            controller: 'toolCtrl as toolCtrl'
                        }
                    }
                }
            },
            {
                name: 'protected.main',
                val: {
                    url: '/main',
                    views: {
                        'tool-content': {
                            templateUrl: '/client/view/toolbar_public.html'

                        }
                    }
                }
            },
            {
                name: 'protected.editprofile',
                val: {
                    url: '/profile',
                    views: {
                        'protected_content': {
                            templateUrl: '/client/view/protected_editprofile.html'

                        }
                    }
                }
            },
            {
                name: 'protected.dashboard',
                val: {
                    url: '/dashboard',
                    views: {
                        'protected_content': {
                            templateUrl: '/client/view/protected_dashboard.html'

                        }
                    }
                }
            },
            {
                name: 'protected.news',
                val: {
                    url: '/news',
                    views: {
                        'protected_content': {
                            templateUrl: '/client/view/protected_news.html'


                        }
                    }
                }
            },
            {
                name: 'protected.team',
                val: {
                    url: '/team',
                    views: {
                        'protected_content': {
                            templateUrl: '/client/view/protected_team.html'

                        }
                    }
                }
            },
            {
                name: 'protected.logistik',
                val: {
                    url: '/logistik',
                    views: {
                        'protected_content': {
                            templateUrl: '/client/view/protected_logistik.html'

                        }
                    }
                }
            },
            {
                name: 'protected.produktion',
                val: {
                    url: '/produktion',
                    views: {
                        'protected_content': {
                            templateUrl: '/client/view/protected_produktion.html'

                        }
                    }
                }
            }
        ];

        for (var x = 0; x < states.length; x++) {
            $stateProvider.state(states[x].name, states[x].val);
        }

        $urlRouterProvider.otherwise('/public/login');

        $mdThemingProvider.theme('default')
            .primaryPalette('light-blue')
            .accentPalette('pink')
            .warnPalette('orange')
            .backgroundPalette('grey')

        /*$mdThemingProvider.theme('default')
            .primaryPalette('pink')
            .accentPalette('deep-purple')
            .warnPalette('orange')
            .backgroundPalette('grey')*/
    });

    myApp.run(['$rootScope', '$state', 'authService', function ($rootScope, $state, authService) {
        $rootScope.$on('$stateChangeStart', function (event) {
            authService.authorize().then(
                function(status){
                    console.log("run auth:"+status)
                },
                function(err){
                    console.log(err)
                    switch(err){
                        case 401:
                            logService.log({"userFeedback":"Nicht eingeloggt!"});
                            $state.go("public.login");

                            break;
                        case 403:
                            logService.log({"userFeedback":"Keine ausreichenden Rechte!"})
                            $state.go("protected.main");
                            break;
                    }

                }
            );
        });
    }]);