const express = require("express");
const {
  registerVisitor,
  updateVisitorExit,
  getAllVisitors,
} = require("../controllers/visitorController");
const authMiddleware = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");
const router = express.Router();

router.post("/", authMiddleware, roleCheck(["admin"]), registerVisitor);
router.put(
  "/:id/exit",
  authMiddleware,
  roleCheck(["admin"]),
  updateVisitorExit,
);
router.get("/", authMiddleware, roleCheck(["admin"]), getAllVisitors);

module.exports = router;
