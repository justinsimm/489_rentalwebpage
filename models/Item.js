// models/Item.js
const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    name: {type: String, required: true},
    owner: {type: String, required: true},
    location: {type: String, required: true},
    dailyRate: {type: Number, required: true},
    status: {
        type: String, 
        enum: ["Available", "Rented Out"],
        required: true
    },
    image: {type: String, default: ""}, 
    details: {type: String, default: ""}
});

module.exports = mongoose.model('Item', itemSchema);