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
    const search = req.query.q;
    const category = req.query.category;
    
    // We start with an empty filter object
    var filter = {};

    // Search by item name
    if (search) {
      // Search for items that contain the search query and ignore case-sensitivity
      filter.name = { $regex: search, $options: 'i' };
    }

    // Filter by category
    if (category) {
      filter.category = category;
    }

    // Find items that match the filter
    const items = await Item.find(filter);
    
    // Send the items to the page to be displayed
    res.render('browse', { items, title: 'Browse', search: search, category: category });
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
router.get('/checkout', isAuthenticated, async function(req, res, next) {
  try {
    const itemId = req.query.itemId;
    if (!itemId) {
      return res.redirect('/cart');
    }

    const user = await User.findById(req.user._id);
    const inCart = user && Array.isArray(user.cart)
      ? user.cart.some(function(cartId) { return cartId.toString() === itemId; })
      : false;

    if (!inCart) {
      return res.redirect('/cart');
    }

    const item = await Item.findById(itemId);
    const dailyRate = item && item.dailyRate !== undefined && item.dailyRate !== null ? Number(item.dailyRate) : NaN;
    const subtotal = Number.isFinite(dailyRate) ? dailyRate : 0;
    const priceSummary = {
      subtotal: subtotal,
      fees: 0,
      tax: 0,
      total: subtotal
    };
    res.render('checkout', { item, priceSummary, title: 'Express' });
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

    const user = await User.findById(req.user._id);
    const inCart = user && Array.isArray(user.cart)
      ? user.cart.some(function(cartId) { return cartId.toString() === itemId; })
      : false;

    if (!inCart) {
      return res.redirect('/cart');
    }

    const item = await Item.findById(itemId);
    if (!item) {
      return res.redirect('/browse');
    }

    const dailyRate = (item.dailyRate !== undefined && item.dailyRate !== null) ? Number(item.dailyRate) : 0;
    const total = Number.isFinite(dailyRate) ? dailyRate : 0; // Daily rate snapshot (no duration selected yet)

    const order = new Order({
      item: item._id,
      renter: req.user._id,
      total: total
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

/* GET user_list page. */
router.get('/user_list', function(req, res, next) {
  res.render('user_list', { title: 'Express' });
});

/* GET my listings page. */
router.get('/my_listings', isAuthenticated, async function(req, res, next) {
  try {
    const items = await Item.find({ owner: req.user.username });
    res.render('my_listings', { items, title: 'My Listings' });
  } catch (err) {
    console.log('My Listings page could not be retrieved', err);
    next(err);
  }
});

/* GET order history page. */
router.get('/order_history', isAuthenticated, async function(req, res, next) {
  try {
    const orders = await Order.find({ renter: req.user._id }).populate('item');
    res.render('order_history', { orders, title: 'Express' });
  } catch (err) {
    console.log('Order History Page could not be retreived', err);
    next(err);
  }
});

/* GET rent item page. */
router.get('/rentItem/:id', async function(req, res, next) {
  try {
    const item = await Item.findById(req.params.id);
    res.render('rentItem', { item, title: 'Express' });
  } catch (err) {
    console.log('Could not get item rent page: ', err);
    next(err);
  }
});

/* POST rent item page. */
router.post('/rentItem/:id', isAuthenticated, async function(req, res, next) {
  try {
    const item = await Item.findById(req.params.id);
    const owner = await User.findOne({ username: item.owner });

    const message = new Message({
      sender: req.user._id,
      recipient: owner._id,
      type: 'order',
      message: req.body.message,
      item: item._id
    });

    await message.save();
    res.redirect('/user_inbox');
  } catch (err) {
    console.log('Could not rent item: ', err);
    next(err);
  }
});

/* GET rent Out page. */
router.get('/rentOutForm', function(req, res, next) {
  res.render('rentOutForm', { title: 'Express' });
});

/* POST rent Out page. */
router.post('/rentOutForm', isAuthenticated, async function(req, res, next) {
  try {
    const formData = req.body;
    const { name = '', category = '', location = '', description = '', dailyRate = '', image = '' } = formData;

    const newItem = new Item({
      name,
      owner: req.user.username,
      category,
      location,
      dailyRate,
      status: 'Available',
      image,
      details: description
    });

    await newItem.save();
    res.redirect('/browse');
  } catch (err) {
    console.log('Could not save the item,', err);
    next(err);
  }
});

/* GET report page. */
router.get('/report', isAuthenticated, async function(req, res, next) {
    const itemId = req.query.itemId || '';
    let item = null;
    let reportedUser = '';

    if (itemId) {
      item = await Item.findById(itemId);
      if (item) {
        reportedUser = item.owner || '';
      }
    }

    res.render('report_form', {
      title: 'Report Form',
      itemId: itemId,
      item: item,
      success: false,
      errors: [],
      formData: { reportedUser: reportedUser, reason: '', details: '' }
    });
})

/* POST report form submission. */
router.post('/report', isAuthenticated, async function(req, res, next) {
  try {
    const reportedUser = req.body.reportedUser || '';
    const reason = req.body.reason || req.body.report_reason || '';
    const details = req.body.details || req.body.further_details || '';
    const itemId = req.body.itemId || '';
    let errors = [];

    if (!reportedUser || reportedUser.trim() === '') {
      errors.push('Reported User is required.');
    }

    if (!reason || reason.trim() === '') {
      errors.push('Reason is required.');
    }

    if (errors.length > 0) {
      let item = null;
      if (itemId) {
        item = await Item.findById(itemId);
      }
      return res.render('report_form', {
        title: 'Report Form',
        itemId: itemId,
        item: item,
        success: false,
        errors: errors,
        formData: { reportedUser: reportedUser, reason: reason, details: details }
      });
    }

    const newReport = new Report({
      reporter: req.user._id,
      reporterName: req.user.username || '',
      reportedUser: reportedUser,
      item: itemId || null,
      reason: reason,
      details: details
    });

    await newReport.save();

    res.render('report_form', {
      title: 'Report Form',
      itemId: '',
      item: null,
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
  } catch (err) {
    console.log('Could not retreive user inbox page: ', err);
    next(err);
  }
});

/* POST method for rentApproval */
router.post('/rentApproval/:id', isAuthenticated, async function(req, res, next) {
  try {
    const message = await Message.findById(req.params.id).populate('item');

    if (req.body.decision === 'approve') {
      await Item.findByIdAndUpdate(message.item._id, { status: 'Reserved' });
      await User.findByIdAndUpdate(message.sender, { $push: { cart: message.item._id } });
    } else {
      const declineMessage = new Message({
        sender: req.user._id,
        recipient: message.sender,
        type: 'inform',
        message: `Your request to rent ${message.item.name} has been declined.`
      });
      await declineMessage.save();
    }

    await Message.findByIdAndDelete(req.params.id);
    res.redirect('/user_inbox');
  } catch (err) {
    console.log('Could not process rent approval: ', err);
    next(err);
  }
});

/* GET earnings page. */
router.get('/earnings', isAuthenticated, async function(req, res, next) {
  try {
    const ownerName = req.user && req.user.username ? req.user.username : '';
    const ownedItems = ownerName ? await Item.find({ owner: ownerName }).select('_id name') : [];
    const ownedItemIds = ownedItems.map(function(item) { return item._id; });

    const orders = ownedItemIds.length > 0
      ? await Order.find({ item: { $in: ownedItemIds } }).populate('item renter')
      : [];

    const totalEarnings = orders.reduce(function(sum, order) {
      const amount = (order && typeof order.total === 'number') ? order.total : 0;
      return sum + amount;
    }, 0);

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    const recentEarnings = orders.reduce(function(sum, order) {
      const dateValue = order && (order.createdAt || order.date);
      const amount = (order && typeof order.total === 'number') ? order.total : 0;
      if (dateValue && new Date(dateValue) >= thirtyDaysAgo) {
        return sum + amount;
      }
      return sum;
    }, 0);

    const transactions = orders.map(function(order) {
      return {
        date: order.createdAt || order.date,
        itemName: order.item && order.item.name,
        renterName: order.renter && (order.renter.name || order.renter.username),
        amount: (order && typeof order.total === 'number') ? order.total : 0
      };
    });

    res.render('earnings', {
      title: 'Express',
      totalEarnings: totalEarnings,
      recentEarnings: recentEarnings,
      transactions: transactions
    });
  } catch (err) {
    console.log('Could not load earnings:', err);
    next(err);
  }
});

module.exports = router;