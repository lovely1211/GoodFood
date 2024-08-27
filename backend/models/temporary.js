const mongoose = require('mongoose');

const temporaryUserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  contactNumber: { type: String, required: true },
  address: { type: Object, required: true },
  password: { type: String, required: true },
  profilePicture: { type: String },
  verificationCode: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: '1d' }, // Temporary user expires in 1 day
});

const TemporaryUser = mongoose.model('TemporaryUser', temporaryUserSchema);

module.exports = TemporaryUser;
