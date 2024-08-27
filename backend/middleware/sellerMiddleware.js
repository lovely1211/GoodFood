const jwt = require('jsonwebtoken');
const User = require('../models/sellerModel/user');

const authMiddleware = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        console.error('No user found with this ID');
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      next();
    } catch (error) {
      console.error('Error in authMiddleware:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    console.log('No authorization header provided');
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = authMiddleware;
