var express = require('express');
var router = express.Router();
const Item = require('../models/Item.js');
const Order = require('../models/Order.js');
const { isAuthenticated } = require('../middleware/auth.js');


/* GET browse page. */
router.get('/browse', async function(req, res, next) {
  res.render('browse', {title: 'Browse'});
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
router.get('/order_history', isAuthenticated, async function(req, res, next) {
  try {
    const orders = await Order.find({ renter: res.locals.user.username });
    res.render('order_history', {orders,  title: 'Express' });
  } catch(err) {
    console.log("Order History Page could not be retreived", err);
    next (err);
  }
});

/* GET rent item page. */
router.get('/rentItem/:id', async function(req, res, next) {
  try {
    const item = await Item.findById(req.params.id);
    res.render('rentItem', {item, title: 'Express' });
  } catch(err) {
    console.log("Could not get item rent page: ", err);
    next();
  }
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