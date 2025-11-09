import express from "express";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sgMail from "@sendgrid/mail";
import pkg from "pg";
import cors from "cors";

dotenv.config();
const app = express();
app.use(express.json());

// ✅ CORS setup
app.use(
  cors({
    origin: ["http://localhost:5500", "http://127.0.0.1:5500"],
    methods: ["GET", "POST"],
    credentials: true,
  })
);

// 📦 PostgreSQL connection setup
const { Pool } = pkg;
const pool = new Pool({
  user: "vimla",
  host: "localhost",
  database: "tracker",
  password: "vimla@123",
  port: 5432,
});

// 🔐 SendGrid setup
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// 📤 Forgot Password Route
app.post("/api/password/forgot", async (req, res) => {
  const { email } = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if (result.rows.length === 0) {
      console.log("❌ User not found:", email);
      return res.status(404).json({ message: "User not found" });
    }

    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "15m" });
    const resetLink = `${process.env.FRONTEND_URL}/reset-password.html?token=${token}`;

    const msg = {
      to: email,
      from: process.env.SENDER_EMAIL,
      subject: "MediPin | Password Reset Request",
      html: `
        <h2>Password Reset Request</h2>
        <p>We received a request to reset your MediPin account password.</p>
        <p>Click below to reset it (valid for 15 minutes):</p>
        <a href="${resetLink}" style="background:#4a95a6;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;">Reset Password</a>
        <p>If you didn’t request this, you can safely ignore this email.</p>
      `,
    };

    await sgMail.send(msg);
    console.log("✅ Reset link sent to:", email);
    res.json({ message: "Reset link sent successfully!" });
  } catch (error) {
    console.error("🚨 Error sending reset link:", error);
    res.status(500).json({ message: "Failed to send reset link." });
  }
});

// 🔒 Reset Password Route
app.post("/api/password/reset", async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query("UPDATE users SET password = $1 WHERE email = $2", [
      hashedPassword,
      decoded.email,
    ]);

    console.log("✅ Password updated for:", decoded.email);
    res.json({ message: "Password reset successfully!" });
  } catch (error) {
    console.error("🚨 Error resetting password:", error);
    res.status(400).json({ message: "Invalid or expired token." });
  }
});

// 🚀 Start server on port 5050
app.listen(5050, () => console.log("✅ Mail server running on http://localhost:5050"));
