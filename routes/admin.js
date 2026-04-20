var express = require('express');
var router = express.Router();
const User = require('../models/User');
const Item = require('../models/Item');
const Order = require('../models/Order');
const Report = require('../models/Report');
const { isAdmin } = require('../middleware/auth.js');
const { isAuthenticated } = require('../middleware/auth.js');

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.redirect('/login');
  }
  next();
}

/* GET admin home page */
router.get('/admin_home', isAdmin, async function(req, res, next) {
    // Total users, open reports, and items for extra stat cards
    const openReports = await Report.countDocuments({ status: 'Open' });
    const totalUsers = await User.countDocuments({});
    const totalListings = await Item.countDocuments({});

    // Get 5 most recent open reports for the preview table
    const recentReports = await Report.find({ status: 'Open' })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('item');

    const stats = {
      openReports,
      totalUsers,
      totalListings
    };

    res.render('admin_home', { 
        title: 'Admin Dashboard',
        stats: stats,
        recentReports: recentReports
    });
});


/* GET admin inbox page. */
router.get('/inbox', isAuthenticated, requireAdmin, function(req, res, next) {
  res.render('admin_inbox', { title: 'Express' });
});

/* GET user list page. */
router.get('/user_list', isAuthenticated, requireAdmin, async function(req, res, next) {
  try {
    const users = await User.find();
    res.render('user_list', { users, title: 'Express' });
  } catch (err) {
    console.log('Could not load users:', err);
    next(err);
  }
});

/* GET earnings page. */
router.get('/earnings', isAuthenticated, requireAdmin, async function(req, res, next) {
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

/* GET reports dashboard page. */
router.get('/reports_dashboard', isAuthenticated, requireAdmin, async function(req, res, next) {
  try {
    const reports = await Report.find().populate('item reporter').sort({ createdAt: -1 });
    res.render('reports_dashboard', { title: 'Express', reports: reports });
  } catch (err) {
    console.log('Could not load reports:', err);
    next(err);
  }
});

module.exports = router;