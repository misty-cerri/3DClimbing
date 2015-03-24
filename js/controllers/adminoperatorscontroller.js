/**
 * Created by m.cervini on 13/10/2014.
 */
app.controller('OperatorController', ['$scope', '$rootScope', 'dataFactory', '$modal',
    function($scope, $rootScope, dataFactory, $modal){

    console.log($rootScope.operator);
    console.log($rootScope.operator.operator);
    console.log($rootScope.operator.canAdd);
    var controller = this;
    $scope.operators=[];
    var currentOperator;

    controller.refreshList = function(){
        console.log('refreshing operator list');
        dataFactory.getAllOperators().then(function(data){
            $scope.operators = data;
        }, function(err){
            $window.alert(err);
        });
    };

    controller.newOperator = function() {
        controller.openModalOperator();
    }

    controller.editOperator = function(op) {
        controller.currentOperator = op;
        controller.openModalEditOperator();
    }

    controller.openModalOperator = function () {
        var modalWindow = $modal.open({
            templateUrl: '../../pages/newoperator.html',
            controller: 'ModalEditObjectController',
            size: 'sg',
            resolve: {
                current: function () {
                    return controller.currentOperator;
                },
                validationFunction: function () {
                    return controller.checkPassword;
                }
            }
        });

        modalWindow.result.then(function(current){
            controller.currentOperator = current;
            controller.addOperator();
        }, function () {
            //console.info('Modal dismissed at: ' + new Date());
        });
    }

    controller.addOperator = function(){
        if(controller.currentOperator != null) {
            if(controller.currentOperator.key == null) {
                controller.currentOperator.password = window.btoa(controller.currentOperator.password);
                dataFactory.addOperator(controller.currentOperator).then(function(){
                    controller.refreshList();
                    //$scope.user = null;
                }, function(err){
                    $window.alert(err);
                });
            }
        }
    };

    controller.openModalEditOperator = function () {
        var modalWindow = $modal.open({
            templateUrl: '../../pages/editoperator.html',
            controller: 'ModalEditObjectController',
            size: 'sg',
            resolve: {
                current: function () {
                    var editingOperator = new Object();
                    editingOperator.operator = controller.currentOperator.operator;
                    editingOperator.newPassword = window.atob(controller.currentOperator.password);
                    editingOperator.confirmPassword = window.atob(controller.currentOperator.password);
                    editingOperator.canAdd = controller.currentOperator.canAdd;
                    editingOperator.canEdit = controller.currentOperator.canEdit;
                    editingOperator.canDelete = controller.currentOperator.canDelete;
                    return editingOperator;
                },
                validationFunction: function () {
                    return controller.checkPassword;
                }
            }
        });

        modalWindow.result.then(function(current){
            controller.updateOperator(current);
            return false;
        }, function () {
            //console.info('Modal dismissed at: ' + new Date());
        });
    }

    controller.updateOperator = function(editingOperator){
        console.log('updating operator ' + controller.currentOperator.operator);
        controller.currentOperator.password = window.btoa(editingOperator.newPassword);
        controller.currentOperator.canAdd = editingOperator.canAdd;
        controller.currentOperator.canDelete = editingOperator.canDelete;
        controller.currentOperator.canEdit = editingOperator.canEdit;
        dataFactory.updateOperator(controller.currentOperator);
        //dataFactory.addOperator(controller.currentOperator);
        alert('Operatore aggiornato');
    };

    controller.deleteOperator = function(key){
        console.log('deleting operator ' + key);
        if(confirm("Cancellare l'operatore?")) {
            dataFactory.deleteOperator(key).then(function(){
                controller.refreshList();
            }, function(err){
                $window.alert(err);
            });
        }
    };

    controller.checkPassword = function(current) {
        if(current.newPassword == undefined || current.newPassword == '') {
            alert('Seleziona una nuova password');
            return false;
        }
        if(current.newPassword == current.confirmPassword) {
            return true;
        } else {
            alert('Le due password non corrispondono');
            return false;
        }
    }

    function init(){
        dataFactory.open().then(function(){
            controller.refreshList();
        });
    }
    init();
}]);
