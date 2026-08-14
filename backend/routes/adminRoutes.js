const express = require("express");
const User = require("../models/User");
const Group = require("../models/Group");
const Question = require("../models/Question");

const router = express.Router();

// 1. GET PLATFORM STATISTICS (አጠቃላይ የፕላትፎርሙ መረጃዎች)
router.get("/stats", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalGroups = await Group.countDocuments();
    const totalQuestions = await Question.countDocuments();

    res.status(200).json({
      totalUsers,
      totalGroups,
      totalQuestions
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// 2. GET ALL USERS (ሁሉንም ተማሪዎች ለማየት)
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// 3. DELETE USER (ተጠቃሚን ከአስተዳዳሪ በኩል መሰረዝ)
router.delete("/users/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully by admin" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;