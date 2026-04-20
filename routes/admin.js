var express = require('express');
var router = express.Router();
const User = require('../models/User');
const { isAuthenticated } = require('../middleware/auth.js');

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.redirect('/login');
  }
  next();
}

/* GET admin home page. */
router.get('/admin_home', isAuthenticated, requireAdmin, function(req, res, next) {
  res.render('admin_home', { title: 'Express' });
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