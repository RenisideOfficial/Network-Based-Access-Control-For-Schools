const nodemailer = require("nodemailer");

console.log("📧 Initializing email service...");
console.log("EMAIL_HOST:", process.env.EMAIL_HOST);
console.log("EMAIL_PORT:", process.env.EMAIL_PORT);
console.log("EMAIL_USER:", process.env.EMAIL_USER);
// Do not log password

// Create transporter with explicit options
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, // only for development
  },
  debug: true, // enable debug output
  logger: true, // log to console
});

// Verify connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Email transporter verification failed:", error.message);
  } else {
    console.log("✅ Email transporter ready to send messages");
  }
});

const sendCredentialsEmail = async (
  toEmail,
  fullName,
  employeeId,
  tempPassword,
) => {
  console.log(
    `📧 Attempting to send email to ${toEmail} for staff ${fullName} (${employeeId})`,
  );

  const subject = "Your Entry Log System Credentials";
  const html = `
    <h3>Welcome ${fullName}</h3>
    <p>Your account has been created in the Entry Log System.</p>
    <p><strong>Employee ID:</strong> ${employeeId}</p>
    <p><strong>Email:</strong> ${toEmail}</p>
    <p><strong>Temporary Password:</strong> <code>${tempPassword}</code></p>
    <p>Please login at: <a href="http://127.0.0.1:5500/frontend/index.html">Entry Log System</a></p>
    <p>After logging in, you can check in/out and view your QR code.</p>
    <hr>
    <p><em>This is an automated message. Please do not reply.</em></p>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"Entry Log System" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject,
      html,
    });
    console.log(
      `✅ Email sent successfully to ${toEmail}. Message ID: ${info.messageId}`,
    );
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Failed to send email to ${toEmail}:`, error.message);
    if (error.response) console.error("SMTP Response:", error.response);
    throw new Error(`Email sending failed: ${error.message}`);
  }
};

module.exports = { sendCredentialsEmail };
