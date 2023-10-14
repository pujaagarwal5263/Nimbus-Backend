const fs = require('fs');
const PythonShell = require('python-shell').PythonShell
const CodingQuestion = require("../models/codeSchema")
const User = require("../models/userSchema")

const pre= "import sys;\n\n"

const getParticularCode = async(codeID) =>{
  const codeItem = await CodingQuestion.findById(codeID);
  return codeItem;
}

const codeExecute = async (req, res) => {
  const { code, codeId, email } = req.body;
  const codeDetails = await getParticularCode(codeId);

  try {
    fs.writeFileSync('test.py', pre + code + codeDetails.post);

    const results = [];

    for (const testcase of codeDetails.testcases) {
      const inputArray = testcase.inputs;
      let output = testcase.expectedOutput;
     
      const options = {
        mode: 'text',
        pythonOptions: ['-u'],
        args: [...inputArray, output],
      };

      const pythonResults = await PythonShell.run('test.py', options);
      results.push(pythonResults == output);
    }
    const trueCount = results.filter((result) => result === true).length;
    const starsEarned = Math.round((trueCount / results.length) * 5);

    const user = await User.findOne({ email });
    const solvedQuestion = user.solvedQuestions.find((sq) => sq.question.equals(codeId));

    if (solvedQuestion) {
      solvedQuestion.starsEarned = starsEarned;
    } else {
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


const getAllCodes = async (req, res) => {
  const userEmail = req.body.email; 

  try {
    const codingQuestions = await CodingQuestion.find();

    const user = await User.findOne({ email: userEmail });

    const questionsWithStars = codingQuestions.map((question) => {
      const solvedQuestion = user.solvedQuestions.find(
        (sq) => sq.question.equals(question._id)
      );

      const stars = solvedQuestion ? solvedQuestion.starsEarned : -1;

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