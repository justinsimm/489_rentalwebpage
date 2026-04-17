// models/Order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    name: {type: String, required: true},
    owner: {type: String, required: true},
    renter: {type: String, required: true},
    location: {type: String, required: true},
    dailyRate: {type: Number, required: true},
    status: {
        type: String, 
        enum: ["Available", "Rented Out"],
        required: true
    },
    image: {type: String, default: ""}, 
    details: {type: String, default: ""},
    date: {type: Date, required: true},
    dateRet: {type: Date, default: ""}
});

module.exports = mongoose.model('Order', orderSchema);