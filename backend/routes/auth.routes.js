const express = require("express");
const { getSession, login, register } = require("../controllers/auth.controller");
const requireAuth = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.get("/me", requireAuth, getSession);

module.exports = router;
