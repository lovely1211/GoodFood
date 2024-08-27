// models/sellerModel/user.js

const mongoose = require('mongoose');

const sellerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePicture: { type: String},
    views: { type: Number, default: 0 }
});

module.exports = mongoose.model('Seller', sellerSchema);
