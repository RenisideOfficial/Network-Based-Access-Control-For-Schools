const { User, AttendanceLog, Visitor } = require("../models");
const { Op } = require("sequelize");
const sequelize = require("../config/db");

const getStats = async (req, res) => {
  try {
    const totalStaff = await User.count({ where: { role: "staff" } });

    const today = new Date().toISOString().split("T")[0];
    const todayAttendance = await AttendanceLog.count({
      where: sequelize.where(
        sequelize.fn("DATE", sequelize.col("time_in")),
        today,
      ),
    });

    const activeNow = await AttendanceLog.count({
      where: { time_out: null },
    });

    const todayVisitors = await Visitor.count({
      where: sequelize.where(
        sequelize.fn("DATE", sequelize.col("time_in")),
        today,
      ),
    });

    res.json({
      totalStaff,
      todayAttendance,
      activeNow,
      todayVisitors,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getStats };
