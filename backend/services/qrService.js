const QRCode = require("qrcode");

const generateQRCodeDataURL = async (employeeId, email) => {
  try {
    // Use the frontend URL from environment or default to Live Server URL
    const baseUrl =
      process.env.FRONTEND_URL || "http://127.0.0.1:5500/frontend";
    // QR points directly to the login page with employee_id
    const qrData = `${baseUrl}/index.html?employee_id=${employeeId}`;
    return await QRCode.toDataURL(qrData);
  } catch (error) {
    console.error("QR generation failed:", error);
    throw new Error("QR generation failed");
  }
};

module.exports = { generateQRCodeDataURL };
