/**
 * Created by Chris on 10.11.16.
 */
var env = {};

// Import variables if present (from env.js)
if(window){
    Object.assign(env, window.__env);
}


var myApp = angular.module('myApp', ['ui.router','ngStorage','ngMessages','ngMaterial','chart.js','angularFileUpload','btford.socket-io','md.data.table']);

    // Register environment in AngularJS as constant
    myApp.constant('__env', env);

    myApp.factory('mySocket', function (socketFactory) {
        return socketFactory();
    });

    myApp.config(function ($stateProvider, $urlRouterProvider,$locationProvider,$provide,$httpProvider,$logProvider,$mdThemingProvider,$mdIconProvider) {

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
                    name: 'public.signup_feedback',
                    val: {
                        url: '/signup',
                        views: {
                            'card': {
                                templateUrl: '/client/view/public_signup.html',
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
                    /*resolve:{
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
                    },*/
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
                name: 'protected.news.all',
                val: {
                    url: '/',
                    onEnter: function(newsService, $stateParams){
                        newsService.getNews();
                    }
                }
            },
                {
                    name: 'protected.news.single',
                    val: {
                        url: '/{teamid:int}',
                        onEnter: function(newsService, $stateParams){
                            if(newsService.teams.length==0) {
                                newsService.getNews().then(
                                    function () {
                                        newsService.showTeam($stateParams.teamid);
                                    }
                                )
                            }else{
                                newsService.showTeam($stateParams.teamid);
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
                    data: {
                        teams: ['System_Logistik']
                    },
                    views: {
                        'protected_content': {
                            templateUrl: '/client/view/protected_logistik.html'

                        }
                    }
                }
            },
                {
                    name: 'protected.logistik.orders',
                    val: {
                        url: '/orders',
                        views: {
                            'logistik_content': {
                                templateUrl: '/client/view/protected/logistik/orders.html'

                            }
                        },
                        onEnter: function(logisticService, $stateParams){
                            logisticService.getOrders({latest: 5});
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
            },
            {
                name: 'protected.verwaltung',
                val: {
                    url: '/verwaltung',
                    views: {
                        'protected_content': {
                            templateUrl: '/client/view/protected_verwaltung.html'

                        }
                    }
                }
            },
            {
                name: 'protected.verwaltung.customers',
                val: {
                    abstract: true,
                    url: '/kunden',
                    views: {
                        'verwaltung_content': {
                            templateUrl: '/client/view/protected/verwaltung/customers.html'

                        }
                    },
                    onEnter: function(managementService, $stateParams){
                        managementService.getKeyaccountusers();
                    }
                }
            },
            {
                name: 'protected.verwaltung.customers.start',
                val: {
                    url: '/',
                    views: {
                        'kunden_content': {
                            templateUrl: '/client/view/protected/verwaltung/customers_start.html'

                        }
                    },
                    onEnter: function(managementService, $stateParams){
                        if(managementService.input.customername){
                            managementService.locals.submit.customersearch();
                        }

                    }
                }
            },
            {
                name: 'protected.verwaltung.customers.edit',
                val: {
                    url: '/edit/{customerID:int}',
                    views: {
                        'kunden_content': {
                            templateUrl: '/client/view/protected/verwaltung/customers_edit.html'

                        }
                    },
                    onEnter: function(managementService, $stateParams){
                        managementService.getCustomer($stateParams.customerID);

                    }
                }
            },
        ];

        for (var x = 0; x < states.length; x++) {
            $stateProvider.state(states[x].name, states[x].val);
        }

        $urlRouterProvider.otherwise('/public/login');

        //$mdIconProvider.fontSet('fa', 'fa');

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

    myApp.run(['$rootScope', '$state', 'authService','logService', function ($rootScope, $state, authService,logService) {
        $rootScope.$on('$stateChangeStart', function (event,toState) {
            console.log(toState)
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