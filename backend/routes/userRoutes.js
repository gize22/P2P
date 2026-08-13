const express = require("express");
const User = require("../models/User");

const router = express.Router();

// 1. GET ALL USERS (ወይም በ Skill መፈለግ - Search)
router.get("/", async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      query = {
        $or: [
          { skillsToTeach: { $regex: search, $options: "i" } },
          { name: { $regex: search, $options: "i" } }
        ]
      };
    }

    const users = await User.find(query).select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// 2. GET SINGLE USER BY ID (የአንድን ተማሪ Profile ማየት)
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// 3. 👈 UPDATE USER PROFILE (የፕሮፋይል ማስተካከያ API - አዲስ የተጨመረ)
router.put("/:id", async (req, res) => {
  try {
    const { name, university, bio, skillsToTeach, skillsToLearn } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        name,
        university,
        bio,
        skillsToTeach,
        skillsToLearn
      },
      { new: true } // የተስተካከለውን አዲስ ዴታ እንዲመልስ
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;