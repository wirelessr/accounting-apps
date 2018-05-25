var GoogleSpreadsheet = require('google-spreadsheet');
var doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID);
var records;
var async = require('async');
var HEADER = ['date', 'cost', 'note', 'type'];

function setAuth(step) {
    console.log('setAuth');
    var creds_json = {
        client_email: process.env.GOOGLE_ACCT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY
    }

    doc.useServiceAccountAuth(creds_json, step);
}

module.exports.create = function(uid, data, callback) {
    async.series([
        setAuth,
        function _getWorksheet(step) {
            console.log('getWorksheet');
            doc.getInfo(function(err, info) {
                console.log('Loaded doc: '+info.title+' by '+info.author.email);
                records = info.worksheets.find(function(element) {
                    return element.title == uid;
                });
                step();
            });
        },
        function _checkWorksheet(step) {
            if(!records) {
                doc.addWorksheet({
                    title: uid,
                    headers: HEADER
                }, function(err, sheet){
                    records = sheet;
                    step();
                });
            } else {
                step();
            }
        },
        function _create(step) {
            console.log('insert a record')
            data.date = new Date();
            records.addRow(data, callback);
            step();
        }
    ], function(err) {
        if(err) {
            console.log(err);
        }
        console.log('Create finished');
    });
}
