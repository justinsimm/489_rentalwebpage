var express = require('express');
var router = express.Router();
const { isAdmin } = require('../middleware/auth.js');
const Order = require('../models/Order.js');
const Report = require('../models/Report.js');
const User = require('../models/User.js');
const Item = require('../models/Item.js');

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

const { isAuthenticated } = require('../middleware/auth.js');

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.redirect('/login');
  }
  next();
}

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
router.get('/earnings', isAuthenticated, requireAdmin, function(req, res, next) {
  res.render('earnings', {
    title: 'Express',
    totalEarnings: 0,
    recentEarnings: 0,
    transactions: []
  });
});

/* GET reports dashboard page. */
router.get('/reports_dashboard', isAuthenticated, requireAdmin, function(req, res, next) {
  res.render('reports_dashboard', { title: 'Express', reports: [] });
});

module.exports = router;