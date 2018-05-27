const User = require('../models/users');
const records = require('../models/records');
const should = require('should')

function _validate(err, obj)
{
	console.log(obj);
	should.exist(obj);
	should.equal(obj.username, 'unittest');
}

describe('Test users', function(){
	it('create', done => {
		User.create({username: 'unittest', password: 'unittest'}, _validate);
		done();
	});

	it('authenticate', done => {
		User.authenticate('unittest', 'unittest', _validate);
		done();
	});

	it('get_by_id', done => {
		User.authenticate('unittest', 'unittest', function(err, user){
			User.findById(user.uid, _validate);
		});
		done();
	});

	it('del_by_id', done => {
		User.authenticate('unittest', 'unittest', function(err, user){
			User.delById(user.uid);
		});
		User.authenticate('unittest', 'unittest', function(err, user){
			should.equal(err.status, 403);
		});
		done();
	});

});
