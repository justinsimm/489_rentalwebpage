const mongoose = require('mongoose');
const connectionString = 'mongodb://localhost:27017/'

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