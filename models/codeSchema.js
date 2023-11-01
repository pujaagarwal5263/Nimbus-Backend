const mongoose = require('mongoose');

const codeSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  description:{
    type: String
  },
  fname:{
    type: String
  },
  post:{
    type:String
  },
  label:{
    type: String
  },
  isArray:{
    type: Boolean,
    default: false
  },
  input: {
    type: String,
    required: true,
  },
  output: {
    type: String,
    required: true,
  },
  testcases: {
    type: [
      {
        inputs: Array, // Modify this based on your actual testcase data structure
        expectedOutput: String,
      },
    ],
    required: true,
  },
  spaces:{
    type:[
      {
        spaceID: String,
        username: String,
        profileURL: String,
        roomId: String
      }
    ]
  },
  function: {
    type: String,
    required: true,
  },
  solution:{
    type: String
  }
});

const codeQuestions = mongoose.model('codeSchema', codeSchema);

module.exports = codeQuestions;
