var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var adminRouter = require('./routes/admin');
var public_routesRouter = require('./routes/public_routes');
var usersRouter = require('./routes/users');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter); //user home
app.use('/login', indexRouter);
app.use('/signup', indexRouter);
app.use('/profile', indexRouter);
app.use('/admin_home', adminRouter); //admin_home
app.use('/inbox', adminRouter);
app.use('/user_list', adminRouter);
app.use('/earnings', adminRouter);
app.use('/browse', public_routesRouter);
app.use('/item', public_routesRouter); //Will be changed for item id (:id) eventually
app.use('/checkout', public_routesRouter);
app.use('/my_listings', public_routesRouter);
app.use('/order_history', public_routesRouter);
app.use('/rentItem', public_routesRouter);
app.use('/rentOutForm', public_routesRouter);
app.use('/report', public_routesRouter);
app.use('/user_inbox', public_routesRouter)
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
