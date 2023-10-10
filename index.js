const express = require('express');
const bodyParser = require('body-parser');
const { configDotenv } = require('dotenv');
configDotenv();
require("./db-connection")
//require("./code-insertion")

const cors = require("cors")
const Router = require("./router/routes")

const app = express();
const port = 8000;

app.use(bodyParser.json());
app.use(cors())
app.use(Router);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
