// models/Message.js
const mongoose = require('mongoose');
const User = require('./User');
const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  type: { 
    type: String,
    enum: ["inform", "report", "order"], 
    required: true
  },
  message: { type: String, required:true}
});

module.exports = mongoose.model('Message', messageSchema);