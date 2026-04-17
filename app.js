var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session');
// Use the safe require here to catch the class regardless of how the ES Module exports it!
const MongoStore = require('connect-mongo').default || require('connect-mongo');
var passport = require('passport');

var indexRouter = require('./routes/index');
var adminRouter = require('./routes/admin.js');
var public_routesRouter = require('./routes/public_routes.js');
var usersRouter = require('./routes/users.js');
var User = require('./models/User.js');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI })
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

//Passport config
require('./middleware/passport');

//res-locals middleware
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  res.locals.path = req.path;
  next();
});

//Route setup
app.use('/', indexRouter);
app.use('/', adminRouter);
app.use('/', public_routesRouter);
app.use('/users', usersRouter);

//Database setup
const connectDB = require('./db.js');
connectDB();

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
