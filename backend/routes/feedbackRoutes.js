const express = require('express');
const router = express.Router();
const Feedback = require('../models/feedback');
const multer = require('multer');
const path = require('path');

// Set up multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage: storage, 
  limits: { fileSize: 1024 * 1024 * 5 } 
});

// POST: Submit feedback
router.post('/submit', upload.array('images', 3), async (req, res) => {
  const { buyerId, orderId, rating, comment } = req.body;
  const files = req.files;
  
  if (!buyerId || !orderId || !rating || !comment) {
    return res.status(400).send('Missing required fields');
  }

  try {
    const newFeedback = new Feedback({
      buyerId,
      orderId,
      rating,
      comment,
      images: req.files.map(file => file.path),
    });

    const feedback = await newFeedback.save();
    res.status(201).json({ message: 'Feedback submitted successfully', feedback });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ message: 'Error submitting feedback', error });
  }
});

router.get('/:orderId', async (req, res) => {
  try {
    const feedback = await Feedback.findOne({ orderId: req.params.orderId });
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching feedback', error });
  }
});



module.exports = router;
