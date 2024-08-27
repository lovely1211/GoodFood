const mongoose = require('mongoose');

const LikedItemSchema = new mongoose.Schema({
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Buyer',  // Reference to the Buyer model
    required: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',  // Reference to the Product model
    required: true
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',  // Reference to the Seller model
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  likedAt: {
    type: Date,
    default: Date.now
  }
});

const LikedItem = mongoose.model('LikedItem', LikedItemSchema);

module.exports = LikedItem;
