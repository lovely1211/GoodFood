// controller/buyer.js

const User = require('../models/sellerModel/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendVerificationEmail = require('../services/verifyEmail')

// Email Verification
exports.verifyEmail = async (req, res) => {
    try {
      const token = req.query.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      const userId = decoded.userId;
  
      // Update the user's email verification status in the database
      await User.updateOne({ _id: userId }, { emailVerified: true });
  
      res.send('Email verified successfully.');
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        res.status(400).send('Token has expired.');
      } else {
        res.status(400).send('Invalid token.');
      }
    }
}

exports.registerUser = async (req, res) => {
  try {
      const { name, email, password } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
          return res.status(400).json({ message: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const profilePicture = req.file ? req.file.path : null;

      const newUser = new User({
          name,
          email,
          password: hashedPassword,
          profilePicture,
      });

      await newUser.save();
      // Send verification email
      await sendVerificationEmail(newUser.email, newUser._id);
      
      const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET_KEY, { expiresIn: '1d' });

      // Combine the user data and message into a single response
      res.status(201).json({
          message: 'User registered successfully. Please verify your email.',
          user: {
              id: newUser._id,
              name: newUser.name,
              email: newUser.email,
              profilePicture: newUser.profilePicture,
          },
          token,
      });

  } catch (error) {
      console.error('Error during registration:', error);
      res.status(500).json({ message: 'Server error' });
  }
};

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Password does not match' });

        const token = jwt.sign({ id: user._id, role: 'seller' }, process.env.JWT_SECRET_KEY, { expiresIn: '10d' });
        res.json({ 
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                profilePicture: user.profilePicture
            }
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// In your seller controller
exports.getAllSellersWithRatings = async (req, res) => {
    try {
      const sellers = await User.aggregate([
        {
          $lookup: {
            from: "feedbacks", // Assuming your feedback collection is named 'feedbacks'
            localField: "_id",
            foreignField: "sellerId",
            as: "feedbacks",
          },
        },
        {
          $addFields: {
            totalRatings: { $size: "$feedbacks" },
            averageRating: { $avg: "$feedbacks.rating" },
          },
        },
        {
          $project: {
            name: 1,
            averageRating: 1,
            totalRatings: 1,
          },
        },
      ]);
  
      res.status(200).json(sellers);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
};
  
