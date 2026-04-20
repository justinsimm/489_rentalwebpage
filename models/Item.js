// models/Item.js
const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    name: {type: String, required: true},
    owner: {type: String, required: true},
    category: {
        type: String,
        enum: ["Party & Events",
                "Tools & Equipment",
                "Electronics",
                "Sports & Outdoors",
                "Apparel & Formal Wear",
                "Other"]
    },
    location: {type: String, required: true},
    dailyRate: {type: Number, required: true},
    status: {
        type: String, 
        enum: ["Available", "Reserved", "Rented Out"],
        required: true
    },
    image: {type: String, default: ""}, 
    details: {type: String, default: ""}
});

module.exports = mongoose.model('Item', itemSchema);