const express = require("express");
const nodemailer = require("nodemailer");
const Contact = require("../models/Contact");
const router = express.Router();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

router.post("/", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ 
        success: false,
        message: "Name, email and message are required" 
      });
    }

    // 1. ዳታቤዝ ውስጥ ማስቀመጥ (ወዲያውኑ ይከናወናል)
    await Contact.create({ 
      name, 
      email, 
      subject: subject || "General Inquiry",
      message
    });

    // 2. 👈 ዩሰሩ "Sending..." ብሎ እንዳይቆም ወዲያውኑ 201 Success እንመልስለታለን!
    res.status(201).json({
      success: true,
      message: "Thank you! Your message has been sent successfully."
    });

    // 3. 👈 ከኋላ በኩል በጸጥታ (Background) ኢሜይል ለመላክ መሞከር (ፍጹም አያቆምም)
    setImmediate(async () => {
      try {
        await transporter.sendMail({
          to: process.env.EMAIL_USER,
          from: process.env.EMAIL_USER,
          subject: `📢 P2P Learn Contact: Message from ${name}`,
          text: `You have received a new message from:\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}\n`,
        });
        console.log("Background Gmail sent successfully!");
      } catch (mailErr) {
        console.log("Background email skipped/failed:", mailErr.message);
      }
    });

  } catch (error) {
    console.error("Contact error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error"
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: contacts.length, data: contacts });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;