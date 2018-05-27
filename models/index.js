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
            console.log('Success at '+(new Date(data.date)));
        });
	}
}

//users.create({username: 'testfoo2', password: '1234567'}, _validate);
//users.authenticate('testfoo2', '1234567', _validate);
//users.findById('asjkd-askdlj-askdj-askljd', _validate);
//users.findById('asjkd-askdlj-askdj-askljd', _insert);

query_params = {
	offset: 0,
	orderby: 'cost'
}
records.retrieve('asjkd-askdlj-askdj-askljd', query_params, function(err, rows){
	if(err) {
		console.log('INDEX ERR '+err);
	} else {
		console.log(rows);
	}
});

