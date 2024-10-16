const jwt = require('jsonwebtoken');
const User = require('../models/sellerModel/user');

const authMiddleware = async (req, res, next) => {
  let token;

  // Check if the authorization header is present and starts with 'Bearer'
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract the token from the header
      token = req.headers.authorization.split(' ')[1];

      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

      // Find the user by ID and exclude the password field
      req.user = await User.findById(decoded.id).select('-password');

      // Check if the user exists
      if (!req.user) {
        console.error('No user found with this ID');
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      // Proceed to the next middleware or route handler
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      } else if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token' });
      }
      return res.status(401).json({ message: 'Authorization failed' });
    }
  } else {
    console.log('No authorization header provided');
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = authMiddleware;
