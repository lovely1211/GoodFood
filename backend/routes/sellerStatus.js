const express = require('express');
const router = express.Router();
const SellerStats = require('../models/sellerModel/sellerStats');
const MenuItem = require('../models/menu');
const Feedback = require('../models/feedback');
const Order = require('../models/order'); 
const Buyer = require ('../models/buyerModel/user');
const mongoose = require('mongoose');
const moment = require('moment');


// Post request handlers for the seler views
router.post('/views', async (req, res) => {
  const { productId } = req.body;

  try {
      const product = await MenuItem.findById(productId).populate('sellerId');
      if (!product) {
          return res.status(404).json({ success: false, message: 'Product not found' });
      }
  
      // Increment product views
      product.views = (product.views || 0) + 1;
      await product.save();
  
      // Find or create seller stats by sellerId
      let sellerStats = await SellerStats.findOne({ sellerId: product.sellerId._id });
  
      if (!sellerStats) {
          // If not found, create a new SellerStats document for the seller
          sellerStats = new SellerStats({
              sellerId: product.sellerId._id,
              views: 0,
              items: [],
          });
      }
  
      // Increment views for the seller
      sellerStats.views += 1;
  
      // Find or create the specific product's entry in the sellerStats.items array
      let productStats = sellerStats.items.find(item => item.productId.equals(productId));
      if (!productStats) {
          productStats = { productId, sellerId: product.sellerId._id, views: 0 };
          sellerStats.items.push(productStats);
      }
      productStats.views += 1;
  
      await sellerStats.save();
  
      res.json({ success: true, productViews: product.views, sellerViews: sellerStats.views });
  } catch (error) {
      console.error('Error recording view:', error.message);
      res.status(500).json({ success: false, error: error.message });
  }
});
  
// GET: Get total views for a specific seller
router.get('/views', async (req, res) => {
  const sellerId = req.query.sellerId;

  if (!sellerId) {
    return res.status(400).json({ message: 'Seller ID is required' });
  }

  try {
    const stats = await SellerStats.findOne({ 
      'items.sellerId': new mongoose.Types.ObjectId(sellerId) 
    });

    if (!stats) {
      return res.status(404).json({ message: 'Seller stats not found' });
    }

    res.json({
      totalViews: stats.views || 0
    });
  } catch (error) {
    console.error('Error fetching seller stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET: Count ratings and comments for a specific seller
router.get('/seller/:sellerId', async (req, res) => {
  const sellerId = req.params.sellerId;

  try {
    // Find all order IDs for the given seller where orders are not canceled
    const orders = await Order.find({
      'items.sellerId': sellerId,
      status: { $ne: 'Canceled' }  // Exclude canceled orders
    }).distinct('_id');

    // Count feedback for these orders
    const feedbackCounts = await Feedback.aggregate([
      { $match: { orderId: { $in: orders } } },
      { $group: { _id: null, totalRatings: { $sum: 1 }, totalComments: { $sum: 1 } } }
    ]);

    res.json({
      totalRatings: feedbackCounts.length > 0 ? feedbackCounts[0].totalRatings : 0,
      totalComments: feedbackCounts.length > 0 ? feedbackCounts[0].totalComments : 0
    });
  } catch (error) {
    console.error('Error fetching feedback counts:', error);
    res.status(500).json({ message: 'Error fetching feedback counts', error });
  }
});

// GET: Fetch feedbacks for a specific seller for the current date
router.get('/today', async (req, res) => {
  const { sellerId } = req.query;

  if (!sellerId) {
    return res.status(400).json({ message: 'Seller ID is required' });
  }
  

  const startOfDay = moment().startOf('day').toDate();
  const endOfDay = moment().endOf('day').toDate();

  const sellerIdObjectId = new mongoose.Types.ObjectId(sellerId);
  try {

    const feedbacks = await Feedback.aggregate([
      { 
        $match: { 
          sellerId: sellerIdObjectId,
          createdAt: { $gte: startOfDay, $lt: endOfDay }
        }
      },
      {
        $lookup: {
          from: 'buyers',
          localField: 'buyerId',
          foreignField: '_id',
          as: 'buyer'
        }
      },
      { $unwind: '$buyer' },
      {
        $project: {
          'buyer.name': 1,
          comment: 1,
          rating: 1,
          images: 1,
          createdAt: 1,
          'buyer.avatar': 1
        }
      },
      { $sort: { createdAt: -1 } }
    ]);

    res.json(feedbacks);
  } catch (error) {
    console.error('Error fetching feedbacks:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// GET: Get top 5 most ordered items for a specific seller
router.get('/most-ordered-items/:sellerId', async (req, res) => {
  const sellerId = req.params.sellerId;

  try {
    // Fetch orders for the seller
    const orders = await Order.find({ 'items.sellerId': sellerId });

    // Aggregate item orders
    const itemOrderCounts = await Order.aggregate([
      { $unwind: '$items' },
      { $match: { 'items.sellerId': new mongoose.Types.ObjectId(sellerId) } },
      { $group: { _id: '$items.productId', totalOrders: { $sum: 1 } } },
      { $sort: { totalOrders: -1 } },
      { $limit: 5 }
    ]);

    // Fetch item details
    const items = await MenuItem.find({ '_id': { $in: itemOrderCounts.map(item => item._id) } });

    // Format response
    const result = itemOrderCounts.map(count => {
      const item = items.find(i => i._id.toString() === count._id.toString());
      return {
        productId: count._id,
        name: item ? item.name : 'Unknown',
        orderCount: count.totalOrders
      };
    });

    res.json(result);
  } catch (error) {
    console.error('Error fetching most ordered items:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
