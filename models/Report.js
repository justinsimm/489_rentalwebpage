// models/Report.js
const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reporterName: { type: String, default: '' },
  reportedUser: { type: String, required: true },
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', default: null },
  reason: { type: String, required: true },
  details: { type: String, default: '' },
  status: { type: String, default: 'Open' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Report', reportSchema);