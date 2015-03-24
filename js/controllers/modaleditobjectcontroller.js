/**
 * Created by m.cervini on 13/10/2014.
 */
app.controller('ModalEditObjectController', function ($scope, $modalInstance, $rootScope, current, validationFunction) {
    //console.log($rootScope.operator);
    //console.log('Modal: current is ' + JSON.stringify(current));
    $scope.current = current;

    $scope.ok = function () {
        if(validationFunction == undefined) {
            $modalInstance.close($scope.current);
            return;
        }
        if(validationFunction($scope.current)) {
            $modalInstance.close($scope.current);
        }
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});
