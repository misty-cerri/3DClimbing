/**
 * Created by m.cervini on 30/09/2014.
 */
app.controller('AccessController', ['$scope', '$rootScope', '$http', 'dataFactory','$modal', 'ngTableParams', '$filter',
    function($scope, $rootScope, $http, dataFactory, $modal, ngTableParams, $filter){

    var controller = this;
    var userId;

    controller.init = function init(userId){
        //$scope.tableParams = null;
        $scope.accesses=[];
        controller.userId = userId;
        dataFactory.open().then(function(){
            dataFactory.getUserAccesses(controller.userId).then(function(data) {
                $scope.accesses = data;
                $scope.tableParams =
                    new ngTableParams({
                        page: 1,        // show first page
                        count: 5,
                        sorting: {
                        date: 'desc'    // sort initially by date
                        }
                    }, {
                        counts: [5,10,20],
                        total: $scope.accesses.length,
                        getData: function($defer, params) {
                            var orderedData = params.sorting() ?
                                $filter('orderBy')($scope.accesses, params.orderBy()) :$scope.accesses;
                            //$defer.resolve($scope.accesses.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                            $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                        }
                    });
                });
        });
    }

    controller.newAccess = function() {
        controller.openModalAccess();
    }

    controller.openModalAccess = function () {
        //console.log('opening modal access');
        var modalWindow = $modal.open({
            templateUrl: '../../pages/newaccess.html',
            controller: 'ModalEditObjectController',
            resolve: {
                current: function () {
                    return controller.forgeAccess(controller.userId);
                },
                validationFunction: function(){}
            }
        });

        modalWindow.result.then(function(access) {
            controller.addAccess(access);
        }, function () {});
    }

    controller.addAccess = function(access){
        dataFactory.addAccess(access).then(function(){
            console.log('added access: ' + JSON.stringify(access));
            dataFactory.getUserAccesses(controller.userId).then(function(data) {
                //alert('accesses reloaded: ' + data.length);
                $scope.accesses = data;
                $scope.tableParams.reload();
                controller.updateUserFreeTrialDate(access);
            });
            //controller.getUserAccesses();
        }, function(err){
            $window.alert(err);
        });
    };

    controller.deleteAccess = function(access){
        if(confirm("Cancellare l'accesso?")) {
            dataFactory.deleteAccess(access.key).then(function(){
                console.log('deleted access: ' + JSON.stringify(access));
                dataFactory.getUserAccesses(controller.userId).then(function(data) {
                    console.log('accesses reloaded: ' + data.length);
                    $scope.accesses = data;
                    $scope.tableParams.reload();
                    controller.updateUserFreeTrialDate(access);
                });
            }, function(err){
                $window.alert(err);
            });
        }
    };

    controller.forgeAccess = function (userId){
        var newAccess = {"userId": userId, "date": new Date(), "operator": $rootScope.operator.operator};
        return newAccess;
    }

    /*
     * Check if user free trial date must be updated
     */
    controller.updateUserFreeTrialDate = function(a) {
        if(a.type == $rootScope.ACCESS_FREE_TRIAL) {
            var lastFreeTrial = 0;
            //console.log('updating trial. accesses are ' + $scope.accesses.length);
            angular.forEach($scope.accesses, function (value) {
                //console.log('dio scappato ' + JSON.stringify(value));
                if(value.type == $rootScope.ACCESS_FREE_TRIAL && lastFreeTrial < value.date){
                    lastFreeTrial = value.date;
                    //console.log('Temp free trial date: ' + lastFreeTrial);
                }
            }, null);
            dataFactory.getUser(a.userId).then(function(user) {
                if(lastFreeTrial == 0) {
                    lastFreeTrial = null;
                }
                console.log('last free trial ' + lastFreeTrial);
                console.log('user last free trial ' + user.freeTrialDate);
                if(lastFreeTrial == null || user.freeTrialDate == null
                    || lastFreeTrial.getTime() != user.freeTrialDate.getTime()) {
                    user.freeTrialDate = lastFreeTrial;
                    dataFactory.updateUser(user);
                    console.log('User updated with new last free trial date: ' + lastFreeTrial);
                    if(lastFreeTrial == null) {
                        alert('La data dell\'ultima prova gratuita dell\'utente '
                            + user.name + ' ' + user.surname + ' è stata resettata');
                    } else {
                        alert('La data dell\'ultima prova gratuita dell\'utente '
                            + user.name + ' ' + user.surname + ' è stata impostata a ' + user.freeTrialDate);
                    }
                }
            });
        }
    }
}]);