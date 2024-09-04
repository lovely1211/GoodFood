// controllers/order.js
const Order = require('../models/order');
const MenuItem = require('../models/menu')

const createOrder = async (req, res) => {
  try {
    const { buyerId, items, total } = req.body;

    // Extract product IDs from the request
    const productIds = items.map(item => item.productId);

    // Fetch products from the database
    const products = await MenuItem.find({ _id: { $in: productIds } });

    // Create a map of product IDs to products for quick lookup
    const productMap = new Map(products.map(product => [product._id.toString(), product]));

    // Create a list of ordered items with product names and other details
    const orderedItems = items.map(item => {
      const product = productMap.get(item.productId);
      return {
        productId: item.productId,
        name: product.name,
        price: product.price,
        quantity: item.quantity
      };
    });

    const itemsWithSeller = await Promise.all(items.map(item => {
      const product = productMap.get(item.productId);
      if (!product) {
        return null; 
      }
      return {
        ...item,
        sellerId: product.sellerId
      };
    }));
    
    if (itemsWithSeller.includes(null)) {
      return res.status(404).json({ error: 'One or more products not found' });
    }
    
    // Further processing to create and save the order...
    const order = new Order({
      buyerId,
      items: itemsWithSeller,
      total,
      status: 'Pending',
      isViewed: false,
    });
    
    await order.save();

    // Notify seller
    const sellerIds = [...new Set(products.map(product => product.sellerId.toString()))];
    sellerIds.forEach(sellerId => {
      notifySeller(sellerId, order._id);
    });

    res.status(201).json({ message: 'Order created successfully', order });

  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const notifySeller = (sellerId, orderId) => {
};

const getBuyerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyerId: req.params.buyerId })
      .select('items total status createdAt receivedAt deliveredAt')
      .populate('items.productId', 'name price category');

    res.status(200).json(orders);
  } catch (error) {
    console.error('Failed to fetch buyer orders:', error);
    res.status(500).json({ error: 'Failed to fetch buyer orders' });
  }
};

const getSellerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ 'items.sellerId': req.params.sellerId })
      .select('items total status receivedAt deliveredAt createdAt')
      .populate('buyerId', 'name contactNumber address')
      .populate('items.productId', 'name price');

    res.status(200).json(orders);
  } catch (error) {
    console.error('Failed to fetch seller orders:', error);
    res.status(500).json({ error: 'Failed to fetch seller orders' });
  }
};

const updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status, receivedAt } = req.body;

  try {
    const updatedOrder = await Order.findByIdAndUpdate(orderId, { status, receivedAt }, { new: true });
    
    if (!updatedOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error('Failed to update order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
};

const cancelBuyerOrders = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const orderTime = new Date(order.createdAt).getTime();
    const currentTime = new Date().getTime();

    if ((currentTime - orderTime) > 60000) {
      return res.status(400).json({ message: 'Order can only be canceled within one minute' });
    }

    order.status = 'Canceled';
    await order.save();

    res.json({ message: 'Order canceled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error canceling order', error });
  }
};

const deliveryTimes = async (req, res) => {
  try {
    const { id } = req.params;
    const { deliveryTime } = req.body;

    const order = await Order.findByIdAndUpdate(
      id,
      { deliveredAt: deliveryTime },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error setting delivery time', error });
  }
};

const reorder = async (req, res) => {
  try {
    const { orderId, buyerId } = req.body;

    // Find the original order by ID
    const originalOrder = await Order.findById(orderId);

    if (!originalOrder) {
      return res.status(404).json({ message: 'Original order not found' });
    }

    // Create a new order with the same items
    const newOrder = new Order({
      buyerId: buyerId || originalOrder.buyerId, // Use provided buyerId or fallback to original buyerId
      items: originalOrder.items,  // Copy items from original order
      total: originalOrder.total,  // Copy the total amount
      status: 'Pending',  // New order should start with 'Pending' status
    });

    // Save the new order
    await newOrder.save();

    // Notify seller(s) about the new order
    const sellerIds = [...new Set(originalOrder.items.map(item => item.sellerId.toString()))];
    sellerIds.forEach(sellerId => {
      notifySeller(sellerId, newOrder._id);
    });

    res.status(201).json({ message: 'Order placed successfully', newOrder });
  } catch (error) {
    console.error('Error reordering:', error);
    res.status(500).json({ error: 'Server error' });
  }
};


module.exports = { createOrder, getBuyerOrders, getSellerOrders, updateOrderStatus, cancelBuyerOrders, deliveryTimes, reorder };
