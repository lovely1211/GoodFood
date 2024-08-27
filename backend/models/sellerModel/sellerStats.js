const mongoose = require('mongoose');

const sellerStatsSchema = new mongoose.Schema({
  name: String,
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'seller',
      required: true
    },
  }],
  views: { type: Number, default: 0 }, 
});

module.exports = mongoose.model('SellerStats', sellerStatsSchema);
