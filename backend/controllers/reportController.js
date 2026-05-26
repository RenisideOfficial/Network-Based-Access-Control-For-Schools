const { AttendanceLog, User } = require("../models");

const exportAttendanceCSV = async (req, res) => {
  try {
    const logs = await AttendanceLog.findAll({
      include: [{ model: User, attributes: ["full_name", "employee_id"] }],
      order: [["time_in", "DESC"]],
    });

    let csv = "Full Name,Employee ID,Time In,Time Out,Network IP\n";
    logs.forEach((log) => {
      csv += `"${log.User.full_name}",${log.User.employee_id},${log.time_in},${log.time_out || ""},${log.network_ip}\n`;
    });
    res.header("Content-Type", "text/csv");
    res.attachment("attendance_report.csv");
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { exportAttendanceCSV };
