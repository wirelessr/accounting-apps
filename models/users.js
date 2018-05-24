var GoogleSpreadsheet = require('google-spreadsheet');
var doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID);
var users;
var async = require('async');

function setAuth(step) {
    var creds_json = {
        client_email: process.env.GOOGLE_ACCT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY
    }

    doc.useServiceAccountAuth(creds_json, step);
}

function getInfoAndWorksheets(step) {
    doc.getInfo(function(err, info) {
        console.log('Loaded doc: '+info.title+' by '+info.author.email);
        console.log(info.worksheets)
        users = info.worksheets.find(function(element) {
            return element.title == 'users';
        });
        step();
    });
}

module.exports.create = function(userdata, callback) {
    async.series([
        setAuth,
        getInfoAndWorksheets,
        function getData(step) {
            users.getRows({
                query: 'account == '+userdata.account
            }, function( err, rows ){
                console.log('Read '+rows.length+' rows');
                console.log('ROW: '+rows[0].account+', '+rows[0].password+', '+rows[0].email);
            });
        },
    ], function(err){
        if( err ) {
            console.log('Error: '+err);
        }
    });
}


