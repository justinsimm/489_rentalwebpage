// models/Order.js
const mongoose = require('mongoose');
const Item = require('./Item')

const orderSchema = new mongoose.Schema({
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
    renter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    date: {type: Date, required: true},
    dateRet: {type: Date, default: ""}
});

module.exports = mongoose.model('Order', orderSchema);