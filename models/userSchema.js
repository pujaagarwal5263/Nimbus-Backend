const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email:{
    type: String,
    required: true,
  },
  profileURL:{
    type: String
  },
  solvedQuestions: [
    {
      question: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'codeSchema',
      },
      starsEarned: {
        type: Number,
        default: 0,
      },
      solvedAt: {
        type: Date, 
        default: Date.now, 
      },
    },
  ],
  contributions: [
    {
      date: {
        type: String
      },
      count: {
        type: Number,
        default: 0,
      },
    },
  ],
  credits: {
    type: Number,
    default: 15, // Initial credits value
  },
});

const User = mongoose.model('userSchema', userSchema);

module.exports = User;
