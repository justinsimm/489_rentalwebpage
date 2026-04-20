var express = require('express');
var router = express.Router();
const Item = require('../models/Item.js');
const Order = require('../models/Order.js');
const Report = require('../models/Report.js');
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

/* GET reports_dashboard page. */
router.get('/reports_dashboard', function(req, res, next) {
  res.render('reports_dashboard', { title: 'Express' });
});

/* GET user_list page. */
router.get('/user_list', function(req, res, next) {
  res.render('user_list', { title: 'Express' });
});

/* GET my listings page. */
router.get('/my_listings', isAuthenticated, async function(req, res, next) {
  try {
    // Find all items where the owner matches the logged-in user's username
    const items = await Item.find({ owner: req.user.username });
    res.render('my_listings', { items, title: 'My Listings' });
  } catch (err) {
    console.log("My Listings page could not be retrieved", err);
    next(err);
  }
});

/* GET order history page. */
router.get('/order_history', isAuthenticated, async function(req, res, next) {
  try {
    //Query for order history & Populate the item Ref
    const orders = await Order.find({ renter: req.user._id }).populate('item');
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

/* POST rent Out page. */
router.post('/rentOutForm', isAuthenticated, async function(req, res, next) {
  try {
    //Parse Form Data for input
    const formData = req.body;
    console.log(formData);
    const { name = '', category='', location = '', description = '', dailyRate = '', image='' } = formData;

    //Create the new item
    const newItem = new Item({
      name,
      owner: req.user.username,
      category,
      location,
      dailyRate,
      status: "Available",
      image,
      details: description
    });

    await newItem.save();

    res.redirect('/browse');
  } catch(err) {
    console.log('Could not save the item,', err);
    next()
  }
});

/* GET report page. */
router.get('/report', isAuthenticated, function(req, res, next) {
  // Pass the itemId from the query string (e.g. /report?itemId=abc123)
  const itemId = req.query.itemId || '';
  res.render('report_form', { 
    title: 'Report Form', 
    itemId: itemId, 
    success: false,
    errors: [],
    formData: { reportedUser: '', reason: '', details: '' }
  });
});

/* POST report form submission. */
router.post('/report', isAuthenticated, async function(req, res, next) {
  try {
    const { reportedUser, reason, details, itemId } = req.body;
    let errors = [];

    if (!reportedUser || reportedUser.trim() === '') {
      errors.push('Reported User is required.');
    }

    if (!reason || reason.trim() === '') {
      errors.push('Reason is required.');
    }

    if (errors.length > 0) {
      return res.render('report_form', {
        title: 'Report Form',
        itemId: itemId,
        success: false,
        errors: errors,
        formData: req.body
      });
    }

    // Create a new Report using the form data
    const newReport = new Report({
      reportedUser: reportedUser,
      item: itemId || null,
      reason: reason,
      details: details,
      reporter: req.user.username
    });

    // Save the report to the database
    await newReport.save();

    // Render the page again with success = true to show the thank-you message
    res.render('report_form', { 
      title: 'Report Form', 
      itemId: '', 
      success: true,
      errors: [],
      formData: { reportedUser: '', reason: '', details: '' }
    });
  } catch (err) {
    console.log('Could not save the report:', err);
    next(err);
  }
});

/* GET user inbox page. */
router.get('/user_inbox', function(req, res, next) {
  res.render('user_inbox', { title: 'Express' });
});

module.exports = router;