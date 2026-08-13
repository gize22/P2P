const express = require("express");
const multer = require("multer");
const path = require("path");
const Message = require("../models/Message");

const router = express.Router();

// 1. Multer Configuration (ፋይሎችና ምስሎች የሚቀመጡበት ቅንብር)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // backend/uploads/ ፎልደር ውስጥ ይቀመጣል
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // የተለየ ስም ይሰጠዋል
  },
});
const upload = multer({ storage: storage });

// 2. GET 1-to-1 Chat History (የሁለት ተማሪዎች የቻት ታሪክ)
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

// 3. GET Study Group Chat History (የግሩፕ ቻት ታሪክ ከ ስም/Sender Name ጋር)
router.get("/group/:groupId", async (req, res) => {
  try {
    const messages = await Message.find({ groupId: req.params.groupId })
      .populate("sender", "name") // 👈 የላኪውን ስም (Name) ከ User collection ያመጣል
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// 4. FILE / IMAGE UPLOAD API (ምስል ወይም ፋይል ዩፕሎድ ማድረጊያ)
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // የፋይሉ URL
    const fileUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    res.status(200).json({ fileUrl });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;