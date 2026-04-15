var express = require('express');
var router = express.Router();
const Item = require('../models/Item.js');


/* GET browse page. */
router.get('/browse', async function(req, res, next) {

});

/* GET item page. */
router.get('/item/:id', async function(req, res, next) {
  try {
    const item = await Item.findById(req.params.id);
    res.render('item', { item, title: item.name });
  } catch (err) {
    next(err);
  }
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