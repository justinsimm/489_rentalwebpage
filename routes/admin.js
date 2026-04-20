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