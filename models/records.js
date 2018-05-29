var GoogleSpreadsheet = require('google-spreadsheet');
var doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID);
var records;
var async = require('async');
var HEADER = ['date', 'cost', 'note', 'type'];

function setAuth(step) {
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
            doc.getInfo(function(err, info) {
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
            data.date = (new Date()).getTime();
            records.addRow(data, callback);
            step();
        }
    ], function(err) {
        if(err) {
            console.log(err);
        }
    });
}

module.exports.retrieve = function(uid, query_params, callback) {
    async.waterfall([
        setAuth,
        function _getWorksheet(next) {
            doc.getInfo(function(err, info) {
                var record = info.worksheets.find(function(element) {
                    return element.title == uid;
                });
                next(err, record);
            });
        },
        function _retrieve(record, step) {
			if(record) {
				record.getRows(query_params, function(err, rows){
					rowdata = [];
					for(i=0; i<rows.length; i++) {
						rowdata.push({
							date: rows[i].date,
							cost: rows[i].cost,
							type: rows[i].type,
							note: rows[i].note,
							});
					}
					callback(err, rowdata);
				});
			}
			else {
				err = new Error('Not existed');
				err.status = 404;
				throw err;
			}
        }
    ], function(err) {
        if(err) {
            console.log(err);
        }
    });
}
