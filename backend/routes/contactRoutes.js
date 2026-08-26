const express = require("express");
const Contact = require("../models/Contact");
const User = require("../models/User");
const { sendEmail, emailTemplates } = require("../config/email");
const router = express.Router();

// =============================================
// POST: Submit contact/feedback message
// =============================================
router.post("/", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate
    if (!name || !email || !message) {
      return res.status(400).json({ 
        success: false,
        message: "Name, email and message are required" 
      });
    }

    // Check if user exists
    const user = await User.findOne({ email });

    // Save to database
    const contact = await Contact.create({ 
      name, 
      email, 
      subject: subject || "General Inquiry",
      message,
      userId: user ? user._id : null
    });

    console.log("✅ Contact saved:", contact._id);

    // Send confirmation to user
    await sendEmail(
      email,
      emailTemplates.contactConfirmation(name, subject || "General Inquiry", message),
      { name }
    );

    // Send notification to admin
    await sendEmail(
      process.env.ADMIN_EMAIL,
      emailTemplates.adminNotification(name, email, subject || "General Inquiry", message, user?._id),
      { name }
    );

    res.status(201).json({
      success: true,
      message: "Thank you! Your message has been sent successfully."
    });

  } catch (error) {
    console.error("Contact error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error"
    });
  }
});

// GET: All contacts (Admin only)
router.get("/", async (req, res) => {
  try {
    const contacts = await Contact.find()
      .sort({ createdAt: -1 })
      .populate("userId", "name email");
    
    res.status(200).json({
      success: true,
      count: contacts.length,
      data: contacts
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// DELETE: Contact (Admin only)
router.delete("/:id", async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;