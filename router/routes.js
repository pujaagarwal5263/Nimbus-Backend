const express = require("express")
const router = express.Router();
const controllers = require("../controllers/controllers")

router.post("/execute",controllers.codeExecute);
router.get("/allcodes",controllers.getAllCodes);
router.get("/code/:id",controllers.getCodeByID);

module.exports = router;