const express = require("express");
const {
  createStaff,
  getAllStaff,
  updateStaff,
  deleteStaff,
  getStaffQR,
} = require("../controllers/staffController");
const authMiddleware = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");
const router = express.Router();

router.use(authMiddleware);
router.post("/", roleCheck(["admin"]), createStaff);
router.get("/", roleCheck(["admin"]), getAllStaff);
router.put("/:id", roleCheck(["admin"]), updateStaff);
router.delete("/:id", roleCheck(["admin"]), deleteStaff);
router.get("/:id/qrcode", roleCheck(["admin", "staff"]), getStaffQR); // staff can see own QR

module.exports = router;
