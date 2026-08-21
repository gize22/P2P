const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require("../models/User");

const router = express.Router();

// Nodemailer Transporter (ኢሜይል ለመላክ)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 1. REGISTER ROUTE (OTP ወደ ኢሜይል ይልካል, isVerified = false ይሆናል)
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, university, skillsToTeach, skillsToLearn } = req.body;

    if (!name || !email || !password || !university) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    let user = await User.findOne({ email });
    if (user && user.isVerified) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP
    const otpExpiration = Date.now() + 10 * 60 * 1000; // ለ 10 ደቂቃ ብቻ የሚሰራ

    if (user && !user.isVerified) {
      user.name = name;
      user.password = hashedPassword;
      user.university = university;
      user.skillsToTeach = skillsToTeach;
      user.skillsToLearn = skillsToLearn;
      user.otp = otpCode;
      user.otpExpires = otpExpiration;
      await user.save();
    } else {
      user = await User.create({
        name,
        email,
        password: hashedPassword,
        university,
        skillsToTeach,
        skillsToLearn,
        isVerified: false,
        otp: otpCode,
        otpExpires: otpExpiration,
      });
    }

    // OTP ኮድ በኢሜይል መላክ
    await transporter.sendMail({
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: "Email Verification OTP - P2P Learn",
      text: `Your verification code is: ${otpCode}. It expires in 10 minutes.`,
    });

    res.status(201).json({
      message: "Registration successful. Please check your email for the OTP verification code.",
      email: user.email,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// 2. VERIFY OTP ROUTE (ኢሜይል ማረጋገጫ ኮድ መቀበያ)
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Account is already verified" });
    }

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP code" });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Email verified successfully! You can now login." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// 3. LOGIN ROUTE (Verified መሆኑን ማረጋገጥ)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // ኢሜይሉ ያልተረጋገጠ ከሆነ ሎጊን ከልከል
    if (!user.isVerified) {
      return res.status(400).json({ message: "Please verify your email first with the OTP code sent to your email." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        university: user.university,
        role: user.role,
        skillsToTeach: user.skillsToTeach,
        skillsToLearn: user.skillsToLearn
      }
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
});

// 4. FORGOT PASSWORD ROUTE (ሊንክ ወደ ኢሜይል መላኪያ)
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User with this email does not exist" });
    }

    const token = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetUrl = `http://localhost:5173/reset-password/${token}`;

    await transporter.sendMail({
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: "Password Reset - P2P Learn",
      text: `Click the link below to reset your password:\n\n${resetUrl}\n`,
    });

    res.status(200).json({ message: "Password reset link sent to your email" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// 5. RESET PASSWORD ROUTE (አዲስ ፓስወርድ መቀበያ)
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Password reset token is invalid or has expired" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password updated successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;