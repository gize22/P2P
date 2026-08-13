const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      university,
      bio,
      skillsToTeach,
      skillsToLearn
    } = req.body;

    // 1. Required fields መኖራቸውን ማረጋገጥ
    if (!name || !email || !password || !university) {
      return res.status(400).json({
        message: "Please provide name, email, password and university"
      });
    }

    // 2. Email ቀድሞ የተመዘገበ መሆኑን ማረጋገጥ
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User with this email already exists"
      });
    }

    // 3. Password Hash ማድረግ (Security)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Userን MongoDB ውስጥ መፍጠር
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      university,
      bio,
      skillsToTeach,
      skillsToLearn
    });

    // 5. Success Response መመለስ
    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        university: user.university,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
});
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Please provide email and password"
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid email or password"
      });
    }

    // JWT Token ማዘጋጀት (ለ 1 ቀን የሚቆይ)
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful",
      token, // 👈 ቶከኑን እዚህ እንልክለታለን
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
module.exports = router;