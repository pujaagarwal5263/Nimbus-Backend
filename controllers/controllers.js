const fs = require("fs");
const PythonShell = require("python-shell").PythonShell;
const CodingQuestion = require("../models/codeSchema");
const User = require("../models/userSchema");
const axios = require('axios');

const pre = "import sys;\n\n";

const getParticularCode = async (codeID) => {
  const codeItem = await CodingQuestion.findById(codeID);
  return codeItem;
};

const codeExecute = async (req, res) => {
  const { code, codeId, email } = req.body;
  const codeDetails = await getParticularCode(codeId);

  try {
    fs.writeFileSync("test.py", pre + code + codeDetails.post);

    const results = [];

    for (const testcase of codeDetails.testcases) {
      const inputArray = testcase.inputs;
      let output = testcase.expectedOutput;

      const options = {
        mode: "text",
        pythonOptions: ["-u"],
        args: [...inputArray, output],
      };

      const pythonResults = await PythonShell.run("test.py", options);
      results.push(pythonResults == output);
    }
    const trueCount = results.filter((result) => result === true).length;
    const starsEarned = Math.round((trueCount / results.length) * 5);

    const user = await User.findOne({ email });
    if(user){
    const solvedQuestion = user.solvedQuestions.find((sq) =>
      sq.question.equals(codeId)
    );

    if (solvedQuestion) {
      solvedQuestion.starsEarned = starsEarned;
    } else {
      user.solvedQuestions.push({
        question: codeId,
        starsEarned,
        solvedAt: Date.now(),
      });
    }

    if (!user.contributions || user.contributions.length === 0) {
      user.contributions = [];
    }

    const today = new Date().toISOString().split("T")[0];
    console.log(today);
    const userContribution = user.contributions.find((c) => c.date == today);

    if (userContribution) {
      userContribution.count += 1;
    } else {
      user.contributions.push({ date: today, count: 1 });
    }

    await user.save();
  
    return res.status(200).json({ testResults: results, starsEarned });
  }
  else{
    return res.status(200).json({ testResults: results });
  }
    //return res.status(200).json({ testResults: results });
  } catch (error) {
    console.error("Error executing Python script:", error);
    return res.status(500).send(error);
  }
};

const getAllCodes = async (req, res) => {
  const userEmail = req.body.email;

  try {
    const codingQuestions = await CodingQuestion.find();

    const user = await User.findOne({ email: userEmail });

    const questionsWithStars = codingQuestions.map((question) => {
      const solvedQuestion = user.solvedQuestions.find((sq) =>
        sq.question.equals(question._id)
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
    return res.status(500).send("Internal Server Error");
  }
};

const getCodeByID = async (req, res) => {
  try {
    const codeId = req.params.id;
    const codeItem = await CodingQuestion.findById(codeId);

    if (!codeItem) {
      return res.status(404).json({ message: "Code item not found" });
    }
    return res.status(200).json(codeItem);
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error");
  }
};

const saveUser = async (req, res) => {
  try {
    const { email, username, profileURL } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(200).send("User already saved");
    }

    const newUser = new User({
      email,
      username,
      profileURL,
    });

    await newUser.save();

    return res.status(201).send("User saved");
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error");
  }
};

const manageCreds = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user.credits > 0) {
      user.credits -= 5;

      await user.save();

      return res.status(200).json({ success: true });
    } else {
      return res
        .status(200)
        .json({ success: false, message: "Insufficient credits" });
    }
  } catch (error) {
    console.error("Error managing credits:", error);
    return res.status(500).send("Internal Server Error");
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
    console.error("Error managing credits:", error);
    return res.status(500).send("Internal Server Error");
  }
};

const registerSpace = async (req, res) => {
  console.log("object");
  const { codeID, spaceID, username, profileURL } = req.body;

  try {
    const code = await CodingQuestion.findOne({ _id: codeID });
    if (!code) {
      return res.status(404).json({ error: "Code not found" });
    }
    // const response = await fetch(`https://api.videosdk.live/v2/rooms`, {
    //   method: "POST",
    //   headers: {
    //     authorization: `${process.env.VIDEOSDK_TOKEN}`,
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({}),
    // });
    // const { roomId } = await response.json();

    const response = await axios.post('https://api.videosdk.live/v2/rooms', {}, {
      headers: {
        Authorization: `${process.env.VIDEOSDK_TOKEN}`,
        'Content-Type': 'application/json',
      }
    });
  
    const { data: { roomId } } = response;

    code.spaces.push({
      spaceID,
      username,
      profileURL,
      roomId,
    });

    const updatedCode = await code.save();

    return res.status(200).json(updatedCode);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
};

const getRoomIDFromSpace = async (req, res) => {
  try {
    const spaceID = req.body.spaceID;
    // b54c8ce2-a579-43f7-86b6-c315a02c01de
    // Find the user and space that matches the provided spaceID
    const existingSpace = await CodingQuestion.findOne({
      "spaces.spaceID": spaceID,
    });

    if (existingSpace) {
      const space = existingSpace.spaces.find(space => space.spaceID === spaceID);
      const roomID = space.roomId;
      return res.status(200).json({ roomID });
    } else {
      return res.status(404).send("Room not found");
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error");
  }
};

const getAllSpacesForCode = async (req, res) => {
  const { codeID } = req.body;

  try {
    const code = await CodingQuestion.findOne({ _id: codeID });

    if (!code) {
      return res.status(404).json({ error: "Code not found" });
    }
    const spaces = code.spaces;

    return res.status(200).json(spaces);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
};

const deleteSpace = async (req, res) => {
  try {
    const { codeID, spaceID } = req.body;

    const code = await CodingQuestion.findOne({ _id: codeID });

    if (!code) {
      return res.status(404).json({ message: "Code not found" });
    }

    code.spaces = code.spaces.filter((space) => space.spaceID !== spaceID);
    await code.save();

    return res.json({ message: "Space deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

const userContributions = async (req, res) => {
  const { email } = req.query;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user.contributions);
  } catch (error) {
    console.error("Error fetching contributions:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const solvedQuestions = async (req, res) => {
  const { email } = req.query; // Assuming the user's email is provided as a query parameter

  try {
    // Find the user based on the provided email and populate solved questions with question details from the codeSchema
    const user = await User.findOne({ email })
      .populate({
        path: "solvedQuestions.question",
        model: CodingQuestion,
        select: "question", // Add other fields you want to retrieve from codeSchema
      })
      .exec();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.solvedQuestions.reverse();
    const formattedSolvedQuestions = user.solvedQuestions.map(
      (solvedQuestion) => {
        return {
          question: solvedQuestion.question.question,
          starsEarned: solvedQuestion.starsEarned,
          solvedAt: solvedQuestion.solvedAt.toDateString(), // Format date as "Day Month DD YYYY"
        };
      }
    );

    res.status(200).json(formattedSolvedQuestions);
  } catch (error) {
    console.error("Error fetching solved questions:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  codeExecute,
  getAllCodes,
  getCodeByID,
  saveUser,
  manageCreds,
  addCredits,
  registerSpace,
  getAllSpacesForCode,
  deleteSpace,
  userContributions,
  solvedQuestions,
  getRoomIDFromSpace
};
