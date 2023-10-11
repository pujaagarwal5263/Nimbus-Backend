const express = require("express")
const router = express.Router();
const controllers = require("../controllers/controllers")

router.post("/execute",controllers.codeExecute);
router.post("/allcodes",controllers.getAllCodes);
router.get("/code/:id",controllers.getCodeByID);
router.post("/saveuser", controllers.saveUser);
router.post("/managecreds",controllers.manageCreds)
router.post("/addcredits",controllers.addCredits)

module.exports = router;