const express = require("express");
const { exportAttendanceCSV } = require("../controllers/reportController");
const authMiddleware = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");
const router = express.Router();

router.get(
  "/attendance/csv",
  authMiddleware,
  roleCheck(["admin"]),
  exportAttendanceCSV,
);

module.exports = router;
