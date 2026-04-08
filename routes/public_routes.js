var express = require('express');
var router = express.Router();

/* GET browse page. */
router.get('/browse', function(req, res, next) {
  res.render('browse', { title: 'Express' });
});

/* GET item page. */
router.get('/item', function(req, res, next) {
  res.render('item', { title: 'Express' });
});

/* GET checkout page. */
router.get('/checkout', function(req, res, next) {
  res.render('checkout', { title: 'Express' });
});

/* GET my listings page. */
router.get('/my_listings', function(req, res, next) {
  res.render('my_listings', { title: 'Express' });
});

/* GET order history page. */
router.get('/order_history', function(req, res, next) {
  res.render('orser_history', { title: 'Express' });
});

/* GET rent item page. */
router.get('/rentItem', function(req, res, next) {
  res.render('rentItem', { title: 'Express' });
});

/* GET rent Out page. */
router.get('/rentOutForm', function(req, res, next) {
  res.render('rentOutForm', { title: 'Express' });
});

/* GET report page. */
router.get('/report', function(req, res, next) {
  res.render('report_form', { title: 'Express' });
});

/* GET user inbox page. */
router.get('/user_inbox', function(req, res, next) {
  res.render('user_inbox', { title: 'Express' });
});

module.exports = router;