const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const { promisify } = require('util');
const PythonShell = require('python-shell').PythonShell
const cors = require("cors")

const app = express();
const port = 8000;

app.use(bodyParser.json());
app.use(cors())

// const runPythonScript = promisify(PythonShell.run);

app.post('/execute', async (req, res) => {
  const { code } = req.body;
  //console.log(code);
  try {
    const pre= "import sys;\n\n"
    const post = "\n\nif __name__ == \"__main__\":\n    a=int(sys.argv[1])\n    b=int(sys.argv[2])\n    result=int(sys.argv[3])\n    print(add(a,b) == result)"
    // Write the code to a Python file
    fs.writeFileSync('test.py', pre+code+post);

    const options = {
      mode: 'text',
      pythonOptions: ['-u'], // get print results in real-time
      args: [1, 2, 3],
    };

    // Execute the Python script using the promisified function
    const pythonResults = await PythonShell.run('test.py', options);
    console.log(pythonResults);
    return res.status(200).json({passOrFail: pythonResults[0]});
  } catch (error) {
    console.error('Error executing Python script:', error);
    return res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
