const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const { Resend } = require("resend");

const router = express.Router();

// 👈 የ Gmail SMTP ማዋቀር
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

// 1. REGISTER ROUTE (OTP ጄኔሬት አድርጎ ወደ ጂሜይል የሚልክ)
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

    const resend = new Resend(process.env.RESEND_API_KEY);

// Register ሪውት ውስጥ ኢሜይል ሲላክ:
try {
   const data = await resend.emails.send({
     from: "P2P Learn <onboarding@resend.dev>",
     to: [user.email],
     subject: "Email Verification OTP - P2P Learn",
     html: `<div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
              <h2>Welcome to P2P Learn, ${user.name}!</h2>
              <p>Your email verification code is:</p>
              <h1 style="color: #4f46e5; letter-spacing: 2px;">${otpCode}</h1>
              <p>This code expires in 10 minutes.</p>
            </div>`,
   });
   console.log("Resend API Success Response:", data);
 } catch (resendErr) {
   console.error("CRITICAL RESEND API ERROR:", resendErr);
 }

    return res.status(201).json({
      message: "Registration successful! Please check your email for the verification code.",
      email: user.email,
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

// 4. FORGOT PASSWORD ROUTE
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User with this email does not exist" });
    }

    const token = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    const resetUrl = `https://p2plearn.vercel.app/reset-password/${token}`;

    await transporter.sendMail({
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: "Password Reset - P2P Learn",
      html: `<div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
               <h2>Password Reset Request</h2>
               <p>Click the button below to reset your password. This link expires in 1 hour.</p>
               <a href="${resetUrl}" style="background: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
             </div>`,
    });

    return res.status(200).json({ message: "Password reset link sent to your email" });
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