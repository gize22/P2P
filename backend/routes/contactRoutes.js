const express = require("express");
const nodemailer = require("nodemailer");
const Contact = require("../models/Contact");
const router = express.Router();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

router.post("/", async (req, res) => {
  try {
    console.log("CONTACT API HIT WITH DATA:", req.body); // 👈 ሪኩዌስቱ መምጣቱን ለማረጋገጥ
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // ዳታቤዝ ውስጥ ማስቀመጥ
    await Contact.create({ name, email, message });

    // ኢሜይል ለመላክ መሞከር (ካለፈው ኮንፊግሬሽን ጋር)
    try {
      await transporter.sendMail({
        to: "p2plearn1@gmail.com",
        from: process.env.EMAIL_USER,
        subject: `📢 P2P Learn Contact: Message from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      });
    } catch (mailErr) {
      console.log("Email relay skipped, but message saved in DB.");
    }

    res.status(200).json({ message: "Thank you! Your message has been sent successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;