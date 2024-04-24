// models/grocery.js
const mongoose = require('mongoose');

const grocerySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  itemName: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  expirationDate: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  sellerContact: { // Add field for seller's contact information
    type: String,
    required: true
  },
  bids: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    amount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    },
    quantity:
    {
      type: Number,
      // required: true
    }
  }]
});

module.exports = mongoose.model('Grocery', grocerySchema);
