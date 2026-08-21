const express = require("express");
const GroupInvite = require("../models/GroupInvite");
const Group = require("../models/Group");

const router = express.Router();

// 1. SEND GROUP INVITE (ግሩፕ እንዲቀላቀል መጋበዝ)
router.post("/", async (req, res) => {
  try {
    const { group, sender, receiver } = req.body;

    // ተማሪው ቀድሞውኑ ግሩፑ ውስጥ መኖሩን ማረጋገጥ
    const targetGroup = await Group.findById(group);
    if (targetGroup.members.includes(receiver)) {
      return res.status(400).json({ message: "User is already a member of this group" });
    }

    // ቀድሞ የተላከ pending invite መኖሩን ማረጋገጥ
    const existingInvite = await GroupInvite.findOne({ group, receiver, status: "pending" });
    if (existingInvite) {
      return res.status(400).json({ message: "Invitation already sent to this user" });
    }

    const invite = await GroupInvite.create({ group, sender, receiver });

    res.status(201).json({
      message: "Group invitation sent successfully",
      invite
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// 2. GET USER INVITES (ለአንድ ተማሪ የመጡትን የግሩፕ ኢንቫይቶች ማየት)
router.get("/user/:userId", async (req, res) => {
  try {
    const invites = await GroupInvite.find({ receiver: req.params.userId, status: "pending" })
      .populate("group", "name skill description")
      .populate("sender", "name");

    res.status(200).json(invites);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// 3. RESPOND TO INVITE (Accept ወይም Reject ማድረግ)
router.put("/:id", async (req, res) => {
  try {
    const { status } = req.body; // accepted ወይም rejected
    const invite = await GroupInvite.findById(req.params.id);

    if (!invite) {
      return res.status(404).json({ message: "Invite not found" });
    }

    invite.status = status;
    await invite.save();

    // Accepted ከደረገ ተማሪውን በቀጥታ ወደ ግሩፑ members ዝርዝር መጨመር
    if (status === "accepted") {
      await Group.findByIdAndUpdate(invite.group, {
        $push: { members: invite.receiver }
      });
    }

    res.status(200).json({
      message: `Invitation ${status} successfully`,
      invite
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;