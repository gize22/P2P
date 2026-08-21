const express = require("express");
const Group = require("../models/Group");

const router = express.Router();

// 1. CREATE GROUP (ቡድን መፍጠር)
router.post("/", async (creatorReq, res) => {
  try {
    const { name, description, skill, admin } = creatorReq.body;

    if (!name || !description || !skill || !admin) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newGroup = await Group.create({
      name,
      description,
      skill,
      admin,
      members: [admin] // ቡድኑን የፈጠረው ሰው አውቶማቲክ የመጀመሪያው አባል (member) ይሆናል
    });

    res.status(201).json({
      message: "Study group created successfully",
      group: newGroup
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// 2. GET ALL GROUPS (ሁሉንም ቡድኖች ማየት)
router.get("/", async (req, res) => {
  try {
    const groups = await Group.find()
      .populate("admin", "name email")
      .populate("members", "name email");

    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// 3. JOIN GROUP (ቡድን ውስጥ አባል ሆኖ መግባት)
router.post("/:id/join", async (req, res) => {
  try {
    const { userId } = req.body;
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // ተማሪው ቀድሞውኑ አባል መሆኑን ማረጋገጥ
    if (group.members.includes(userId)) {
      return res.status(400).json({ message: "You are already a member of this group" });
    }

    group.members.push(userId);
    await group.save();

    res.status(200).json({
      message: "Successfully joined the group",
      group
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;