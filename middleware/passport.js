const passport = require('passport');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const LocalStrategy = require('passport-local');

/* Login method provided by passport */
passport.use(new LocalStrategy(async function verify(username, password, next) {
  console.log("In Passport");
  try{
    const user = await User.findOne({username});
    if (!user) { return next(null, false, { message: 'Incorrect username or password.'})};

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) { return next(null, false, { message: 'Incorrect username or password.'})};

    return next(null, user);
  } catch(err) {
    console.log("User could not login: ", err);
    next(err);
  }

}));

/* For user storage/retreival by auth.js */

// Serialize/deserialize — tells passport how to store and retrieve user from session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        console.log('Deserialize error:', err);
        done(err);
    }
});

module.exports = passport;