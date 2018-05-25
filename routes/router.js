var express = require('express');
var router = express.Router();
var User = require('../models/users');
var path = require('path');
var Record = require('../models/records');

// GET route for reading data
router.get('/', function (req, res, next) {
  return res.sendFile(path.join(process.cwd(), 'templateLogReg/index.html'));
});


//POST route for updating data
router.post('/', function (req, res, next) {
  // confirm that user typed same password twice
  if (req.body.password !== req.body.passwordConf) {
    var err = new Error('Passwords do not match.');
    err.status = 400;
    res.send("passwords dont match");
    return next(err);
  }

  if (req.body.email &&
    req.body.username &&
    req.body.password &&
    req.body.passwordConf) {

    var userData = {
      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
      passwordConf: req.body.passwordConf,
    }

    User.create(userData, function (error, user) {
      if (error) {
        return next(error);
      } else {
        req.session.userId = user.uid;
        return res.redirect('/profile');
      }
    });

  } else if (req.body.logusername && req.body.logpassword) {
    User.authenticate(req.body.logusername, req.body.logpassword, function (error, user) {
      if (error || !user) {
        var err = new Error('Wrong email or password.');
        err.status = 401;
        return next(err);
      } else {
        req.session.userId = user.uid;
        return res.redirect('/profile');
      }
    });
  } else {
    var err = new Error('All fields required.');
    err.status = 400;
    return next(err);
  }
})

// GET route after registering
router.get('/profile', function (req, res, next) {
  User.findById(req.session.userId, function (error, user) {
      if (error) {
        return next(error);
      } else {
        if (user === null) {
          var err = new Error('Not authorized! Go back!');
          err.status = 400;
          return next(err);
        } else {
          return res.send('<h1>Name: </h1>' + user.username + '<h2>Mail: </h2>' + user.email + '<br><a type="button" href="/logout">Logout</a>')
        }
      }
    });
});

// GET for logout logout
router.get('/logout', function (req, res, next) {
    if (req.session) {
        // delete session object
        req.session = null;
        return res.redirect('/');
    }
}
);

// GET route for reading data
router.get('/accounting', function (req, res, next) {
  User.findById(req.session.userId, function (error, user) {
      if (error) {
        return next(error);
      } else {
        if (user === null) {
          var err = new Error('Not authorized! Go back!');
          err.status = 400;
          return next(err);
        } else {
		  return res.sendFile(path.join(process.cwd(), 'templateLogReg/accounting-profile.html'));
        }
      }
    });
});

router.post('/accounting', function (req, res, next) {
  if (req.body.note &&
    req.body.cost &&
    req.body.type) {

    var userData = {
      note: req.body.note,
      cost: req.body.cost,
      type: req.body.type,
    }

    Record.create(req.session.userId, userData, function (error, data) {
      if (error) {
        return next(error);
      } else {
	  	console.log('Success at '+data.date);
        return res.redirect('/accounting');
      }
    });

  } else {
    var err = new Error('All fields required.');
    err.status = 400;
    return next(err);
  }
});

module.exports = router;
