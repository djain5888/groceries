const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  verified: {
    type: Boolean,
    default: true
  },
  verificationToken: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  Address:{
    type: String,
    // required: true
  }
  
});

module.exports = mongoose.model('User', userSchema);
