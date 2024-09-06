// controller/buyer.js

const TemporaryUser = require('../models/temporary'); // Import TemporaryUser model
const User = require('../models/buyerModel/user'); // Import User model
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendVerificationEmail = require('../services/verifyEmail');

// Email verification
exports.verifyEmail = async (req, res) => {
  try {
    const { userId, code } = req.body;

    // Retrieve the user from TemporaryUser collection
    const tempUser = await TemporaryUser.findById(userId);

    if (!tempUser) {
      return res.status(400).json({ message: 'User not found.' });
    }

    // Check if the provided code matches the stored verification code
    if (tempUser.verificationCode !== code) {
      return res.status(400).json({ message: 'Invalid verification code.' });
    }

    // Move user from TemporaryUser to User collection
    const { name, email, contactNumber, address, password, profilePicture } = tempUser;
    const newUser = new User({
      name,
      email,
      contactNumber,
      address,
      password,
      profilePicture,
      emailVerified: true, // Mark as verified
    });

    await newUser.save();

    // Delete the temporary user record
    await TemporaryUser.findByIdAndDelete(userId);

    res.status(200).json({ message: 'Email verified successfully!', user: newUser });
  } catch (error) {
    console.error('Error during email verification:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.registerUser = async (req, res) => {
  try {
    const { name, email, contactNumber, address, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const existingTempUser = await TemporaryUser.findOne({ email });
    if (existingTempUser) {
      return res.status(400).json({ message: 'User already registered but not verified. Please check your email.' });
    }

    const parsedAddress = JSON.parse(address);
    const hashedPassword = await bcrypt.hash(password, 10);
    const profilePicture = req.file ? req.file.path : null;

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    const newTempUser = new TemporaryUser({
      name,
      email,
      contactNumber,
      address: parsedAddress,
      password: hashedPassword,
      profilePicture,
      verificationCode,
    });

    await newTempUser.save();

    await sendVerificationEmail(email, verificationCode);

    res.status(201).json({ message: 'User registered successfully. Please verify your email.', user: newTempUser });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Step 3: Login User
exports.loginUser = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ message: 'User not found' });
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: 'Password does not match' });
  
      const token = jwt.sign({ id: user._id, role: 'buyer' }, process.env.JWT_SECRET_KEY, { expiresIn: '10d' });
  
      res.json({ 
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          contactNumber: user.contactNumber,
          address: user.address,
          profilePicture: user.profilePicture
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
};

// Update User (including payment details)
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, contactNumber, email, address, paymentMethod, cardDetails, upiID } = req.body;

    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user details
    const updatedUser = await User.findByIdAndUpdate(userId, {
      name,
      contactNumber,
      email,
      address,
      paymentMethod,
      cardDetails: paymentMethod === 'card' ? cardDetails : null,
      upiID: paymentMethod === 'upi' ? upiID : null
    }, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ message: 'Failed to update user' });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

