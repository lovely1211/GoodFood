// routes/buyerRoutes/buyerAuth

const express = require('express');
const router = express.Router();
const multer = require('multer');
const { registerUser, loginUser, verifyEmail, updateUser } = require('../controllers/buyer');
const authMiddleware = require('../middleware/buyerMiddleware'); 
const User = require('../models/buyerModel/user');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password'); // Exclude password
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Email Verification Route
router.post('/verify-email', verifyEmail);
router.post('/register', upload.single('profilePicture'), registerUser);
router.post('/login', loginUser);
router.put('/:id', updateUser);

module.exports = router;
