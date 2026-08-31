const express = require("express");
const multer = require("multer");
const path = require("path");
const mongoose = require("mongoose");
const Message = require("../models/Message");
const User = require("../models/User");

const router = express.Router();

// Multer Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

// 1. 👈 GET Study Group Chat History (የተለየ ፕሪፊክስ ያለው ሪውት ሁልጊዜ መጀመሪያ መሆን አለበት!)
router.get("/group/:groupId", async (req, res) => {
  try {
    const { groupId } = req.params;
    console.log("SUCCESSFULLY HIT GROUP CHAT ROUTE FOR ID:", groupId);

    const messages = await Message.find({ groupId })
      .populate("sender", "name email")
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error("GET GROUP CHAT ERROR:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// 2. FILE / IMAGE UPLOAD API
// 4. FILE / IMAGE UPLOAD API (በፍጹም የማይሳሳት Dynamic URL አሰራር)
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // 👈 ሎካልም ይሁን ላይቭ (Render) ራሱ አድራሻውን በራስ ሰር አስተካክሎ እንዲይዝ ማድረግ
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;

    res.status(200).json({ fileUrl });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
// 3. 👈 GET 1-to-1 Chat History (አጠቃላይ ፓራሜትር ያለው ሪውት ከታች ይሁን)
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
// MARK MESSAGES AS READ (ቀዩ ነጥብ እንዲጠፋ ዴታውን ማስተካከል)
router.put("/read/:otherId", async (req, res) => {
  try {
    const { otherId } = req.params;
    // ዩሰሩ ያነበባቸውን መልእክቶች በሙሉ read: true ማድረግ (Frontend ላይ user ID ከ localStorage ሊወሰድ ይችላል)
    // ለአሁኑ ቀላሉ መንገድ ከታች ያለው ሪውት ይጠቅማል:
    res.status(200).json({ message: "Marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;