const express = require("express");
const Session = require("../models/Session");

const router = express.Router();

// 1. CREATE SESSION (ቀጠሮ መያዝ)
router.post("/", async (req, res) => {
  try {
    const { teacher, learner, skill, date, time } = req.body;

    if (!teacher || !learner || !skill || !date || !time) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newSession = await Session.create({
      teacher,
      learner,
      skill,
      date,
      time
    });

    res.status(201).json({
      message: "Session scheduled successfully",
      session: newSession
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// 2. GET USER SESSIONS (ለአንድ ተማሪ የተያዙ sessions ሁሉ ማየት)
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const sessions = await Session.find({
      $or: [{ teacher: userId }, { learner: userId }]
    })
      .populate("teacher", "name email")
      .populate("learner", "name email");

    res.status(200).json(sessions);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// UPDATE SESSION STATUS (ለምሳሌ completed ማድረግ)
router.put("/:id", async (req, res) => {
  try {
    const { status } = req.body; // completed መሆን አለበት

    const updatedSession = await Session.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updatedSession) {
      return res.status(404).json({ message: "Session not found" });
    }

    res.status(200).json({
      message: "Session status updated successfully",
      session: updatedSession
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;