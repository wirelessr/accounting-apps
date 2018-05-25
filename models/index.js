var async = require('async');
var users = require('./users');
var records = require('./records');

function _validate(err, user)
{
	if(err) {console.log(err);}
	else {
		console.log(user.uid);
	}
}

function _insert(err, user)
{
	if(err) {console.log(err);}
	else {
        data = {cost: 100, type: 1, note: 'oxox'};
        records.create(user.uid, data, function(err, data){
            console.log('Success at '+data.date);
        });
	}
}

//users.create({account: 'testfoo', password: '1234567'}, _validate);
//users.authenticate('testfoo', '1234567', _validate);
//users.findById('asjkd-askdlj-askdj-askljd', _validate);
users.findById('asjkd-askdlj-askdj-askljd', _insert);


