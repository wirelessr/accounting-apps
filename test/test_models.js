/* mocha --timeout 15000 */
const User = require('../models/users');
const records = require('../models/records');
const assert = require('should');

describe('test users', function() {
  var uid;

  it('test create', function(done) {
      User.create({username: 'unittest', password: 'unittest'}, function(err, user) {
          assert.exist(user);
          assert.equal(user.username, 'unittest');
          uid = user.uid;
          done();
      });
  });

  it('test auth', function(done) {
      User.authenticate('unittest', 'unittest', function(err, user) {
          assert.exist(user);
          assert.equal(user.username, 'unittest');
          assert.equal(user.uid, uid);
          done();
      });
  });

  it('test del', function(done) {
      User.delById(uid, function() {
          User.findById(uid, function(err, user) {
              assert.not.exist(user);
              assert.equal(err.status, 404);
              done();
          });
      });
  });
});

describe('test records', function() {
    var uid;
    var v = Math.floor((Math.random() * 100) + 1); 
    var t = Math.floor((Math.random() * 10) + 1);
    var start_ts;

    before(function(done) {
        User.create({username: 'unittest', password: 'unittest'}, function(err, user) {
            assert.exist(user);
            assert.equal(user.username, 'unittest');
            uid = user.uid;
            done();
        });
    });

    after(function(done) {
        User.delById(uid, function() {
            User.findById(uid, function(err, user) {
                assert.not.exist(user);
                assert.equal(err.status, 404);
                done();
            });
        });
    });

    it('test insert', done => {
        data = {cost: v, type: t, note: 'oxox'};
        start_ts = new Date().getTime();
        records.create(uid, data, function(err, data){
            assert.ok(data.date > 0);
            done();
        });
    });

    it('test retrieve', done => {
        var end_ts = new Date().getTime();
        var query_params = {
            offset: 0,
            orderby: 'cost',
            query: 'date >= '+start_ts+' and date < '+end_ts
        }
        records.retrieve(uid, query_params, function(err, rows){
            assert.exist(rows);
            assert.equal(rows.length, 1);
            assert.equal(rows[0].cost, v);
            assert.equal(rows[0].type, t);
            done();
        });
    });
});
