// routes/menuRoutes.js

const express = require('express');
const multer = require('multer');
const router = express.Router();
const authMiddleware =require('../middleware/sellerMiddleware');
const MenuItem = require('../models/menu');
const LikedItem = require('../models/likedItem');
const mongoose = require('mongoose');


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Add Menu Item
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  const menuItem = new MenuItem({
    name: req.body.name,
    category: req.body.category,
    price: req.body.price,
    description: req.body.description,
    image: req.file ? req.file.filename : null,
    sellerId: req.user._id ,
    sellerName: req.user.name,
  });
  try {
    await menuItem.save();
    res.status(201).json(menuItem);
  } catch (e) {
    console.error('Error adding menu item:', e);
    res.status(400).json({ error: 'Error adding menu item' });
  }
});

// Get All Menu Items for buyer
router.get('/', async (req, res) => {
  try {
    const menuItems = await MenuItem.find().populate('sellerId', 'name');;
    res.json(menuItems);
  } catch (e) {
    console.error('Error fetching menu items:', e);
    res.status(500).json({ error: 'Error fetching menu items' });
  }
});

// get all menu items for a specific seller
router.get('/seller/:sellerId', authMiddleware, async (req, res) => {
  if (req.params.sellerId !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Access forbidden' });
  }
  try {
    const menuItems = await MenuItem.find({ sellerId: req.params.sellerId });
    res.status(200).json(menuItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Search Menu Items
router.get('/search', async (req, res) => {
  try {
      const searchTerm = req.query.q;
      const items = await MenuItem.find({ name: { $regex: searchTerm, $options: 'i' } });
      res.json(items);
  } catch (e) {
      console.error('Error searching menu items:', e);
      res.status(500).json({ error: 'Error searching menu items' });
  }
});

// Update Menu Item
router.patch('/:id', upload.single('image'), async (req, res) => {
  const updates = {
    name: req.body.name,
    category: req.body.category,
    price: req.body.price,
    description: req.body.description,
  };

  if (req.file) {
    updates.image = req.file.filename;
  }

  try {
    const menuItem = await MenuItem.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    res.json(menuItem);
  } catch (e) {
    console.error('Error updating menu item:', e);
    res.status(400).json({ error: 'Error updating menu item' });
  }
});

// Delete Menu Item
router.delete('/:id', async (req, res) => {
  try {
    const menuItem = await MenuItem.findByIdAndDelete(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    res.json(menuItem);
  } catch (e) {
    console.error('Error deleting menu item:', e);
    res.status(500).json({ error: 'Error deleting menu item' });
  }
});

// POST : Liked menu item
router.post('/likedItems', async (req, res) => {
  try {
    const { buyerId, productId, action } = req.body;

    if (action === 'like') {
      // Check if the item is already liked
      const existingLikedItem = await LikedItem.findOne({ buyerId, productId });
      if (existingLikedItem) {
        return res.status(400).json({ message: 'Item is already liked' });
      }

      // Fetch product details using the productId
      const product = await MenuItem.findById(productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      // Create a new liked item with all required fields
      const newLikedItem = new LikedItem({
        buyerId,
        productId,
        sellerId: product.sellerId,
        name: product.name,
        price: product.price,
        image: product.image,
      });

      // Save the liked item to the database
      await newLikedItem.save();

      return res.status(201).json(newLikedItem);
    } else if (action === 'unlike') {
      // Unlike the item: remove it from the liked items collection
      const deletedLikedItem = await LikedItem.findOneAndDelete({ buyerId, productId });

      if (!deletedLikedItem) {
        return res.status(404).json({ message: 'Liked item not found' });
      }

      return res.status(200).json({ message: 'Item unliked successfully' });
    } else {
      return res.status(400).json({ message: 'Invalid action' });
    }
  } catch (error) {
    console.error('Error processing liked item:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Delete a liked item
router.delete('/:buyerId/:productId', async (req, res) => {
  const { buyerId, productId } = req.params;

  try {
    // Assuming you have a LikedItems model or similar
    await LikedItem.deleteOne({ buyerId, productId });

    res.status(200).json({ message: 'Liked item deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete liked item.' });
  }
});

// Get : Liked menu item
router.get('/likedItems/:buyerId', async (req, res) => {
  try {
    const { buyerId } = req.params;

    // Populate product details when fetching liked items
    const likedItems = await LikedItem.find({ buyerId })
      .populate('productId', 'name image price')
      .exec();

    res.json(likedItems);
  } catch (error) {
    console.error('Error fetching liked items:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Example Express route to get categories for a seller
router.get('/:sellerId/category-counts', async (req, res) => {
  const { sellerId } = req.params;

  // Validate sellerId
  if (!mongoose.Types.ObjectId.isValid(sellerId)) {
    return res.status(400).json({ error: 'Invalid seller ID' });
  }

  try {
    // Aggregate query to count items in each category for the specific seller
    const categoryCounts = await MenuItem.aggregate([
      { $match: { sellerId: new mongoose.Types.ObjectId(sellerId) } }, // Filter by sellerId
      { $group: { _id: '$category', count: { $sum: 1 } } }, // Group by category and count items
      { $sort: { _id: 1 } } // Sort by category name (optional)
    ]);

    // Format the response to have categories and their respective counts
    const formattedCategoryCounts = categoryCounts.map(cat => ({
      category: cat._id,
      count: cat.count
    }));

    res.json(formattedCategoryCounts);
  } catch (error) {
    console.error('Error fetching category counts:', error);
    res.status(500).json({ error: 'Failed to fetch category counts' });
  }
});


module.exports = router;
