const express = require("express");
const {
    createQuote,
    deleteQuote,
    getQuotes,
    updateQuote,
} = require("../controllers/quotes.controller");

const router = express.Router();

router.get("/", getQuotes);
router.post("/", createQuote);
router.put("/:id", updateQuote);
router.delete("/:id", deleteQuote);

module.exports = router;
