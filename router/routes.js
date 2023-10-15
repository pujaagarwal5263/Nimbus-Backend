const express = require("express")
const router = express.Router();
const controllers = require("../controllers/controllers")

router.post("/execute",controllers.codeExecute);
router.post("/allcodes",controllers.getAllCodes);
router.get("/code/:id",controllers.getCodeByID);
router.post("/saveuser", controllers.saveUser);
router.post("/managecreds",controllers.manageCreds)
router.post("/addcredits",controllers.addCredits)
router.post("/registerspace",controllers.registerSpace);
router.post("/getspaces",controllers.getAllSpacesForCode)
router.post("/deletespace",controllers.deleteSpace)

module.exports = router;