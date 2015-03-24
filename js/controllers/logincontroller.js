/**
 * Created by m.cervini on 11/10/2014.
 */
app.controller('LoginController', ['$scope', '$rootScope', '$http', 'dataFactory', '$location',
    function($scope, $rootScope, $http, dataFactory, $location){

    $scope.message = "";
    var controller = this;

    function init(){
        dataFactory.open();
    }

    controller.auth = function() {

        if($scope.username == '3D-admin' && $scope.password == window.atob('M0QtYWRtaW4=')) {
            var adminOperator = new Object();
            adminOperator.operator = $scope.username;
            adminOperator.canDelete = true;
            adminOperator.canEdit = true;
            adminOperator.canAdd = true;
            //$rootScope.operator = $scope.username;
            $rootScope.operator = adminOperator;
            $location.path( "/manage" );
            return;
        } else {
            //alert(window.atob('cGFzc3dvcmQ='));
            //alert(window.btoa($scope.password));
            dataFactory.getOperator($scope.username).then(function(operator) {
                if(window.btoa($scope.password) == operator.password) {
                    // 0_0 this will make the application secure! woah! 0_0
                    operator.password = '';
                    $rootScope.operator = operator;
                    //$rootScope.operator = $scope.username;
                    $location.path( "/manage" );
                    return;
                } else {
                    alert('Nome utente o password non corretti');
                }
                return;
            }, function(value) {
                alert('Nome utente o password non corretti');
            });

        }
        /*
        $http.get('data/operators.json').success(function (data) {

            angular.forEach(data.operators, function (user) {
                if($scope.username == user.username
                    && $scope.password == user.password) {
                    $rootScope.operator = $scope.username;
                    $location.path( "/manage" );
                    return;
                }
            }, null);
        });
        */
    };
    init();
}]);

