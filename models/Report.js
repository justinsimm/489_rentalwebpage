// models/Report.js
const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    reportedUser: { type: String, required: true },
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
    reason: { type: String, required: true },
    details: { type: String, default: '' },
    reporter: { type: String, required: true },
    status: { type: String, default: 'Open' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Report', reportSchema);
