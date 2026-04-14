var express = require('express');
var router = express.Router();
const User = require('../models/User'); // Import the Database model

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET sign up page. */
router.get('/signup', function(req, res, next) {
  res.render('signup', { title: 'Express', errors: [], formData: {}, success: false });
});

/* POST sign up form submission. */
router.post('/signup', async function(req, res, next) {
  try {
    let errors = [];
    const formData = req.body;
    const { firstName = '', lastName = '', username = '', email = '', password = '' } = formData;

    if (firstName.trim().length < 1) 
      errors.push('First name is required.');

    if (lastName.trim().length < 1) 
      errors.push('Last name is required.');

    if (username.trim().length < 1) 
      errors.push('Username is required.');

    if (email.trim().length < 1) {
      errors.push('Email is required.');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push('Please enter a valid email address.');
    }

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long.');
    }

    // Check if username or email is already taken
    if (errors.length === 0) {
      
      const existingUsername = await User.findOne({ username: username });
      if (existingUsername) {
        errors.push('Username is taken.');
      }

      const existingEmail = await User.findOne({ email: email });
      if (existingEmail) {
        errors.push('Email is already being used.');
      }
    }

    if (errors.length > 0) {
      return res.render('signup', {
        title: 'Sign Up',
        errors: errors,
        formData: formData,
        success: false
      });
    }

    //Use Schema to create a new object-like instance
    const newUser = new User({
      firstName,
      lastName,
      username,
      email,
      password,
      role: 'user' // User role is automatically assigned to general users
    });

    //Save this instance to the database
    await newUser.save();

    //Send them to the login page on success
    res.redirect('/login');
  } catch (error) {
    console.error("Failed to create account:", error);
    res.status(500).send("Server Error - Unable to create account");
  }
});

/* GET login page. */
router.get('/login', function(req, res, next) {
  res.render('login', { title: 'Express' });
});

/* GET profile page. */
router.get('/profile', function(req, res, next) {
  res.render('profile', { title: 'Express' });
});

module.exports = router;
