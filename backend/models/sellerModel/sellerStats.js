const mongoose = require('mongoose');

const sellerStatsSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: true
  },
  name: String,
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true
    },
    views: { type: Number, default: 0 },
  }],
  views: { type: Number, default: 0 }, 
});

module.exports = mongoose.model('SellerStats', sellerStatsSchema);
