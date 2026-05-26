const { AttendanceLog, User } = require("../models");
const { Op } = require("sequelize");
const sequelize = require("../config/db"); // ✅ required for sequelize.fn/col

// Helper to get today's date in YYYY-MM-DD
const getTodayDate = () => new Date().toISOString().split("T")[0];

// Check-in (network validation already passed)
const checkIn = async (req, res) => {
  const userId = req.user.id;
  const clientIp = req.clientIp; // set by networkValidation middleware

  try {
    const today = getTodayDate();

    // Find active session for today without checkout
    const activeSession = await AttendanceLog.findOne({
      where: {
        user_id: userId,
        time_out: null,
        [Op.and]: sequelize.where(
          sequelize.fn("DATE", sequelize.col("time_in")),
          today,
        ),
      },
    });

    if (activeSession) {
      return res.status(400).json({
        message: "Already checked in today without checkout",
      });
    }

    const now = new Date();
    const log = await AttendanceLog.create({
      user_id: userId,
      time_in: now,
      network_ip: clientIp || null,
    });

    res.status(201).json({
      message: "Check-in successful",
      time_in: now,
      log_id: log.id,
    });
  } catch (err) {
    console.error("Check-in error:", err);
    res.status(500).json({ message: "Server error during check-in" });
  }
};

// Check-out
const checkOut = async (req, res) => {
  const userId = req.user.id;

  try {
    const activeLog = await AttendanceLog.findOne({
      where: { user_id: userId, time_out: null },
      order: [["time_in", "DESC"]],
    });

    if (!activeLog) {
      return res
        .status(404)
        .json({ message: "No active check-in session found" });
    }

    const now = new Date();
    await activeLog.update({ time_out: now });

    res.json({
      message: "Check-out successful",
      time_out: now,
      log_id: activeLog.id,
    });
  } catch (err) {
    console.error("Check-out error:", err);
    res.status(500).json({ message: "Server error during check-out" });
  }
};

// Get logs (admin only)
const getAttendanceLogs = async (req, res) => {
  const { date, user_id } = req.query;
  const whereClause = {};

  if (user_id) whereClause.user_id = user_id;
  if (date) {
    whereClause.time_in = {
      [Op.between]: [`${date} 00:00:00`, `${date} 23:59:59`],
    };
  }

  try {
    const logs = await AttendanceLog.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          attributes: ["full_name", "employee_id"],
        },
      ],
      order: [["time_in", "DESC"]],
    });

    res.json(logs);
  } catch (err) {
    console.error("Get logs error:", err);
    res.status(500).json({ message: "Server error while fetching logs" });
  }
};

module.exports = { checkIn, checkOut, getAttendanceLogs };
