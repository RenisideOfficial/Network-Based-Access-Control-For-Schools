const express = require("express");
const { getStats } = require("../controllers/dashboardController");
const authMiddleware = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");
const router = express.Router();

router.get("/stats", authMiddleware, roleCheck(["admin"]), getStats);

module.exports = router;
