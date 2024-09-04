// config/db.js

const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect('Your_mongodb_connection_string');
        console.log('MongoDB connected');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
};

module.exports = connectDB;
