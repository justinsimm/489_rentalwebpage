var express = require('express');
var router = express.Router();

/* GET admin home page. */
router.get('/admin_home', function(req, res, next) {
  res.render('admin_home', { title: 'Express' });
});

/* GET admin inbox page. */
router.get('/inbox', function(req, res, next) {
  res.render('admin_inbox', { title: 'Express' });
});

/* GET user list page. */
router.get('/user_list', function(req, res, next) {
  res.render('user_list', { title: 'Express' });
});

/* GET earnings page. */
router.get('/earnings', function(req, res, next) {
  res.render('earnings', { title: 'Express' });
});

module.exports = router;