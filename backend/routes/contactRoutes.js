const express = require("express");
const { Resend } = require("resend"); // 👈 ሪሰንድ ኤፒአይ
const Contact = require("../models/Contact");
const router = express.Item || express.Router();

const resend = new Resend(process.env.RESEND_API_KEY);

// 1. POST: ኮንታክት መልእክት መቀበያ (ዳታቤዝ ውስጥ ማስቀመጥ + በ Resend ኢሜይል መላክ)
router.post("/", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ 
        success: false,
        message: "Name, email and message are required" 
      });
    }

    // 1. ዳታቤዝ ውስጥ በሰላም ማስቀመጥ
    await Contact.create({ 
      name, 
      email, 
      subject: subject || "General Inquiry",
      message
    });

    // 2. 👈 በ Render ላይ በማይታገደው በ Resend API አማካኝነት በቀጥታ ወደ ጂሜይልህ መላክ
    try {
      const data = await resend.emails.send({
        from: "P2P Learn <onboarding@resend.dev>",
        to: ["gizachewkassa22@gmail.com"], // 👈 የራስህ ጂሜይል አድራሻ
        subject: `📢 P2P Learn Contact: Message from ${name}`,
        html: `<div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto; border: 1px solid #e5e7eb; border-radius: 10px;">
                 <h2 style="color: #4f46e5;">New Contact Message</h2>
                 <p><strong>Name:</strong> ${name}</p>
                 <p><strong>Email:</strong> ${email}</p>
                 <p><strong>Message:</strong></p>
                 <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; font-size: 14px; color: #1f2937;">
                   ${message}
                 </div>
               </div>`,
      });
      console.log("Contact Email Sent via Resend:", data);
    } catch (mailErr) {
      console.error("Resend Contact Email Error:", mailErr);
    }

    return res.status(201).json({
      success: true,
      message: "Thank you! Your message has been sent successfully."
    });

  } catch (error) {
    console.error("Contact error:", error);
    return res.status(500).json({ 
      success: false,
      message: "Server error"
    });
  }
});

// GET: All contacts (Admin only)
router.get("/", async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: contacts.length,
      data: contacts
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// DELETE: Contact (Admin only)
router.delete("/:id", async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    return res.status(200).json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;