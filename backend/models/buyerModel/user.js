const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    street: String,
    city: String,
    state: String,
    zip: String,
    country: String
});

const paymentHistorySchema = new mongoose.Schema({
    amount: { type: Number, required: true },
    paymentMethod: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Completed', 'Failed'], default: 'Pending' },
    transactionID: String,
    date: { type: Date, default: Date.now },
});

const buyerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    contactNumber: { type: String, unique: true },
    address: { type: addressSchema, required: true },
    billingAddress: addressSchema,
    password: { type: String, required: true },
    profilePicture: { type: String },
    paymentMethod: { type: String },
    cardDetails: {
      cardNumber: String,
      expiryDate: String,
      cvv: String,
    },
    upiID: String,
    defaultPaymentMethod: { type: String, enum: ['Card', 'UPI', 'Wallet'], default: 'Card' },
    walletBalance: { type: Number, default: 0 },
    paymentHistory: [paymentHistorySchema],
});

module.exports = mongoose.model('Buyer', buyerSchema);
