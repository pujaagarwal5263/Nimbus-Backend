const fs = require('fs');
const PythonShell = require('python-shell').PythonShell
const CodingQuestion = require("../models/codeSchema")

const pre= "import sys;\n\n"
// const post= (fname,isArray) => {
//   if(isArray){
//     return `\n\nif __name__ == \"__main__\":\n    a=sys.argv[1]\n    b=sys.argv[2]\n    result=int(sys.argv[3])\n    print(${fname}(a,b) == result)`
//   }
//  return `\n\nif __name__ == \"__main__\":\n    a=int(sys.argv[1])\n    b=int(sys.argv[2])\n    result=int(sys.argv[3])\n    print(${fname}(a,b) == result)`
// }

const getParticularCode = async(codeID) =>{
  const codeItem = await CodingQuestion.findById(codeID);
  return codeItem;
}

const codeExecute = async (req, res) => {
  const { code, codeId } = req.body;
  const codeDetails = await getParticularCode(codeId);

  try {
    console.log(codeDetails.post);
    fs.writeFileSync('test.py', pre + code + codeDetails.post);

    // Create an array to store the results of each test case
    const results = [];

    for (const testcase of codeDetails.testcases) {
      // Join the array elements into a comma-separated string
      //const inputString = testcase.inputs.join(',');

      //const inputArray = inputString.split(',').map((numberString) => Number(numberString));
      const inputArray = testcase.inputs;
      let output = testcase.expectedOutput;
      // if(codeDetails.isArray){
      //    output =JSON.parse(testcase.expectedOutput);
      // }
      

      const options = {
        mode: 'text',
        pythonOptions: ['-u'],
        args: [...inputArray, output],
      };
      console.log(options);

      const pythonResults = await PythonShell.run('test.py', options);
      // console.log(pythonResults == output);
      // console.log(pythonResults);
      //console.log(pythonResults[0]);
     
      results.push(pythonResults == output);
    }

    return res.status(200).json({ testResults: results });
  } catch (error) {
    console.error('Error executing Python script:', error);
    return res.status(500).send(error);
  }
};

// const codeExecute = async (req, res) => {
//   const { code, codeId } = req.body;
//   const codeDetails = await getParticularCode(codeId);

//   try {
//     fs.writeFileSync('test.py', pre + code + post(codeDetails.fname,codeDetails.isArray));

//     // Create an array to store the results of each test case
//     const results = [];

//     for (const testcase of codeDetails.testcases) {
//       // Process the input data to handle different types (array, string, number)
//       const inputArray = testcase.inputs;
//       const output = parseInt(testcase.expectedOutput);
//       // Check if the inputArray has exactly 2 elements
//       if (inputArray.length !== 2) {
//         throw new Error('Input must have exactly 2 elements');
//       }

//       const options = {
//         mode: 'text',
//         pythonOptions: ['-u'],
//         args: [...inputArray, output],
//       };

//       const pythonResults = await PythonShell.run('test.py', options);
//       results.push(pythonResults[0]);
//     }

//     return res.status(200).json({ testResults: results });
//   } catch (error) {
//     console.error('Error executing Python script:', error);
//     return res.status(500).send('Internal Server Error');
//   }
// };

// // Function to handle different input types (array, string, number)
// function parseInput(input) {
//   if (Array.isArray(input)) {
//     // If it's an array, flatten it
//     return [].concat(...input);
//   } else if (typeof input === 'string') {
//     // If it's a string, split it by commas and convert to numbers
//     return input.split(',').map((numberString) => Number(numberString.trim()));
//   } else if (typeof input === 'number') {
//     // If it's a number, return it as an array
//     return [input];
//   } else {
//     // Handle other cases or throw an error as needed
//     throw new Error('Unsupported input type');
//   }
// }



const getAllCodes = async(req,res) =>{
  try{
    const codingQuestions = await CodingQuestion.find();
    return res.status(200).json(codingQuestions);
  }catch(err){
    console.log(err);
    return res.status(500).send('Internal Server Error');
  }
}

const getCodeByID = async(req,res) =>{
  try{
    const codeId = req.params.id;
    const codeItem = await CodingQuestion.findById(codeId);

    if (!codeItem) {
      return res.status(404).json({ message: 'Code item not found' });
    }
    //console.log(codeItem);
    return res.status(200).json(codeItem);
  }catch(err){
    console.log(err);
    return res.status(500).send('Internal Server Error');
  }
}


module.exports={codeExecute,getAllCodes,getCodeByID}