const sequelize = require("../config/db");
const User = require("./User");
const AttendanceLog = require("./AttendanceLog");
const Visitor = require("./Visitor");

// Set up associations (if not already inside models)
User.hasMany(AttendanceLog, { foreignKey: "user_id" });
AttendanceLog.belongsTo(User, { foreignKey: "user_id" });

const syncDatabase = async () => {
  await sequelize.authenticate();
  console.log("Database connected");
  await sequelize.sync({ alter: true }); // or just sync()
  console.log("All models synced");
};

module.exports = { sequelize, User, AttendanceLog, Visitor, syncDatabase };
