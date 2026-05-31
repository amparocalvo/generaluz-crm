const express = require("express");
const {
    createClient,
    deleteClient,
    getClients,
    updateClient,
} = require("../controllers/clients.controller");

const router = express.Router();

router.get("/", getClients);
router.post("/", createClient);
router.put("/:id", updateClient);
router.delete("/:id", deleteClient);

module.exports = router;
