var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local');
var bcrypt = require('bcrypt')
const User = require('../models/User'); // Import the Database model

/* Login method provided by passport */
passport.use(new LocalStrategy(async function verify(username, password, next) {
  try{
    console.log("Strategy hit, username:", username);
    const user = await User.findOne({username});
    if (!user) { return next(null, false, { message: 'Incorrect username or password.'})};

    console.log("Stored hash:", user.password); // check hash exists
    console.log("Input password:", password); // check password is coming through

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match:", isMatch); // check if compare is working

    if (!isMatch) { return next(null, false, { message: 'Incorrect username or password.'})};

    return next(null, user);
  } catch(err) {
    console.log("User could not login: ", err);
    next(err);
  }

}));


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

    //encrypt password
    const encPass = await bcrypt.hash(password, 10);

    //Use Schema to create a new object-like instance
    const newUser = new User({
      firstName,
      lastName,
      username,
      email,
      password: encPass,
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

/* Post login page. */
router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login'
}));

/* GET profile page. */
router.get('/profile', function(req, res, next) {
  res.render('profile', { title: 'Express' });
});

module.exports = router;
