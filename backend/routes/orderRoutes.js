const express = require('express');
const { createOrder, getBuyerOrders, getSellerOrders, cancelBuyerOrders, updateOrderStatus, deliveryTimes, reorder } = require('../controllers/order');
const router = express.Router();
const Order = require('../models/order');

router.post('/create', createOrder);
router.get('/buyer/:buyerId', getBuyerOrders);
router.get('/seller/:sellerId', getSellerOrders);
router.patch('/:orderId', updateOrderStatus)
router.put('/cancel/:id', cancelBuyerOrders);
router.patch('/:id/delivery-time', deliveryTimes);
router.post('/reorder', reorder);

// Fetch new order count
router.get('/seller/:sellerId/new-count', async (req, res) => {
    const { sellerId } = req.params;
    try {
      const newOrderCount = await Order.countDocuments({
        'items.sellerId': sellerId,
        isViewed: false
      });
      res.json({ count: newOrderCount });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
});
  
// Mark orders as viewed
router.patch('/seller/:sellerId/mark-viewed', async (req, res) => {
    const { sellerId } = req.params;
    try {
      await Order.updateMany(
        { 'items.sellerId': sellerId, isViewed: false },
        { $set: { isViewed: true } }
      );
      res.sendStatus(200);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
});
  

module.exports = router;
