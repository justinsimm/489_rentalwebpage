var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET sign up page. */
router.get('/signup', function(req, res, next) {
  res.render('signup', { title: 'Express' });
});

/* GET login page. */
router.get('/login', function(req, res, next) {
  res.render('login', { title: 'Express' });
});

/* GET profile page. */
router.get('/profile', function(req, res, next) {
  res.render('profile', { title: 'Express' });
});

module.exports = router;
