const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Visitor = sequelize.define(
  "Visitor",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    full_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    phone_number: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    purpose: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    host_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    time_in: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    time_out: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "visitors",
    timestamps: false,
  },
);

module.exports = Visitor;
