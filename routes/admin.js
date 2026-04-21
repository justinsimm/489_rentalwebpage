var express = require('express');
var router = express.Router();
const User = require('../models/User');
const Item = require('../models/Item');
const Order = require('../models/Order');
const Report = require('../models/Report');
const Message = require('../models/Message');
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
router.get('/admin_inbox', isAuthenticated, requireAdmin, async function(req, res, next) {
    const alerts = await Message.find({ recipient: req.user._id, type: 'alert' })
      .sort({ _id: -1 }); // Sort by most recent messages
    res.render('admin_inbox', { title: 'Admin Inbox', alerts: alerts });
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

/* POST resolve a report. */
router.post('/reports_dashboard/:id/resolve', isAuthenticated, requireAdmin, async function(req, res, next) {
    // Check which button the admin clicked
    const action = req.body.action;

    // Find the report from the database
    const report = await Report.findById(req.params.id).populate('item');
    const itemName = report.item ? report.item.name : 'Unknown Item';

    // Find the user who was reported
    const reportedUser = await User.findOne({ username: report.reportedUser });

    // Check if admin clicked remove and item still exists
    if (action === 'remove' && report.item) {
        // Delete the listing from the database
        await Item.findByIdAndDelete(report.item._id);

        // Send a warning to the reported user's inbox
        if (reportedUser) {
            const warningMessage = new Message({
                sender: req.user._id,
                recipient: reportedUser._id,
                type: 'alert',
                message: 'Your listing "' + itemName + '" has been removed. Reason: ' + report.reason
            });
            await warningMessage.save();
        }

        // Log the action to admin's inbox
        const adminLog = new Message({
            sender: req.user._id,
            recipient: req.user._id,
            type: 'alert',
            message: 'Removed listing "' + itemName + '" from user "' + report.reportedUser + '". Reason: ' + report.reason
        });
        await adminLog.save();

    } else {
        // Resolve only, no listing removed
        const adminLog = new Message({
            sender: req.user._id,
            recipient: req.user._id,
            type: 'alert',
            message: 'Resolved report for "' + itemName + '" by "' + report.reportedUser + '". No action taken.'
        });
        await adminLog.save();
    }

    // Mark the report as resolved
    await Report.findByIdAndUpdate(req.params.id, { status: 'Resolved' });
    res.redirect('/reports_dashboard');
});

module.exports = router;