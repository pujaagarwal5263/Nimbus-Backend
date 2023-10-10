const mongoose = require('mongoose');
const CodingQuestion = require('./models/codeSchema'); 

const questionData=
    {
      question: 'Add two numbers',
      input: '2, 3',
      output: '5',
      testcases: [{ inputs: ['2, 3'], expectedOutput: '5' },{ inputs: ['5, 1'], expectedOutput: '6' }],
      function: 'def add(a, b) return',
    }

    async function insertCodingQuestion() {
        try {
          const newQuestion = new CodingQuestion(questionData);
          await newQuestion.save();
          console.log('Coding question inserted successfully.');
        } catch (error) {
          console.error('Error inserting coding question:', error);
        }
      }

      insertCodingQuestion();