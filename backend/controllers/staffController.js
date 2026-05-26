const bcrypt = require("bcrypt");
const { User } = require("../models");
const { generateQRCodeDataURL } = require("../services/qrService");
const { sendCredentialsEmail } = require("../services/emailService");
const generateRandomPassword = require("../utils/generatePassword");

// Create staff (admin only)
const createStaff = async (req, res) => {
  const { full_name, employee_id, email } = req.body;
  if (!full_name || !employee_id || !email) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  console.log(
    `📝 Creating staff: ${full_name} (${employee_id}), email: ${email}`,
  );

  try {
    // Check if exists
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      console.warn(`⚠️ Staff creation failed: email ${email} already exists`);
      return res.status(409).json({ message: "Email already exists" });
    }

    const plainPassword = generateRandomPassword();
    console.log(`🔑 Generated password for ${email}: ${plainPassword}`);

    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    console.log(`🔒 Password hashed for ${email}`);

    // Generate QR code
    console.log(`📱 Generating QR code for ${employee_id}...`);
    const qrCodeDataUrl = await generateQRCodeDataURL(employee_id, email);
    console.log(`✅ QR code generated for ${employee_id}`);

    const newUser = await User.create({
      full_name,
      employee_id,
      email,
      password: hashedPassword,
      role: "staff",
      qr_code: qrCodeDataUrl,
    });
    console.log(`💾 Staff saved to database with ID: ${newUser.id}`);

    // Send email with credentials (do not block staff creation if email fails)
    let emailSent = false;
    try {
      console.log(`📧 Attempting to send credentials email to ${email}...`);
      await sendCredentialsEmail(email, full_name, employee_id, plainPassword);
      emailSent = true;
      console.log(`✅ Credentials email sent successfully to ${email}`);
    } catch (emailErr) {
      console.error(`❌ Failed to send email to ${email}:`, emailErr.message);
      // Continue – staff is already created
    }

    res.status(201).json({
      message: "Staff created",
      staffId: newUser.id,
      emailSent: emailSent,
    });
  } catch (err) {
    console.error("❌ Create staff error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all staff
const getAllStaff = async (req, res) => {
  console.log("📋 Fetching all staff...");
  try {
    const staff = await User.findAll({
      where: { role: "staff" },
      attributes: ["id", "full_name", "employee_id", "email", "created_at"],
    });
    console.log(`✅ Found ${staff.length} staff members`);
    res.json(staff);
  } catch (err) {
    console.error("❌ Get all staff error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update staff (admin only)
const updateStaff = async (req, res) => {
  const { id } = req.params;
  const { full_name, email } = req.body;
  console.log(`✏️ Updating staff ID ${id}: name=${full_name}, email=${email}`);
  try {
    const staff = await User.findOne({ where: { id, role: "staff" } });
    if (!staff) {
      console.warn(`⚠️ Staff ID ${id} not found`);
      return res.status(404).json({ message: "Staff not found" });
    }
    await staff.update({ full_name, email });
    console.log(`✅ Staff ID ${id} updated`);
    res.json({ message: "Staff updated" });
  } catch (err) {
    console.error(`❌ Update staff error (ID ${id}):`, err);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete staff
const deleteStaff = async (req, res) => {
  const { id } = req.params;
  console.log(`🗑️ Deleting staff ID ${id}`);
  try {
    const staff = await User.findOne({ where: { id, role: "staff" } });
    if (!staff) {
      console.warn(`⚠️ Staff ID ${id} not found for deletion`);
      return res.status(404).json({ message: "Staff not found" });
    }
    await staff.destroy();
    console.log(`✅ Staff ID ${id} deleted`);
    res.json({ message: "Staff deleted" });
  } catch (err) {
    console.error(`❌ Delete staff error (ID ${id}):`, err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get QR code for a staff member (admin or staff themselves)
const getStaffQR = async (req, res) => {
  const { id } = req.params;
  console.log(
    `📱 QR code request for staff ID ${id} (user role: ${req.user.role})`,
  );
  if (req.user.role !== "admin" && req.user.id != id) {
    console.warn(
      `⚠️ Forbidden QR access: user ${req.user.id} tried to access staff ${id}`,
    );
    return res.status(403).json({ message: "Forbidden" });
  }
  try {
    const user = await User.findByPk(id);
    if (!user) {
      console.warn(`⚠️ User ID ${id} not found for QR`);
      return res.status(404).json({ message: "User not found" });
    }
    let qrData = user.qr_code;
    if (!qrData) {
      console.log(`🆕 Generating new QR code for ${user.employee_id}...`);
      qrData = await generateQRCodeDataURL(user.employee_id, user.email);
      await user.update({ qr_code: qrData });
      console.log(`✅ QR code generated and saved for ${user.employee_id}`);
    } else {
      console.log(`📱 Returning existing QR code for ${user.employee_id}`);
    }
    return res.status(200).json({ qrCodeDataUrl: qrData });
  } catch (err) {
    console.error(`❌ QR retrieval error for ID ${id}:`, err);
    return res.status(500).json({ message: "Server error: " + err.message });
  }
};

module.exports = {
  createStaff,
  getAllStaff,
  updateStaff,
  deleteStaff,
  getStaffQR,
};
