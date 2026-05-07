const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  receiver_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  message: {
    type: String,
    default: '',
  },
  image_url: {
    type: String,
    default: '',
  },
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
