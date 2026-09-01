const express = require("express");
const User = require("../models/User");
const Group = require("../models/Group");
const Message = require("../models/Message");
const Review = require("../models/Review");
const Question = require("../models/Question");
const Announcement = require("../models/Announcement");


const router = express.Router();

// 1. GET PLATFORM STATISTICS
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

// 2. GET ALL USERS
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// 3. DELETE USER
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

/// 4. PROMOTE USER TO ADMIN (ከ 3 አድሚኖች በላይ እንዳይበልጡ የሚከለክል ጥብቅ ሪውት)
router.put("/promote/:id", async (req, res) => {
  try {
    // 1. አሁን ዳታቤዝ ውስጥ ያሉት አድሚኖች ብዛት ስንት እንደሆኑ መቆጠር
    const adminCount = await User.countDocuments({ role: "admin" });

    if (adminCount >= 3) {
      return res.status(400).json({ 
        message: "Restriction Error: Maximum limit of 3 administrators reached! You cannot promote more users." 
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.role = "admin";
    await user.save();

    res.status(200).json({ message: `${user.name} has been promoted to Admin successfully` });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// 5. GET ALL GROUPS
router.get("/groups", async (req, res) => {
  try {
    const groups = await Group.find()
      .populate("admin", "name email")
      .populate("members", "name email"); // 👈 የ አባላትን ስም populate ማድረግ
    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// 6. DELETE GROUP
router.delete("/groups/:id", async (req, res) => {
  try {
    await Group.findByIdAndDelete(req.params.id);
    await Message.deleteMany({ groupId: req.params.id });
    res.status(200).json({ message: "Group deleted successfully by admin" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// 7. GET ALL GROUP MESSAGES/FILES
router.get("/messages", async (req, res) => {
  try {
    const messages = await Message.find({ groupId: { $ne: null } })
      .populate("sender", "name email")
      .populate("groupId", "name")
      .sort({ createdAt: -1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// 8. DELETE INAPPROPRIATE MESSAGE/FILE
router.delete("/messages/:id", async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Message/File deleted successfully by admin" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// 9. GET PLATFORM REVIEWS
router.get("/reviews", async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("reviewer", "name")
      .populate("reviewedUser", "name");
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// 10. DELETE REVIEW
router.delete("/reviews/:id", async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});


// 11. GET ALL COMMUNITY QUESTIONS (ለአድሚን ጥያቄዎችን ማሳያ)
router.get("/questions", async (req, res) => {
  try {
    const questions = await Question.find()
      .populate("author", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json(questions);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// 12. DELETE COMMUNITY QUESTION (የኮሚዩኒቲ ጥያቄን በአድሚን መደምሰሻ)
router.delete("/questions/:id", async (req, res) => {
  try {
    await Question.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Community question deleted successfully by admin" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// 13. REMOVE MEMBER FROM GROUP (ከተወሰነ ግሩፕ ተማሪን ማስወጣት)
router.put("/groups/:groupId/remove-member", async (req, res) => {
  try {
    const { userId } = req.body;
    const group = await Group.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // ከ members array ውስጥ ዩሰሩን ማስወገድ
    group.members = group.members.filter(m => m.toString() !== userId);
    await group.save();

    res.status(200).json({ message: "Member removed from group successfully by admin" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
// 14. SEND BROADCAST ANNOUNCEMENT (ለሁሉም ማስታወቂያ መላክ)
router.post("/announcement", async (req, res) => {
  try {
    const { message, adminId } = req.body;
    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    const announcement = await Announcement.create({
      message,
      sender: adminId
    });

    // 👈 በ Socket.IO አማካኝነት ማስታወሻውን ለሁሉም ኦንላይን ዩሰሮች በሪል-ታይም መድረስ
    const io = req.app.get("io");
    if (io) {
      io.emit("receive_announcement", announcement);
    }

    res.status(201).json({ message: "Announcement broadcasted successfully", announcement });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// GET ALL ANNOUNCEMENTS (ለሁሉም ማስታወሻዎች ማምጫ - ለተማሪዎችም ጭምር)
router.get("/announcements", async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 }).limit(5);
    res.status(200).json(announcements);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// 15. SEND DIRECT WARNING TO STUDENT
router.post("/send-warning", async (req, res) => {
  try {
    const { adminId, studentId, message } = req.body;
    if (!studentId || !message) {
      return res.status(400).json({ message: "Student ID and message are required" });
    }

    const warningMessage = await Message.create({
      sender: adminId,
      receiver: studentId,
      message: `⚠️ [ADMIN WARNING]: ${message}`
    });

    const io = req.app.get("io");
    if (io) {
      io.to(studentId.toString()).emit("receive_notification", {
        sender: adminId,
        message: "You received an administrative warning!",
        type: "admin_warning"
      });
    }

    res.status(201).json({ message: "Warning sent successfully", warningMessage });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router; // 👈 ይህ በጣም አስፈላጊ ነው!

