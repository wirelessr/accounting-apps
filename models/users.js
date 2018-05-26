var GoogleSpreadsheet = require('google-spreadsheet');
var doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID);
var async = require('async');

function _uuid() {
	var d = Date.now();
	if (typeof performance !== 'undefined' && typeof performance.now === 'function'){
		d += performance.now(); //use high-precision timer if available
	}
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
			var r = (d + Math.random() * 16) % 16 | 0;
			d = Math.floor(d / 16);
			return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
			});
}

function setAuth(step) {
    console.log('setAuth');
    var creds_json = {
        client_email: process.env.GOOGLE_ACCT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY
    }

    doc.useServiceAccountAuth(creds_json, step);
}

function getInfoAndWorksheets(next) {
    console.log('getInfoAndWorksheets');
    doc.getInfo(function(err, info) {
        console.log('Loaded doc: '+info.title+' by '+info.author.email);
        users = info.worksheets.find(function(element) {
            return element.title == 'users';
        });
        next(err, users);
    });
}

module.exports.create = function(userdata, callback) {
    async.waterfall([
        setAuth,
        getInfoAndWorksheets,
        function _create(users, step) {
            users.getRows({
                query: 'username == '+userdata.username
            }, function( err, rows ){
                if(rows.length) {
                    console.log('Read '+rows.length+' rows');
                    console.log('ROW: '+rows[0].username+', '+rows[0].password+', '+rows[0].email);
					err = new Error('Already existed');
					err.status = 403;
					callback(err);
                } else {
					userdata.uid = _uuid();
                    users.addRow(userdata, function(){});
					callback(err, userdata);
                }
            });
        },
    ], function(err){
        if( err ) {
            console.log('Error: '+err);
        }
		console.log('Create finished');
    });
}

module.exports.authenticate = function(acct, passwd, callback) {
	async.waterfall([
		setAuth,
		getInfoAndWorksheets,
		function _authenticate(users, step) {
            console.log(acct+', '+passwd);
			users.getRows({
				query: 'username =='+acct+' and password =='+passwd
			}, function(err, rows) {
				if(rows && rows.length) {
					callback(err, rows[0]);
				} else {
					err = new Error('Auth failed');
					err.status = 403;
					callback(err);
				}
			});
		},
	], function(err){
        if( err ) {
            console.log('Error: '+err);
        }
		console.log('Authenticate finished');
	});
}

module.exports.findById = function(uid, callback) {
	async.waterfall([
		setAuth,
		getInfoAndWorksheets,
		function _findById(users, step) {
			users.getRows({
				query: 'uid =='+uid
			}, function(err, rows) {
				if(rows.length) {
					callback(err, rows[0]);
				} else {
					err = new Error('Not existed');
					err.status = 404;
					callback(err);
				}
			});
		},
	], function(err){
        if( err ) {
            console.log('Error: '+err);
        }
		console.log('Find finished');
	});
}

