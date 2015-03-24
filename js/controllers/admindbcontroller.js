/**
 * Created by m.cervini on 09/10/2014.
 */
app.controller('DbController', ['$scope', '$http', 'dataFactory', '$q', function($scope, $http, dataFactory, $q){
//app.controller('DbController', ['$scope', '$http', 'dataFactory', '$q', function($scope, $http, dataFactory, $q){

    var controller = this;

    /*
    var uploader = $scope.uploader = new FileUploader({
        url: '#'
    });
    */

    $scope.alerts = [];

    controller.loadDb = function(){

        var files = document.getElementById('dbfile').files;
        if (!files.length) {
            alert('Selezionare un file da importare');
            return;
        }

        /*
        if(uploader.queue.length == 0) {
            alert('Selezionare un file da importare');
            return;
        }
        */

        if(confirm('Il database verrà ricaricato con il contenuto del file. I dati attuali verranno sovrascritti. Continuare?')) {

            try {
                var reader = new FileReader();
                reader.onload = function(e) {
                    var jsonContent = JSON.parse(e.target.result);
                    dataFactory.reloadDb(jsonContent)
                        .then(function(data){
                            console.log('db reloaded');
                            controller.addAlert('Database caricato correttamente', 'success');
                        }, function(err){
                            console.error('Error loading database');
                            controller.addAlert('Errore nel caricamento del database', 'danger');
                        });
                    //var users = jsonContent.db.users;
                    //var accesses = jsonContent.db.accesses;
                    //var payments = jsonContent.db.payments;
                    //alert(JSON.stringify(users));
                    //alert(JSON.stringify(accesses));
                    //alert(JSON.stringify(payments));
                };
                //reader.readAsBinaryString(uploader.queue[0]._file);
                reader.readAsBinaryString(files[0]);
            } catch (err) {
                console.error(err.message);
                alert('Impossibile leggere il contenuto del file selezionato');
            }
        }
    };

    controller.exportDb = function(){
        var jsonUsers;
        var jsonAccesses;
        var jsonPayments;
        var jsonOperators;

        var db = new Object();

        var first = dataFactory.getAllUsers;
        dataFactory.getAllUsers()
            .then(function(exportUsers){
                var deferred = $q.defer();
                var userList = new Object();
                userList.users = exportUsers;
                jsonUsers = JSON.stringify(userList);
                //alert('users ' + jsonUsers);
                db.users = exportUsers;
                deferred.resolve(jsonUsers);
                return deferred.promise;
            })
            .then(dataFactory.getAllAccesses)
            .then( function(exportAccesses){
                var deferred = $q.defer();
                var accessList = new Object();
                accessList.accesses = exportAccesses;
                jsonAccesses = JSON.stringify(accessList);
                //alert('accesses ' + jsonAccesses);
                db.accesses = exportAccesses;
                deferred.resolve(jsonAccesses);
                return deferred.promise;
            })
            .then(dataFactory.getAllPayments)
            .then(function(exportPayments){
                var deferred = $q.defer();
                var paymentList = new Object();
                paymentList.payments = exportPayments;
                jsonPayments = JSON.stringify(paymentList);
                //alert('payments ' + jsonPayments);
                db.payments = exportPayments;
                deferred.resolve(jsonPayments);
                return deferred.promise;
            })
            .then(dataFactory.getAllOperators)
            .then(function(exportOperators){
                var deferred = $q.defer();
                var operatorList = new Object();
                operatorList.operators = exportOperators;
                jsonOperators = JSON.stringify(operatorList);
                //alert('operators ' + jsonOperators);
                db.operators = exportOperators;
                deferred.resolve(jsonOperators);
                return deferred.promise;
            })
            .then(function(){
                var today = new Date();
                var filename = today.getDate() + "_" +  (today.getMonth()+1) + "_" + today.getFullYear();
                var link = document.createElement('a');
                var exportDb = new Object();
                exportDb.db = db;
                link.href = 'data:attachment/json,' + JSON.stringify(exportDb);
                link.target = "_blank";
                link.download = "db-snapshot-" + filename + ".json";
                link.click();
                controller.addAlert('Database esportato correttamente', 'success');
            });
    };

    controller.addAlert = function(msg, type) {
        $scope.alerts.push({
            msg: msg,
            type: type
        });
    };

    controller.closeAlert = function(index) {
        $scope.alerts.splice(index, 1);
    };

    controller.init = function() {
        var $inputFile = $("#dbfile");
        $inputFile.fileinput({
            showUpload: false,
            showRemove: false,
            showPreview: false,
            elErrorContainer: '#dbfileerror',
            allowedFileExtensions: ['json'],
            msgInvalidFileExtension: 'Il formato del file "{name}" non è corretto. Selezionare un file di tipo {extensions}'
        });
    }
}]);