var express = require('express');
var router = express.Router();
const Item = require('../models/Item.js');
const Order = require('../models/Order.js');
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
router.get('/checkout', function(req, res, next) {
  res.render('checkout', { title: 'Express' });
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

/* GET my listings page. */
router.get('/my_listings', function(req, res, next) {
  res.render('my_listings', { title: 'Express' });
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
router.get('/report', function(req, res, next) {
  res.render('report_form', { title: 'Express' });
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
      await User.findByIdAndUpdate(message.sender, { $push: { cart: message.item_id } } );

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