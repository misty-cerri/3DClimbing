/**
 * Created by m.cervini on 28/09/2014.
 */
app.factory('dataFactory', function($window, $q, $http){

    var dbNotOpenMessage = 'Indexed db not opened yet!';
    var indexedDB = $window.indexedDB;
    var db = null;
    var userOS = '3DC-users';
    var accessOS = '3DC-accesses';
    var paymentsOS = '3DC-payments';
    var operatorOS = '3DC-operators';

    var inputDb;

    /*
    Open the db
     */
    var open = function(){

        var version = 1;
        var deferred = $q.defer();
        var request = indexedDB.open("3DC-db", version);

        request.onupgradeneeded = function(e) {
            db = e.target.result;

            e.target.transaction.onerror = indexedDB.onerror;

            if(db.objectStoreNames.contains(userOS)) {
                db.deleteObjectStore(userOS);
            }
            if(db.objectStoreNames.contains(accessOS)) {
                db.deleteObjectStore(accessOS);
            }
            if(db.objectStoreNames.contains(paymentsOS)) {
                db.deleteObjectStore(paymentsOS);
            }
            if(db.objectStoreNames.contains(operatorOS)) {
                db.deleteObjectStore(operatorOS);
            }

            var usersStore = db.createObjectStore(userOS, {keyPath: "key"});
            var accessStore = db.createObjectStore(accessOS, { autoIncrement : true});
            var paymentsStore = db.createObjectStore(paymentsOS, { autoIncrement : true});
            var operatorsStore = db.createObjectStore(operatorOS, {autoIncrement : true});

            usersStore.createIndex('userCode', 'code', {unique: true});
            accessStore.createIndex('userId', 'userId', {unique: false});
            accessStore.createIndex('date', 'date', {unique: false});
            paymentsStore.createIndex('userId', 'userId', {unique: false});
            paymentsStore.createIndex('date', 'date', {unique: false});
            operatorsStore.createIndex('operator', 'operator', {unique: true});

        };

        request.onsuccess = function(e) {
            db = e.target.result;
            deferred.resolve();
        };

        request.onerror = function(){
            deferred.reject();
        };

        return deferred.promise;
    };

    var reloadDb = function(input) {
        inputDb = input;
        return deleteAllUsers().then(deleteAllAccesses).then(deleteAllPayments).then(deleteAllOperators).then(loadDbFromData);
    }

    var loadDbFromData = function() {
        var deferred = $q.defer();

        var users = inputDb.db.users;
        var accesses = inputDb.db.accesses;
        var payments = inputDb.db.payments;
        var operators = inputDb.db.operators;
        if(users != undefined) {
            angular.forEach(users, function (value) {
                updateUser(value);
            }, null);
            console.log(users.length + ' users loaded');
        } else {
            console.log('No user to load');
            //deferred.reject('loadDbFromData: error while loading users');
        }

        if(accesses != undefined) {
            angular.forEach(accesses, function (value) {
                addAccess(value);
            }, null);
            console.log(accesses.length + ' accesses loaded');
        } else {
            console.log('No access to load');
            //deferred.reject('loadDbFromData: error while loading accesses');
        }

        if(payments != undefined) {
            angular.forEach(payments, function (value) {
                addPayment(value);
            }, null);
            console.log(payments.length + ' payments loaded');
        } else {
            console.log('No payment to load');
            //deferred.reject('loadDbFromData: error while loading payments');
        }

        if(operators != undefined) {
            angular.forEach(operators, function (value) {
                addOperator(value);
            }, null);
            console.log(operators.length + ' operators loaded');
        } else {
            console.log('No operator to load');
            //deferred.reject('loadDbFromData: error while loading operators');
        }

        deferred.resolve();

        /*
        $http.get('data/db.json').success(function(data, status, headers, config) {
        });
        */
        return deferred.promise;
    }

    /*
     Add a new access
     */
    var addAccess = function(access){
        var deferred = $q.defer();
        if(db === null){
            deferred.reject(dbNotOpenMessage);
        }
        else {

            var trans = db.transaction([accessOS], "readwrite");
            var store = trans.objectStore(accessOS);

            var request = store.put({
                "userId": access.userId,
                "date": normalizeDate(access.date),
                "operator": access.operator,
                "type": access.type
                //"single": access.single
            });

            request.onsuccess = function(e) {
                deferred.resolve();
            };

            request.onerror = function(e) {
                deferred.reject("An error occurred while inserting access!");
                console.log(e.value);
            };
        }
        return deferred.promise;
    };

    /*
     Add a new payment
     */
    var addPayment = function(payment){
        var deferred = $q.defer();
        if(db === null){
            deferred.reject(dbNotOpenMessage);
        }
        else {

            var trans = db.transaction([paymentsOS], "readwrite");
            var store = trans.objectStore(paymentsOS);

            var request = store.put({
                "userId": payment.userId,
                "date": normalizeDate(payment.date),
                "operator": payment.operator,
                "amount": payment.amount,
                "type": payment.type
            });

            request.onsuccess = function(e) {
                deferred.resolve();
            };

            request.onerror = function(e) {
                deferred.reject("An error occurred while inserting payment!");
                console.log(e.value);
            };
        }
        return deferred.promise;
    };

    /*
     Add a new operator
     */
    var addOperator = function(operator){
        var deferred = $q.defer();
        if(db === null){
            deferred.reject(dbNotOpenMessage);
        }
        else {
            console.log('adding operator ' + JSON.stringify(operator));
            var trans = db.transaction([operatorOS], "readwrite");
            var store = trans.objectStore(operatorOS);
            console.log('adding operator: ' + operator.operator);
            var request = store.put({
                "operator": operator.operator,
                "password": operator.password,
                "canDelete": operator.canDelete,
                "canEdit": operator.canEdit,
                "canAdd": operator.canAdd
            });

            request.onsuccess = function(e) {
                deferred.resolve();
            };

            request.onerror = function(e) {
                deferred.reject("An error occurred while inserting operator!");
                console.log(e.value);
            };
        }
        return deferred.promise;
    };

    /*
     Updatr operator
     */
    var updateOperator = function(operator){
        var deferred = $q.defer();
        if(db === null){
            deferred.reject(dbNotOpenMessage);
        }
        else {
            console.log('updating operator ' + JSON.stringify(operator));
            var trans = db.transaction([operatorOS], "readwrite");
            var store = trans.objectStore(operatorOS);
            var index = store.index("operator");
            var singleKeyRange = IDBKeyRange.only(operator.operator);
            var oldOperator;
            var cursorRequest = index.openCursor(singleKeyRange);
            cursorRequest.onsuccess = function(e) {
                var result = e.target.result;
                if(result === null || result === undefined)
                {
                    if(operator == null) {
                        deferred.reject('Impossibile trovare l\'operatore');
                    } else {
                        deferred.resolve(oldOperator);
                    }
                }
                else {
                    console.log('updating ' + JSON.stringify(result.value));
                    result.value.password = operator.password;
                    result.value.canDelete = operator.canDelete;
                    result.value.canEdit = operator.canEdit;
                    result.value.canAdd = operator.canAdd;
                    result.update(result.value);
                    console.log('updated ' + JSON.stringify(result.value));
                    result.continue();
                }
            };

            cursorRequest.onerror = function(e){
                console.log(e);
                deferred.reject("An error occurred while reading operator!");
            };
        }
        return deferred.promise;
    };

    /*
    Delete all the users from the database
     */
    var deleteAllUsers = function() {
        var deferred = $q.defer();
        if(db === null){
            deferred.reject(dbNotOpenMessage);
        } else {
            var trans = db.transaction([userOS], "readwrite");
            var store = trans.objectStore(userOS);
            var users = [];
            // Get every user
            var keyRange = IDBKeyRange.lowerBound(0);
            var cursorRequest = store.openCursor(keyRange);
            cursorRequest.onsuccess = function(e) {
                var result = e.target.result;
                if(result === null || result === undefined) {
                    console.log('All users deleted');
                    deferred.resolve();
                }
                else {
                    //Delete every user one by one
                    deleteUser(result.key)
                    result.continue();
                }
            };
            cursorRequest.onerror = function(e){
                console.log(e.value);
                deferred.reject("An error occurred while reading users!");
            };
        }
        return deferred.promise;
    }

    /*
     Delete all the accesses from the database
     */
    var deleteAllAccesses = function() {
        var deferred = $q.defer();
        if(db === null){
            deferred.reject(dbNotOpenMessage);
        } else {
            var trans = db.transaction([accessOS], "readwrite");
            var store = trans.objectStore(accessOS);
            var users = [];
            // Get every access
            var keyRange = IDBKeyRange.lowerBound(0);
            var cursorRequest = store.openCursor(keyRange);
            cursorRequest.onsuccess = function(e) {
                var result = e.target.result;
                if(result === null || result === undefined) {
                    console.log('All accesses deleted');
                    deferred.resolve();
                }
                else {
                    //Delete every access one by one
                    deleteAccess(result.key)
                    result.continue();
                }
            };
            cursorRequest.onerror = function(e){
                console.log(e.value);
                deferred.reject("An error occurred while reading accesses!");
            };
        }
        return deferred.promise;
    }

    /*
     Delete all the payments from the database
     */
    var deleteAllPayments = function() {
        var deferred = $q.defer();
        if(db === null){
            deferred.reject(dbNotOpenMessage);
        } else {
            var trans = db.transaction([paymentsOS], "readwrite");
            var store = trans.objectStore(paymentsOS);
            var users = [];
            // Get every payment
            var keyRange = IDBKeyRange.lowerBound(0);
            var cursorRequest = store.openCursor(keyRange);
            cursorRequest.onsuccess = function(e) {
                var result = e.target.result;
                if(result === null || result === undefined) {
                    console.log('All payments deleted');
                    deferred.resolve();
                }
                else {
                    //Delete every payment one by one
                    deletePayment(result.key)
                    result.continue();
                }
            };
            cursorRequest.onerror = function(e){
                console.log(e.value);
                deferred.reject("An error occurred while reading payments!");
            };
        }
        return deferred.promise;
    }

    /*
     Delete all operators from the database
     */
    var deleteAllOperators = function() {
        var deferred = $q.defer();
        if(db === null){
            deferred.reject(dbNotOpenMessage);
        } else {
            var trans = db.transaction([operatorOS], "readwrite");
            var store = trans.objectStore(operatorOS);
            var operators = [];
            // Get every operator
            var keyRange = IDBKeyRange.lowerBound(0);
            var cursorRequest = store.openCursor(keyRange);
            cursorRequest.onsuccess = function(e) {
                var result = e.target.result;
                if(result === null || result === undefined) {
                    console.log('All operators deleted');
                    deferred.resolve();
                }
                else {
                    //Delete every operator one by one
                    console.log('deleting ' + JSON.stringify(result));
                    deleteOperator(result.key)
                    result.continue();
                }
            };
            cursorRequest.onerror = function(e){
                console.log(e.value);
                deferred.reject("An error occurred while deleting operators!");
            };
        }
        return deferred.promise;
    }

    /*
    Get all the users
     */
    var getAllUsers = function(){

        var deferred = $q.defer();

        if(db === null){

            deferred.reject(dbNotOpenMessage);

        } else {

            var trans = db.transaction([userOS], "readwrite");
            var store = trans.objectStore(userOS);
            var users = [];

            // Get every user in the store;
            var keyRange = IDBKeyRange.lowerBound(0);
            var cursorRequest = store.openCursor(keyRange);

            cursorRequest.onsuccess = function(e) {

                var result = e.target.result;
                if(result === null || result === undefined)
                {
                    deferred.resolve(users);
                }
                else{
                    users.push(result.value);
                    result.continue();
                }
            };

            cursorRequest.onerror = function(e){
                console.log(e.value);
                deferred.reject("An error occurred while reading users!");
            };
        }

        return deferred.promise;
    }

    /*
     Get all the users
     */
    var getUser = function(key){

        var deferred = $q.defer();

        if(db === null){

            deferred.reject(dbNotOpenMessage);

        } else {

            var trans = db.transaction([userOS], "readonly");
            var store = trans.objectStore(userOS);

            // Get user by key
            var request = store.get(key);
            request.onsuccess = function(e) {
                var result = e.target.result;
                if(result === null || result === undefined)
                {
                    deferred.reject('User not found');
                }
                else{
                    deferred.resolve(result);
                }
            };
            request.onerror = function(e){
                console.log(e.value);
                deferred.reject("An error occurred while reading users!");
            };
        }
        return deferred.promise;
    }

    /*
     Get all the users
     */
    var getOperator = function(op){

        var deferred = $q.defer();
        if(db === null){
            deferred.reject(dbNotOpenMessage);
        } else {
            var trans = db.transaction([operatorOS], "readwrite");
            var store = trans.objectStore(operatorOS);
            var index = store.index("operator");
            var singleKeyRange = IDBKeyRange.only(op);
            var operator;
            var cursorRequest = index.openCursor(singleKeyRange);
            cursorRequest.onsuccess = function(e) {
                var result = e.target.result;
                if(result === null || result === undefined)
                {
                    if(operator == null) {
                        deferred.reject('Impossibile trovare l\'utente specificato');
                    } else {
                        deferred.resolve(operator);
                    }

                }
                else {
                    operator = result.value;
                    operator.key = result.primaryKey;
                    result.continue();
                }
            };

            cursorRequest.onerror = function(e){
                console.log(e.value);
                deferred.reject("An error occurred while reading operator!");
            };
        }
        return deferred.promise;
    }

    /*
    Add an already existing user (with a key already assigned)
     */
    var updateUser = function(user){
        var deferred = $q.defer();
        if(db === null){
            deferred.reject(dbNotOpenMessage);
        }
        else {

            var trans = db.transaction([userOS], "readwrite");
            var store = trans.objectStore(userOS);
            console.log('storing user ' + JSON.stringify(user));
            var request = store.put({
                "key": user.key,
                "code": user.code,
                "name": user.name,
                "surname": user.surname,
                "address": user.address,
                "phone": user.phone,
                "email": user.email,
                "regDate": normalizeDate(user.regDate),
                "birthDate": normalizeDate(user.birthDate),
                "notes": user.notes,
                "tervenDate": normalizeDate(user.tervenDate),
                "climbDate": normalizeDate(user.climbDate),
                "caiDate": normalizeDate(user.caiDate),
                "subscriptionDate": normalizeDate(user.subscriptionDate),
                "freeTrialDate": normalizeDate(user.freeTrialDate)
            });

            request.onsuccess = function(e) {
                deferred.resolve();
            };

            request.onerror = function(e) {
                deferred.reject("An error occurred while updating user!");
                console.log("An error occurred while updating user: " + JSON.stringify(user));
                console.log(e.value);
            };
        }
        return deferred.promise;
    };
    /*
     Add a new user (generate a new key)
     */
    var addUser = function(user){
        var deferred = $q.defer();
        if(db === null){
            deferred.reject(dbNotOpenMessage);
        }
        else {

            var trans = db.transaction([userOS], "readwrite");
            var store = trans.objectStore(userOS);

            var newKey = 1;
            var keyRange = IDBKeyRange.lowerBound(0);
            var cursorRequest = store.openCursor(keyRange, "prev").onsuccess = function(event) {
                var cursor = event.target.result;

                if (cursor) {
                    //alert("Key: " + cursor.key + ", Name: " + cursor.value.name + ", User key: " + cursor.value.key);
                    newKey = cursor.key + 1;
                }
                var request = store.put({
                    "key": newKey,
                    "code": user.code,
                    "name": user.name,
                    "surname": user.surname,
                    "address": user.address,
                    "phone": user.phone,
                    "email": user.email,
                    "regDate": new Date(),
                    "birthDate": normalizeDate(user.birthDate),
                    "notes": user.notes,
                    "tervenDate": normalizeDate(user.tervenDate),
                    "climbDate": normalizeDate(user.climbDate),
                    "caiDate": normalizeDate(user.caiDate),
                    "subscriptionDate": normalizeDate(user.subscriptionDate),
                    "freeTrialDate": normalizeDate(user.freeTrialDate)
                });

                request.onsuccess = function(e) {
                    deferred.resolve();
                };

                request.onerror = function(e) {
                    deferred.reject("New user couldn't be added!");
                    console.log(e.value);
                };
            }
        }
        return deferred.promise;
    };

    var deleteUser = function(key){

        var deferred = $q.defer();
        if(db === null){
            deferred.reject(dbNotOpenMessage);
        }
        else{
            var trans = db.transaction([userOS], "readwrite");
            var store = trans.objectStore(userOS);
            var request = store.delete(key);
            request.onsuccess = function(e) {
                deferred.resolve();
            };
            request.onerror = function(e) {
                console.log(e.value);
                deferred.reject("User couldn't be deleted");
            };
        }
        return deferred.promise;
    };

    var deleteAccess = function(key){

        var deferred = $q.defer();
        if(db === null){
            deferred.reject(dbNotOpenMessage);
        }
        else{
            var trans = db.transaction([accessOS], "readwrite");
            var store = trans.objectStore(accessOS);
            var request = store.delete(key);
            request.onsuccess = function(e) {
                deferred.resolve();
            };
            request.onerror = function(e) {
                console.log(e.value);
                deferred.reject("Access couldn't be deleted");
            };
        }
        return deferred.promise;
    };

    var deletePayment = function(key){

        var deferred = $q.defer();
        if(db === null){
            deferred.reject(dbNotOpenMessage);
        }
        else{
            var trans = db.transaction([paymentsOS], "readwrite");
            var store = trans.objectStore(paymentsOS);
            var request = store.delete(key);
            request.onsuccess = function(e) {
                deferred.resolve();
            };
            request.onerror = function(e) {
                console.log(e.value);
                deferred.reject("Payment couldn't be deleted");
            };
        }
        return deferred.promise;
    };

    var deleteOperator = function(key){

        var deferred = $q.defer();
        if(db === null){
            deferred.reject(dbNotOpenMessage);
        }
        else{
            var trans = db.transaction([operatorOS], "readwrite");
            var store = trans.objectStore(operatorOS);
            var request = store.delete(key);
            request.onsuccess = function(e) {
                deferred.resolve();
            };
            request.onerror = function(e) {
                console.log(e.value);
                deferred.reject("operator couldn't be deleted");
            };
        }
        return deferred.promise;
    };

    /*
    Get accesses of a single user
     */
    var getUserAccesses = function (userId){
        console.log('Getting accesses of user ' + userId);
        var deferred = $q.defer();
        if(db === null){
            deferred.reject(dbNotOpenMessage);
        } else {
            var trans = db.transaction([accessOS], "readwrite");
            var store = trans.objectStore(accessOS);
            var index = store.index("userId");
            var singleKeyRange = IDBKeyRange.only(userId);
            var accesses = [];

            var cursorRequest = index.openCursor(singleKeyRange);
            cursorRequest.onsuccess = function(e) {

                var result = e.target.result;
                //console.log(JSON.stringify(result));
                if(result === null || result === undefined)
                {
                    console.log('accesses are ' + accesses.length);
                    deferred.resolve(accesses);
                }
                else{
                    var access = result.value;
                    access.key = result.primaryKey;
                    accesses.push(access);
                    result.continue();
                }
            };

            cursorRequest.onerror = function(e){
                console.log(e.value);
                deferred.reject("An error occurred while reading user accesses!");
            };
        }
        return deferred.promise;
    }

    /*
     Get all the accesses
     */
    var getAllAccesses = function(){

        var deferred = $q.defer();
        if(db === null){
            deferred.reject(dbNotOpenMessage);
        } else {

            var trans = db.transaction([accessOS], "readwrite");
            var store = trans.objectStore(accessOS);
            var accesses = [];

            // Get every user in the store;
            var keyRange = IDBKeyRange.lowerBound(0);
            var cursorRequest = store.openCursor(keyRange);

            cursorRequest.onsuccess = function(e) {

                var result = e.target.result;
                if(result === null || result === undefined)
                {
                    deferred.resolve(accesses);
                }
                else{
                    accesses.push(result.value);
                    result.continue();
                }
            };

            cursorRequest.onerror = function(e){
                console.log(e.value);
                deferred.reject("An error occurred while reading accesses!");
            };
        }

        return deferred.promise;
    }

    var getMaxUserCode = function () {
        var deferred = $q.defer();
        if(db === null){
            deferred.reject(dbNotOpenMessage);
        } else {
            var trans = db.transaction([userOS], "readonly");
            var store = trans.objectStore(userOS);
            var index = store.index("userCode");

            var keyRange = IDBKeyRange.lowerBound(0);
            var cursorRequest = index.openCursor(keyRange, "prev");

            cursorRequest.onsuccess = function(event) {
                var cursor = event.target.result;
                var code = 1;
                if (cursor) {
                    if(cursor.value.code == null || cursor.value.code == undefined) {
                        code = 1;
                    } else {
                        code = cursor.value.code + 1;
                    }
                }
                deferred.resolve(code);
            }
            cursorRequest.onerror = function(e){
                console.log(e.value);
                deferred.reject("An error occurred while getting max code value!");
            };
        }
        return deferred.promise;
    }

    /*
     Get payments of a single user
     */
    var getUserPayments = function (userId){
        var deferred = $q.defer();
        if(db === null){
            deferred.reject(dbNotOpenMessage);
        } else {
            var trans = db.transaction([paymentsOS], "readwrite");
            var store = trans.objectStore(paymentsOS);
            var index = store.index("userId");
            var singleKeyRange = IDBKeyRange.only(userId);
            var payments = [];

            var cursorRequest = index.openCursor(singleKeyRange);
            cursorRequest.onsuccess = function(e) {
                var result = e.target.result;
                if(result === null || result === undefined)
                {
                    deferred.resolve(payments);
                }
                else{
                    var payment = result.value;
                    payment.key = result.primaryKey;
                    payments.push(payment);
                    result.continue();
                }
            };

            cursorRequest.onerror = function(e){
                console.log(e.value);
                deferred.reject("An error occurred while reading user payments!");
            };
        }
        return deferred.promise;
    }

    /*
     Get all the payments
     */
    var getAllPayments = function(){

        var deferred = $q.defer();
        if(db === null){
            deferred.reject(dbNotOpenMessage);
        } else {

            var trans = db.transaction([paymentsOS], "readwrite");
            var store = trans.objectStore(paymentsOS);
            var payments = [];

            // Get every user in the store;
            var keyRange = IDBKeyRange.lowerBound(0);
            var cursorRequest = store.openCursor(keyRange);

            cursorRequest.onsuccess = function(e) {
                var result = e.target.result;
                if(result === null || result === undefined)
                {
                    deferred.resolve(payments);
                }
                else{
                    payments.push(result.value);
                    result.continue();
                }
            };
            cursorRequest.onerror = function(e){
                console.log(e.value);
                deferred.reject("An error occurred while reading payments!");
            };
        }
        return deferred.promise;
    }

    /*
     Get all the payments
     */
    var getAllOperators = function(){

        var deferred = $q.defer();
        if(db === null){
            deferred.reject(dbNotOpenMessage);
        } else {

            var trans = db.transaction([operatorOS], "readwrite");
            var store = trans.objectStore(operatorOS);
            var operators = [];

            // Get every opèrator in the store;
            var keyRange = IDBKeyRange.lowerBound(0);
            var cursorRequest = store.openCursor(keyRange);

            cursorRequest.onsuccess = function(e) {
                var result = e.target.result;
                if(result === null || result === undefined)
                {
                    deferred.resolve(operators);
                }
                else{
                    var operator = result.value;
                    operator.key = result.primaryKey;
                    operators.push(operator);
                    result.continue();
                }
            };
            cursorRequest.onerror = function(e){
                console.log(e.value);
                deferred.reject("An error occurred while reading operators!");
            };
        }
        return deferred.promise;
    }

    function normalizeDate(input) {
        if(input != null) {
            return new Date(input);
        } else {
            return input;
        }
    }

    return {
        open: open,
        getAllUsers: getAllUsers,
        getMaxUserCode: getMaxUserCode,
        addUser: addUser,
        getUser: getUser,
        updateUser: updateUser,
        deleteUser : deleteUser,
        getUserAccesses: getUserAccesses,
        addAccess: addAccess,
        getAllAccesses: getAllAccesses,
        deleteAccess: deleteAccess,
        getAllPayments: getAllPayments,
        getUserPayments: getUserPayments,
        addPayment: addPayment,
        deletePayment: deletePayment,
        reloadDb: reloadDb,
        addOperator: addOperator,
        updateOperator: updateOperator,
        getOperator: getOperator,
        getAllOperators: getAllOperators,
        deleteOperator: deleteOperator
    };

});