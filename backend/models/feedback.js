const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Buyer' },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller' },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  rating: { type: Number, required: true },
  comment: { type: String, required: true },
  images: [{ type: String }]
}, {timestamps: true});


module.exports = mongoose.model('Feedback', feedbackSchema);
