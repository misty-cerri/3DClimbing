/**
 * Created by m.cervini on 13/10/2014.
 */
var today = new Date();
today.setHours(0,0,0,0);
app.filter('terven', function () {
    return function (date) {
        return date < today ? 1 : 0;
    };
})
