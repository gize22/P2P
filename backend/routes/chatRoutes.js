const express = require("express");
const multer = require("multer");
const path = require("path");
const mongoose = require("mongoose");
const Message = require("../models/Message");
const User = require("../models/User"); // 👈 ይህንን ማካተት በጣም አስፈላጊ ነው!

const router = express.Router();

// 1. Multer Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

// 2. GET 1-to-1 Chat History
router.get("/:userId/:otherId", async (req, res) => {
  try {
    const { userId, otherId } = req.params;
    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: otherId },
        { sender: otherId, receiver: userId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// 3. GET Study Group Chat History
router.get("/group/:groupId", async (req, res) => {
  try {
    const { groupId } = req.params;
    
    let queryConditions = [{ groupId: groupId }];
    if (mongoose.Types.ObjectId.isValid(groupId)) {
      queryConditions.push({ groupId: new mongoose.Types.ObjectId(groupId) });
    }

    const messages = await Message.find({ $or: queryConditions })
      .populate("sender", "name email")
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// 4. FILE / IMAGE UPLOAD API
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const fileUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    res.status(200).json({ fileUrl });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;