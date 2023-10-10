const mongoose = require('mongoose');
const CodingQuestion = require('./models/codeSchema'); 

// const questionData=
//     {
//       question: 'Add two numbers',
//       input: '2, 3',
//       output: '5',
//       testcases: [{ inputs: [2, 3], expectedOutput: '5' },{ inputs: [5, 1], expectedOutput: '6' },{ inputs: [0, 0], expectedOutput: '0' }],
//       function: 'def add(a, b): return',
//     }

// const questionData=
//     {
//       question: 'Calculate the Hypotenuse of a Right Triangle',
//       description: "This code takes the lengths of two sides of a right triangle (a and b) as input and calculates the length of the hypotenuse (c) using the Pythagorean theorem.",
//       fname:'calculate_hypotenuse',
//       input: '3, 4',
//       output: '5.0',
//       testcases: [{ inputs: [3, 4], expectedOutput: '5.0' },{ inputs: [8, 6], expectedOutput: '10.0' }],
//       function: 'def calculate_hypotenuse(a, b): return c',
//     }

// const questionData=
//     {
//       question: 'Calculate and sum up the length of arrays',
//       description: "This code takes the two arrays, you need to sum up legths of both and return",
//       fname:'len_sum',
//       input: '[2,3,4],[5,6]',
//       output: '5',
//       testcases: [{ inputs: [[2,3,4],[5,6]], expectedOutput: '5' },{ inputs: [[8], [6]], expectedOutput: '2' }],
//       function: 'def len_sum(a, b): return',
//     }

// const questionData=
//     {
//       question: 'Merge Arrays',
//       description: "This code takes the two arrays, and merges them",
//       fname:'merge_arr',
//       input: '[2,3,4],[5,6]',
//       output: '[2,3,4,5,6]',
//       testcases: [{ inputs: [[2,3,4],[5,6]], expectedOutput: '[2,3,4,5,6]' }],
//       function: 'def merge_arr(arr1, arr2): return',
//       post:"\n\nif __name__ == \"__main__\":\n    input_str1 = sys.argv[1]\n array1 = [int(x) for x in input_str1.split(',')]\n input_str2 = sys.argv[2]\n array2 = [int(x) for x in input_str2.split(',')]\n   merged_array = merge_arrays(array1, array2)\n    merged_array=sys.argv[3]\n    print(merge_arr(a,b) == merged_array)",
//       pre:"",
//     }

const questionData=
    {
      question: 'Reverse digits of Number',
      input: '123',
      output: '321',
      testcases: [{ inputs: [123], expectedOutput: '321' },{ inputs: [51], expectedOutput: '15' },{ inputs: [98], expectedOutput: '89' }],
      function: 'def palindrome(a, b): return',
      post:"\n\nif __name__ == \"__main__\":\n    a=int(sys.argv[1])\n    result=int(sys.argv[2])\n    print(palindrome(a))",
      fname:'palindrome',
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