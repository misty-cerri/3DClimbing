/**
 * Created by m.cervini on 30/09/2014.
 */
app.controller('UserController', ['$scope', '$http', 'dataFactory', '$modal', '$filter',
    function($scope, $http, dataFactory, $modal, $filter){

    //$scope.test = 'ng is working';
    //var vm = this;

    var controller = this;
    $scope.users=[];
    var currentUser;
    var today = new Date();
    today.setHours(0,0,0,0);
    var tableParams;

    controller.refreshList = function(){
        dataFactory.getAllUsers().then(function(data){
            $scope.users = $filter('filter')(data, $scope.searchText);
            //$scope.users = data;
        }, function(err){
            $window.alert(err);
        });
    };

    controller.addUser = function(){
        if(controller.currentUser != null) {
            if(controller.currentUser.key == null) {
                dataFactory.addUser(controller.currentUser).then(function(){
                    $scope.searchText = controller.currentUser.name;
                    controller.refreshList();
                    //$scope.user = null;
                }, function(err){
                    $window.alert(err);
                });
            } else {
                dataFactory.updateUser(controller.currentUser).then(function(){
                    controller.refreshList();
                    //$scope.user = null;
                }, function(err){
                    $window.alert(err);
                });
            }
        }
    };

    controller.deleteUser = function(key){
        if(confirm("Cancellare l'utente?")) {
            dataFactory.deleteUser(key).then(function(){

                /*
                 * Delete user accesses
                 */
                dataFactory.getUserAccesses(key).then(function(accesses){
                    angular.forEach(accesses, function (value) {
                        console.log('deleting access ' + value.key);
                        dataFactory.deleteAccess(value.key);
                    }, null);
                });

                /*
                 * Delete user payments
                 */
                dataFactory.getUserPayments(key).then(function(payments){
                    angular.forEach(payments, function (value) {
                        console.log('deleting payment ' + value.key);
                        dataFactory.deletePayment(value.key);
                    }, null);
                });
                controller.refreshList();
            }, function(err){
                $window.alert(err);
            });
        }
    };

    controller.openModalUser = function () {
        var modalWindow = $modal.open({
            templateUrl: '../../pages/edituser.html',
            controller: 'ModalEditObjectController',
            size: 'lg',
            resolve: {
                current: function () {
                    return controller.currentUser;
                },
                validationFunction: function(){}
            }
        });

        modalWindow.result.then(function(current){
            controller.currentUser = current;
            controller.addUser();
        }, function () {
            //console.info('Modal dismissed at: ' + new Date());
        });
    }

    controller.newUser = function() {
        dataFactory.getMaxUserCode().then(function(data){
            controller.currentUser = null;
            controller.currentUser = new Object();
            controller.currentUser.code = data;
            controller.openModalUser();
        });
    }

    controller.editUser = function (selectedUser) {
        if(selectedUser != null) {
            setCurrentUser(selectedUser);
        }
        controller.openModalUser();
    };

    controller.openModalAccesses = function (selectedUser) {
        if(selectedUser != null) {
            controller.currentUser = selectedUser;
        } else {
            controller.currentUser = null;
        }
        var modalWindow = $modal.open({
            templateUrl: '../../pages/useraccesses.html',
            controller: 'ModalEditObjectController',
            resolve: {
                current: function () {
                    console.log('Accesses for user ' + JSON.stringify(controller.currentUser));
                    return controller.currentUser;
                },
                validationFunction: function(){}
            }
        });

        modalWindow.result.then(null, function () {
            controller.refreshList();
            //console.info('Modal dismissed at: ' + new Date());
        });
    };

    controller.openModalPayments = function (selectedUser) {
        //console.log(JSON.stringify(selectedUser));
        if(selectedUser != null) {
            controller.currentUser = selectedUser;
        } else {
            controller.currentUser = null;
        }
        var modalWindow = $modal.open({
            templateUrl: '../../pages/userpayments.html',
            controller: 'ModalEditObjectController',
            size: 'lg',
            resolve: {
                current: function () {
                    return controller.currentUser;
                },
                validationFunction: function(){}
            }
        });

        modalWindow.result.then(null, function () {
            controller.refreshList();
        });
    };

    controller.checkTervenDate = function(tervenDate) {
        //if(tervenDate <= today) {
        //}
        /*
         var timeDiff = Math.abs(today.getTime() - tervenDate.getTime());
         if(Math.ceil(timeDiff / (1000 * 3600 * 24)) < 365) {
         */
        //console.log(today.getMonth() - tervenDate.getMonth());
        if(tervenDate != null) {
            //Stesso anno siamo dopo maggio
            if((today.getYear() - tervenDate.getYear()) == 0 && today.getMonth() >= 4 && tervenDate.getMonth() >= 4) {
                return true;
            }
            //L'anno dell'iscrizione è quello precedente ad oggi e siamo prima di maggio
            if((today.getYear() - tervenDate.getYear()) == 1 && today.getMonth() <= 4 && tervenDate.getMonth() >= 4) {
                return true;
            }
        }
        return false;
    };

    controller.checkClimbDate = function(climbDate) {
        /*
         var timeDiff = Math.abs(today.getTime() - climbDate.getTime());
         if(Math.ceil(timeDiff / (1000 * 3600 * 24)) < 365) {
         */
        if(climbDate != null && (today.getYear() - climbDate.getYear()) == 0) {
            return true;
        }
        return false;
    };

    controller.checkSubscriptionDate = function(subscriptionDate) {
        /*
        var timeDiff = Math.abs(today.getTime() - subscriptionDate.getTime());
        if(Math.ceil(timeDiff / (1000 * 3600 * 24)) < 365) {
        */
        if(subscriptionDate != null && (today.getYear() - subscriptionDate.getYear()) == 0) {
            return true;
        }
        return false;
    };

    controller.checkCaiDate = function(caiDate) {
        if(caiDate != null && (today.getYear() - caiDate.getYear()) == 0) {
            return true;
        }
        return false;
    }

    controller.checkFreeTrialDate = function(freeTrialDate) {
        //Se non esiste la data la prova ancora non è stata effettuata
        if(freeTrialDate == null) {
            return true;
        }
        //Se l'anno della prova è quello odierno la prova non è disponibile (ce n'è una all'anno)
        if(freeTrialDate != null && (today.getYear() - freeTrialDate.getYear()) == 0) {
            return false;
        }
        return true;
    };

    function init(){
        /*
        dataFactory.open().then(function(){
            controller.refreshList();
        });
        */
    }

    function setCurrentUser(user) {
        //alert(JSON.stringify(user));
        controller.currentUser = new Object();
        controller.currentUser.key = user.key;
        controller.currentUser.code = user.code;
        controller.currentUser.name = user.name;
        controller.currentUser.surname = user.surname;
        controller.currentUser.address = user.address;
        controller.currentUser.phone = user.phone;
        controller.currentUser.email = user.email;
        controller.currentUser.birthDate = user.birthDate;
        controller.currentUser.notes = user.notes;
        controller.currentUser.tervenDate = user.tervenDate;
        controller.currentUser.climbDate = user.climbDate;
        controller.currentUser.caiDate = user.caiDate;
        controller.currentUser.subscriptionDate = user.subscriptionDate;
        controller.currentUser.freeTrialDate = user.freeTrialDate;
    }
    init();
}]);