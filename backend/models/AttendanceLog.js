const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./User");

const AttendanceLog = sequelize.define(
  "AttendanceLog",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    time_in: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    time_out: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    network_ip: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
  },
  {
    tableName: "attendance_logs",
    timestamps: false,
    hooks: {
      beforeCreate: (log) => {
        if (log.time_in) {
          log.date = log.time_in.toISOString().split("T")[0];
        }
      },
      beforeUpdate: (log) => {
        if (log.time_in && !log.date) {
          log.date = log.time_in.toISOString().split("T")[0];
        }
      },
    },
  },
);

// Define association
User.hasMany(AttendanceLog, { foreignKey: "user_id" });
AttendanceLog.belongsTo(User, { foreignKey: "user_id" });

module.exports = AttendanceLog;
