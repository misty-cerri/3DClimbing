/**
 * Created by m.cervini on 14/10/2014.
 */
app.controller('PaymentController', ['$scope', '$rootScope', '$http', 'dataFactory', '$modal','ngTableParams', '$filter',
        function($scope, $rootScope, $http, dataFactory, $modal, ngTableParams, $filter){

    var controller = this;
    var userId;

    controller.newPayment = function() {
        controller.openModalPayment();
    }

    controller.openModalPayment = function () {
        var modalWindow = $modal.open({
            templateUrl: '../../pages/newpayment.html',
            controller: 'ModalEditObjectController',
            resolve: {
                current: function () {
                    return controller.forgePayment(controller.userId);
                },
                validationFunction: function(){}
            }
        });

        modalWindow.result.then(function(access) {
            //console.log(JSON.stringify(access));
            controller.addPayment(access);
        }, function () {
            //console.info('Modal dismissed at: ' + new Date());
        });
    }

    controller.forgePayment = function (userId){
        var newPayment = {"userId": userId, "date": new Date(), "operator": $rootScope.operator.operator};
        return newPayment;
    }

    controller.addPayment = function(payment){
        //dataFactory.addAccess(controller.newAccess(controller.userId, single)).then(function(){
        dataFactory.addPayment(payment).then(function(){
            //controller.getUserPayments();
            dataFactory.getUserPayments(controller.userId).then(function(data){
                $scope.payments = data;
                $scope.tableParams.reload();
                controller.updateUserDates(payment, false);
            });
        }, function(err){
            $window.alert(err);
        });
    };

    controller.deletePayment = function(payment){
        if(confirm("Cancellare il pagamento?")) {
            dataFactory.deletePayment(payment.key).then(function(){
                dataFactory.getUserPayments(controller.userId).then(function(data){
                    $scope.payments = data;
                    $scope.tableParams.reload();
                    controller.updateUserDates(payment, true);
                });
            }, function(err){
                $window.alert(err);
            });
        }
    };

    controller.init = function init(userId){
        console.log("Payments for user " + userId);
        $scope.payments=[];
        controller.userId = userId;
        dataFactory.open().then(function(){
            dataFactory.getUserPayments(controller.userId).then(function(data){
                $scope.payments = data;
                $scope.tableParams =
                    new ngTableParams({
                        page: 1,        // show first page
                        count: 5,
                        sorting: {
                            date: 'desc'    // sort initially by date
                        }
                    }, {
                        counts: [5,10,20],
                        total: $scope.payments.length,
                        getData: function($defer, params) {
                            var orderedData = params.sorting() ?
                                $filter('orderBy')($scope.payments, params.orderBy()) :$scope.payments;
                            //$defer.resolve($scope.payments.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                            $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                        }
                    });
            }, function(err){
                $window.alert(err);
            });
            //controller.getUserPayments();
        });
    }

    controller.updateUserDates = function(payment, deleting) {
        /*
         * CAI payment. Update CAI date of related user
         */
        if(payment.type == $rootScope.PAYMENT_CAI) {
            var lastCAIDate = 0;
            angular.forEach($scope.payments, function (value) {
                if (value.type == $rootScope.PAYMENT_CAI && lastCAIDate < value.date) {
                    lastCAIDate = value.date;
                    //console.log('Temp last CAI date: ' + lastCAIDate);
                }
            }, null);

            dataFactory.getUser(payment.userId).then(function(user) {
                if(lastCAIDate == 0) {
                    lastCAIDate = null;
                }
                console.log('last CAI date: ' + lastCAIDate + ' - user last CAI date: ' + user.caiDate);
                if(lastCAIDate == null || user.caiDate == null
                    || lastCAIDate.getTime() != user.caiDate.getTime()) {
                    user.caiDate = lastCAIDate;
                    dataFactory.updateUser(user);
                    console.log('User updated with new cai date: ' + user.caiDate);
                    if(user.caiDate == null) {
                        alert('La data di iscrizione al CAI dell\'utente '
                        + user.name + ' ' + user.surname + ' è stata resettata');
                    } else {
                        alert('La data di iscrizione al CAI dell\'utente '
                            + user.name + ' ' + user.surname + ' è stata impostata a ' + user.caiDate);
                    }
                }
            });
        }

        /*
         * Subscription payment. Update subscription date of related user
         */
        else if(payment.type == $rootScope.PAYMENT_SUBSCRIPTION) {
            var lastSubscriptionDate = 0;
            angular.forEach($scope.payments, function (value) {
                if (value.type == $rootScope.PAYMENT_SUBSCRIPTION && lastSubscriptionDate < value.date) {
                    lastSubscriptionDate = value.date;
                    //console.log('Temp last CAI date: ' + lastSubscriptionDate);
                }
            }, null);

            dataFactory.getUser(payment.userId).then(function(user) {
                if(lastSubscriptionDate == 0) {
                    lastSubscriptionDate = null;
                }
                console.log('last Subscription date: ' + lastSubscriptionDate + ' - user last Subscription date: ' + user.subscriptionDate);
                if(lastSubscriptionDate == null || user.subscriptionDate == null
                    || lastSubscriptionDate.getTime() != user.subscriptionDate.getTime()) {
                    user.subscriptionDate = lastSubscriptionDate;
                    dataFactory.updateUser(user);
                    console.log('User updated with new subscription date: ' + user.subscriptionDate);
                    if(user.subscriptionDate == null) {
                        alert('La data di sottoscrizione dell\'abbonamento annuale dell\'utente '
                            + user.name + ' ' + user.surname + ' è stata resettata');
                    } else {
                        alert('La data di sottoscrizione dell\'abbonamento annuale dell\'utente '
                            + user.name + ' ' + user.surname + ' è stata impostata a ' + user.subscriptionDate);
                    }
                }
            });
        }

        /*
         * Terven payment. Update Terven date of related user
         */
        else if(payment.type == $rootScope.PAYMENT_TERVEN) {
            var lastTervenDate = 0;
            angular.forEach($scope.payments, function (value) {
                if (value.type == $rootScope.PAYMENT_TERVEN && lastTervenDate < value.date) {
                    lastTervenDate = value.date;
                    //console.log('Temp last CAI date: ' + lastCAIDate);
                }
            }, null);

            dataFactory.getUser(payment.userId).then(function(user) {
                if(lastTervenDate == 0) {
                    lastTervenDate = null;
                }
                console.log('last Terven date: ' + lastTervenDate + ' - user last Terven date: ' + user.tervenDate);
                if(lastTervenDate == null || user.tervenDate == null
                    || lastTervenDate.getTime() != user.tervenDate.getTime()) {
                    user.tervenDate = lastTervenDate;
                    dataFactory.updateUser(user);
                    console.log('User updated with new terven date: ' + user.tervenDate);
                    if(user.tervenDate == null) {
                        alert('La data di iscrizione al Terven dell\'utente '
                            + user.name + ' ' + user.surname + ' è stata resettata');
                    } else {
                        alert('La data di iscrizione al Terven dell\'utente '
                            + user.name + ' ' + user.surname + ' è stata impostata a ' + user.tervenDate);
                    }
                }
            });
        }

        /*
         * Single payment. Ask to insert a single access with same date
         */
        else if(payment.type == $rootScope.PAYMENT_SINGLE && !deleting) {
            if(confirm('Aggiungere un accesso singolo relativo al pagamento effettuato?')) {
                var newAccess = {"userId": payment.userId, "date": payment.date, "operator": $rootScope.operator.operator, "type": $rootScope.ACCESS_SINGLE};
                dataFactory.addAccess(newAccess).then(function (){
                    alert('Accesso inserito con data ' + newAccess.date);
                });
            }
        }
    }
}]);
