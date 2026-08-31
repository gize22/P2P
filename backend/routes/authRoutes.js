const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");

const router = express.Router();

// 1. REGISTER ROUTE (ባክኤንዱ OTP ጄኔሬት አድርጎ ለፍሮንተንድ ይመልሳል)
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
    const otpExpiration = Date.now() + 10 * 60 * 1000; // 10 minutes

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

    // 👈 ፍሮንተንዱ EmailJS ተጠቅሞ እንዲልክ የ otpCode ጄኔሬት ተደርጎ ይመለሳል
    return res.status(201).json({
      message: "Registration successful! Please check your email for the verification code.",
      email: user.email,
      otpCode: otpCode 
    });

  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

// 2. VERIFY OTP ROUTE
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

    return res.status(200).json({ message: "Email verified successfully! You can now login." });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

// 3. LOGIN ROUTE
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

    if (user.role !== "admin" && !user.isVerified) {
      return res.status(400).json({ message: "Please verify your email first with the OTP code sent to your email." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "supersecretkey12345",
      { expiresIn: "1d" }
    );

    return res.status(200).json({
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
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

// 4. FORGOT PASSWORD ROUTE (ሊንክ በ Resend መላኪያ)
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User with this email does not exist" });
    }

    const token = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // ለ 1 ሰዓት የሚሰራ
    await user.save();

    // 👈 ትክክለኛው የ Vercel Live Link (ወይም ሎካል)
    const resetUrl = `https://p2plearn.vercel.app/reset-password/${token}`;

    // 👈 በ Resend በኩል ሊንኩን ወደ ዩሰሩ ኢሜይል መላክ
    await resend.emails.send({
      from: "P2P Learn <onboarding@resend.dev>",
      to: [user.email],
      subject: "Password Reset - P2P Learn",
      html: `<div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto; border: 1px solid #e5e7eb; border-radius: 10px;">
               <h2 style="color: #4f46e5;">Password Reset Request</h2>
               <p>Hello ${user.name}, you requested to reset your password. Click the button below to proceed:</p>
               <a href="${resetUrl}" style="background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; margin-top: 10px;">Reset Password</a>
               <p style="font-size: 12px; color: #6b7280; margin-top: 20px;">This link expires in 1 hour. If you didn't request this, please ignore this email.</p>
             </div>`,
    });

    return res.status(200).json({ message: "Password reset link sent to your email successfully!" });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

// 5. RESET PASSWORD ROUTE
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

    return res.status(200).json({ message: "Password updated successfully!" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;