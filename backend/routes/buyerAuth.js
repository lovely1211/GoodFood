// routes/buyerRoutes/buyerAuth

const express = require('express');
const router = express.Router();
 const crypto = require('crypto');
const multer = require('multer');
const { registerUser, loginUser, verifyEmail, updateUser } = require('../controllers/buyer');
const authMiddleware = require('../middleware/buyerMiddleware'); 
const User = require('../models/buyerModel/user');
const sendEmail = require('../services/sendEmail');

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

// POST /api/buyerAuth/forgot-password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).send('User not found');

  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenExpires = Date.now() + 3600000; // 1 hour from now

  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = resetTokenExpires;
  await user.save();

  const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;

  // Send email
  await sendEmail({
    to: user.email,
    subject: 'Password Reset Request',
    text: `We received a request to reset your password. If you did not request this, please ignore this email. 
    Otherwise, click the link below to reset your password. \n\n ${resetUrl}`,
  });

  res.send('Password reset email sent');
});

// PUT /api/buyerAuth/reset-password
router.put('/reset-password', async (req, res) => {
  const { token, password } = req.body;
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });
  if (!user) return res.status(400).send('Invalid or expired token');

  user.password = await bcrypt.hash(password, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.send('Password has been reset');
});

// Email Verification Route
router.post('/verify-email', verifyEmail);

router.post('/register', upload.single('profilePicture'), registerUser);
router.post('/login', loginUser);
router.put('/:id', updateUser);


module.exports = router;
