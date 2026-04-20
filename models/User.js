// models/User.js
const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: {type: String, required: true},
  firstName: String,
  role: String,
  lastName: String,
  cart: [{ type: mongoose.Schema.Types.ObjectId, ref:'Item' }]
});

module.exports = mongoose.model('User', userSchema);