/**
 * Created by m.cervini on 28/09/2014.
 */
var app = angular.module('3DC',['ui.bootstrap', 'ngRoute', 'ngTable'])
    .run(function($rootScope, $location) {
        $rootScope.operator = null;

        // register listener to watch route changes
        $rootScope.$on( "$locationChangeStart", function(event, next, current) {
            if ( $rootScope.operator == null ) {
                // no logged user, we should be going to #login
                if ( next.templateUrl == "pages/login.html" ) {
                    // already going to #login, no redirect needed
                } else {
                    // not going to #login, we should redirect now
                    $location.path( "/login" );
                }
            }
        });

        // TODO move in a service?
        $rootScope.ACCESS_SINGLE = 0;
        $rootScope.ACCESS_SUBSCRIPTION = 1;
        $rootScope.ACCESS_FREE_TRIAL = 2;
        $rootScope.ACCESS_TYPES = [
            {"type":$rootScope.ACCESS_SINGLE, "name":"Singolo"},
            {"type":$rootScope.ACCESS_SUBSCRIPTION, "name":"Abbonamento"},
            {"type":$rootScope.ACCESS_FREE_TRIAL, "name":"Prova gratuita"}
        ];

        $rootScope.PAYMENT_SINGLE = 0;
        $rootScope.PAYMENT_SUBSCRIPTION = 1;
        $rootScope.PAYMENT_TERVEN = 2;
        $rootScope.PAYMENT_CAI = 3;
        $rootScope.PAYMENT_TYPES = [
            {"type":$rootScope.PAYMENT_SINGLE, "name":"Accesso singolo"},
            {"type":$rootScope.PAYMENT_SUBSCRIPTION, "name":"Abbonamento"},
            {"type":$rootScope.PAYMENT_TERVEN, "name":"Iscrizione terven"},
            {"type":$rootScope.PAYMENT_CAI, "name":"Iscrizione CAI"}
        ];
    })
    .config(function($routeProvider) {
        $routeProvider

            // login
            .when('/login', {
                templateUrl : 'pages/login.html'
                //controller  : 'UserController'
            })

            // gestione palestra
            .when('/manage', {
                templateUrl : 'pages/manage.html'
                //controller  : 'aboutController'
            })

            // import-export del database
            .when('/admin-db', {
                templateUrl : 'pages/admin-db.html'
                //controller  : 'contactController'
            })

            // gestione operatori
            .when('/admin-operators', {
                templateUrl : 'pages/admin-operators.html'
                //controller  : 'contactController'
            })

            .when('/', {
                templateUrl : 'pages/manage.html'
                //controller  : 'contactController'
            });
    });