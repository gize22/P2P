const express = require("express");
const LearningRequest = require("../models/LearningRequest");

const router = express.Router();

// 1. SEND LEARNING REQUEST (ጥያቄ መላክ)
router.post("/", async (req, res) => {
  try {
    const { sender, receiver, skill, message } = req.body;

    if (!sender || !receiver || !skill) {
      return res.status(400).json({ message: "Sender, receiver and skill are required" });
    }

    const newRequest = await LearningRequest.create({
      sender,
      receiver,
      skill,
      message
    });

    // 팝ፕ ወይም ሪል-ታይም ኖቲፊኬሽን ለተቀባዩ (receiver) መላክ
    const io = req.app.get("io");
    if (io) {
      // ተቀባዩ በራሱ ሩም (Room) ወይም ID ተለይቶ ኖቲፊኬሽኑ ይደርሰዋል
      io.to(receiver.toString()).emit("receive_request", newRequest);
    }

    res.status(201).json({
      message: "Learning request sent successfully",
      request: newRequest
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// 2. GET USER REQUESTS (ለተወሰነ user የተላኩ ወይም ያላካቸው ጥያቄዎች)
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const requests = await LearningRequest.find({
      $or: [{ sender: userId }, { receiver: userId }]
    })
      .populate("sender", "name email university")
      .populate("receiver", "name email university");

    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// 3. UPDATE REQUEST STATUS (Accept ወይም Reject ማድረግ)
router.put("/:id", async (req, res) => {
  try {
    const { status } = req.body; // accepted ወይም rejected መሆን አለበት

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updatedRequest = await LearningRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.status(200).json({
      message: `Request ${status} successfully`,
      request: updatedRequest
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;