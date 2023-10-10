const fs = require('fs');
const PythonShell = require('python-shell').PythonShell
const CodingQuestion = require("../models/codeSchema")

const pre= "import sys;\n\n"
const post = "\n\nif __name__ == \"__main__\":\n    a=int(sys.argv[1])\n    b=int(sys.argv[2])\n    result=int(sys.argv[3])\n    print(add(a,b) == result)"
      

const codeExecute = async(req,res) =>{
    const { code } = req.body;
    //console.log(code);
    try {
      fs.writeFileSync('test.py', pre+code+post);
  
      const options = {
        mode: 'text',
        pythonOptions: ['-u'], 
        args: [1, 2, 3],
      };
  
      const pythonResults = await PythonShell.run('test.py', options);
      return res.status(200).json({passOrFail: pythonResults[0]});
    } catch (error) {
      console.error('Error executing Python script:', error);
      return res.status(500).send('Internal Server Error');
    }
}

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