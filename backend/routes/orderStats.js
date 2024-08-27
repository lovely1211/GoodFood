const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const mongoose = require('mongoose');

router.get('/orderStats', async (req, res) => {
  try {
    const sellerId = req.query.sellerId;

    if (!sellerId) {
      return res.status(400).json({ message: 'Seller ID is required' });
    }

    // Convert sellerId to ObjectId
    const objectId = new mongoose.mongo.ObjectId(sellerId);

    // Total Orders
    const totalOrders = await Order.countDocuments({
      'items.sellerId': objectId
    });

    // Total Canceled
    const totalCanceled = await Order.countDocuments({
      'items.sellerId': objectId,
      status: 'Canceled'
    });

    // Total Delivered
    const totalDelivered = await Order.countDocuments({
      'items.sellerId': objectId,
      status: 'Delivered'
    });

    // Total Revenue
    const totalRevenue = await Order.aggregate([
      { $unwind: "$items" },
      { $match: { 'items.sellerId': objectId, status: 'Delivered' } },
      { $group: { _id: null, total: { $sum: { $multiply: ["$items.price", "$items.quantity"] } } } }
    ]);

    res.json({
      totalOrders,
      totalCanceled,
      totalDelivered,
      totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});


module.exports = router;
