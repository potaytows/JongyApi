const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  customer: {
    type: String,
    required: true
  },
  restaurant: {
    type: mongoose.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  reservation: {
    type: mongoose.Types.ObjectId,
    ref: 'Reservation',
    required: true
  },
  messages: [
    {
      sender: {
        type: String,
        enum: ['customer', 'restaurant'],
        required: true
      },
      message: {
        type: String,
        required: true
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
    }
  ]
});

module.exports = mongoose.model('Chat', chatSchema);
