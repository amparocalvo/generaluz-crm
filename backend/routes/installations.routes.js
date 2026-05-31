const express = require("express");
const {
    createInstallation,
    deleteInstallation,
    getInstallations,
    updateInstallation,
} = require("../controllers/installations.controller");

const router = express.Router();

router.get("/", getInstallations);
router.post("/", createInstallation);
router.put("/:id", updateInstallation);
router.delete("/:id", deleteInstallation);

module.exports = router;
