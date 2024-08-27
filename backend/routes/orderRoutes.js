const express = require('express');
const { createOrder, getBuyerOrders, getSellerOrders, cancelBuyerOrders, updateOrderStatus, deliveryTimes, reorder } = require('../controllers/order');
const router = express.Router();

router.post('/create', createOrder);
router.get('/buyer/:buyerId', getBuyerOrders);
router.get('/seller/:sellerId', getSellerOrders);
router.patch('/:orderId', updateOrderStatus)
router.put('/cancel/:id', cancelBuyerOrders);
router.patch('/:id/delivery-time', deliveryTimes);
router.post('/reorder', reorder);

module.exports = router;
