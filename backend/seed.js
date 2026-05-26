// seed.js
require("dotenv").config();
const bcrypt = require("bcrypt");
const { sequelize, User } = require("./models");

const seedDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected.");

    // 1. Create admin if not exists
    const [admin, adminCreated] = await User.findOrCreate({
      where: { email: "admin@company.com" },
      defaults: {
        full_name: "System Administrator",
        employee_id: "ADMIN001",
        email: "admin@company.com",
        password: await bcrypt.hash("Admin@123", 10),
        role: "admin",
        qr_code: null,
      },
    });
    if (adminCreated) {
      console.log("Admin created: admin@company.com / Admin@123");
    } else {
      console.log("Admin already exists.");
    }

    // 2. Create a demo staff account (for testing staff login)
    const [staff, staffCreated] = await User.findOrCreate({
      where: { email: "john.doe@company.com" },
      defaults: {
        full_name: "John Doe",
        employee_id: "EMP001",
        email: "john.doe@company.com",
        password: await bcrypt.hash("Staff@123", 10),
        role: "staff",
        qr_code: null, // QR will be generated when staff views it
      },
    });

    if (staffCreated) {
      console.log("Demo staff created: john.doe@company.com / Staff@123");
      console.log("Staff ID:", staff.id);
    } else {
      console.log("Demo staff already exists.");
    }

    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
};

seedDatabase();
