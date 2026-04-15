const mongoose = require('mongoose');
const connectionString = process.env.MONGODB_URI

const connectDB = async () => {
    try {
        await mongoose.connect(connectionString);
        console.log('MongoDB connected');
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

module.exports = connectDB;