var async = require('async');
var users = require('./users');

function _validate(err, user)
{
	if(err) {console.log(err);}
	else {
		console.log(user.uid);
	}
}

//users.create({account: 'testfoo', password: '1234567'}, _validate);
//users.authenticate('testfoo', '1234567', _validate);
users.findById('asjkd-askdlj-askdj-askljd', _validate);


