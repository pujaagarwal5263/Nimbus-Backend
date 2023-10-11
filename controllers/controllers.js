const fs = require('fs');
const PythonShell = require('python-shell').PythonShell
const CodingQuestion = require("../models/codeSchema")
const User = require("../models/userSchema")

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
  const { code, codeId, email } = req.body;
  const codeDetails = await getParticularCode(codeId);

  try {
    //(codeDetails.post);
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
      //console.log(options);

      const pythonResults = await PythonShell.run('test.py', options);
      // console.log(pythonResults == output);
      // console.log(pythonResults);
      //console.log(pythonResults[0]);
     
      results.push(pythonResults == output);
    }
     // Count the number of 'true' values in the results array
    const trueCount = results.filter((result) => result === true).length;

    // Calculate stars earned out of 5
    const starsEarned = Math.round((trueCount / results.length) * 5);

    // Update the user's solvedQuestions array
    const user = await User.findOne({ email });
    const solvedQuestion = user.solvedQuestions.find((sq) => sq.question.equals(codeId));

    if (solvedQuestion) {
      // If the question is already in the array, update the stars
      solvedQuestion.starsEarned = starsEarned;
    } else {
      // If the question is not in the array, add it with stars earned
      user.solvedQuestions.push({
        question: codeId,
        starsEarned,
      });
    }

    await user.save();

    return res.status(200).json({ testResults: results, starsEarned });
    //return res.status(200).json({ testResults: results });
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



// const getAllCodes = async(req,res) =>{
//   try{
//     const codingQuestions = await CodingQuestion.find();
//     return res.status(200).json(codingQuestions);
//   }catch(err){
//     console.log(err);
//     return res.status(500).send('Internal Server Error');
//   }
// }

const getAllCodes = async (req, res) => {
  const userEmail = req.body.email; // Assuming you have the user's email

  try {
    const codingQuestions = await CodingQuestion.find();

    const user = await User.findOne({ email: userEmail });

    const questionsWithStars = codingQuestions.map((question) => {
      // Find the corresponding question in the user's solvedQuestions array
      const solvedQuestion = user.solvedQuestions.find(
        (sq) => sq.question.equals(question._id)
      );

      // Calculate stars for the question or set it to -1 if not solved
      const stars = solvedQuestion ? solvedQuestion.starsEarned : -1;

      // Return the question with stars
      return {
        ...question.toObject(),
        stars,
      };
    });

    return res.status(200).json(questionsWithStars);
  } catch (err) {
    console.log(err);
    return res.status(500).send('Internal Server Error');
  }
};


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

const saveUser = async(req,res) =>{
  try{
    const {email, username, profileURL} = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(200).send('User already saved');
    }

    const newUser = new User({
      email,
      username,
      profileURL,
    });

    await newUser.save();

    return res.status(201).send('User saved');
  }catch(err){
    console.log(err);
    return res.status(500).send('Internal Server Error');
  }
}

const manageCreds = async (req, res) => {
  const { email } = req.body;
  
  try {
    const user = await User.findOne({ email });

    if (user.credits > 0) {
      user.credits -= 5;
      
      await user.save();

      return res.status(200).json({ success: true });
    } else {
      return res.status(200).json({ success: false, message: "Insufficient credits" });
    }
  } catch (error) {
    console.error('Error managing credits:', error);
    return res.status(500).send('Internal Server Error');
  }
};

const addCredits = async (req, res) => {
  const { email } = req.body;
  
  try {
    const user = await User.findOne({ email }); 
      user.credits = 100;    
      await user.save();
      return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error managing credits:', error);
    return res.status(500).send('Internal Server Error');
  }
};


module.exports={codeExecute,getAllCodes,getCodeByID, saveUser, manageCreds,addCredits}