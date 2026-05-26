const express = require("express");
const {
  checkIn,
  checkOut,
  getAttendanceLogs,
} = require("../controllers/attendanceController");
const authMiddleware = require("../middleware/auth");
const networkValidation = require("../middleware/networkValidation");
const roleCheck = require("../middleware/roleCheck");
const router = express.Router();

router.use(authMiddleware);
router.post("/check-in", networkValidation, checkIn);
router.post("/check-out", networkValidation, checkOut);
router.get("/logs", roleCheck(["admin"]), getAttendanceLogs);

module.exports = router;
