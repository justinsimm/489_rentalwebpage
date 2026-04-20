var express = require('express');
var router = express.Router();
const Item = require('../models/Item.js');
const Order = require('../models/Order.js');
const Report = require('../models/Report.js');
const Message = require('../models/Message.js');
const User = require('../models/User.js');
const { isAuthenticated } = require('../middleware/auth.js');


/* GET browse page. */
router.get('/browse', async function(req, res, next) {
  try {
    const items = await Item.find();
    res.render('browse', { items, title: 'Browse' });
  } catch (err) {
    console.log('Could not load browse items:', err);
    next(err);
  }
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
router.get('/checkout', async function(req, res, next) {
  try {
    const itemId = req.query.itemId;
    const item = itemId ? await Item.findById(itemId) : null;
    res.render('checkout', { item, title: 'Express' });
  } catch (err) {
    console.log('Could not load checkout item:', err);
    next(err);
  }
});

/* POST checkout page. */
router.post('/checkout', isAuthenticated, async function(req, res, next) {
  try {
    const itemId = req.body.itemId || req.query.itemId;
    if (!itemId || !req.user) {
      return res.redirect('/browse');
    }

    const item = await Item.findById(itemId);
    if (!item) {
      return res.redirect('/browse');
    }

    const order = new Order({
      item: item._id,
      renter: req.user._id
    });

    await order.save();
    res.redirect('/order_history');
  } catch (err) {
    console.log('Could not create order:', err);
    next(err);
  }
});

/* POST add item to cart. */
router.post('/cart/add/:id', isAuthenticated, async function(req, res, next) {
  try {
    const itemId = req.params.id;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.redirect('/login');
    }

    const alreadyInCart = user.cart.some(function(cartId) {
      return cartId.toString() === itemId;
    });

    if (!alreadyInCart) {
      user.cart.push(itemId);
      await user.save();
    }

    res.redirect('/cart');
  } catch (err) {
    console.log('Could not add item to cart:', err);
    next(err);
  }
});

/* GET cart page. */
router.get('/cart', isAuthenticated, async function(req, res, next) {
  try {
    const user = await User.findById(req.user._id).populate('cart');
    const cartItems = user && Array.isArray(user.cart) ? user.cart : [];
    res.render('cart', { cartItems, title: 'Cart' });
  } catch (err) {
    console.log('Could not load cart:', err);
    next(err);
  }
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

/* Post rent item page. 
   send message to the owner for approval */
router.post('/rentItem/:id', isAuthenticated, async function(req, res, next) {
  try {
    const item = await Item.findById(req.params.id);
    const owner = await User.findOne({ username: item.owner });

    const message = new Message({
        sender: req.user._id,
        recipient: owner._id,
        type: "order",
        message: req.body.message,
        item: item._id
    });

    await message.save();
    res.redirect('/user_inbox');
  } catch(err) {
    console.log("Could not rent item: ", err);
    next();
  }
});

/* GET rent Out page. */
router.get('/rentOutForm', function(req, res, next) {
  res.render('rentOutForm', { title: 'Express' });
});

/* POST rent Out page. */
/* Item creation */
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
router.get('/user_inbox', isAuthenticated, async function(req, res, next) {
  try {
    const messages = await Message.find({ recipient: req.user._id }).populate('sender', 'username');

    res.render('user_inbox', { messages });
  } catch(err) {
    console.log('Could not retreive user inbox page: ', err);
    next();
  }
});

/* POST method for rentApproval
- approve/decline rent requests
- reserve items that are approved */
router.post('/rentApproval/:id', isAuthenticated, async function(req, res, next) {
  try {
    //Retreive message so the item can be updated
    const message = await Message.findById(req.params.id).populate('item');

    //Updated item to reserved status if approved
    if (req.body.decision === "approve") {
      await Item.findByIdAndUpdate(message.item._id, { status: "Reserved" });

      //Add item to the user's cart
      await User.findByIdAndUpdate(message.sender, { $push: { cart: message.item._id } } );

      //Remove the message from the user_inbox
    } else {
      //Send harcoded rejection letter to requester
      const declineMessage = new Message({
        sender: req.user._id,
        recipient: message.sender,
        type: "inform",
        message: `Your request to rent ${message.item.name} has been declined.`
      });
      await declineMessage.save();
    }

    await Message.findByIdAndDelete(req.params.id);
    res.redirect('/user_inbox');
  } catch(err) {
    console.log('Could not process rent approval: ', err);
    next(err);
  }
});

module.exports = router;