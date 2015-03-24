/**
 * Created by m.cervini on 13/10/2014.
 */
app.controller('DatePickerController', function ($scope) {

    $scope.today = function() {
        $scope.dt = new Date();
    };
    $scope.today();

    $scope.open = function($event) {
        $event.preventDefault();
        $event.stopPropagation();

        $scope.opened = true;
    };

    $scope.clear = function () {
        $scope.dt = null;
    };

});
