const nodemailer = require("nodemailer");

// Create transporter with Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
  // Optional: Better reliability
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
});

// Verify connection
const verifyEmailConnection = async () => {
  try {
    await transporter.verify();
    console.log("✅ Email service is ready to send messages");
    return true;
  } catch (error) {
    console.error("❌ Email service error:", error.message);
    return false;
  }
};

// Email templates
const emailTemplates = {
  // OTP Verification
  otpVerification: (name, otp) => ({
    subject: "Verify Your Email - P2P Learn",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #4f46e5; margin: 0;">P2P Learn</h1>
          <p style="color: #666; margin: 5px 0;">Peer-to-Peer Learning Platform</p>
        </div>
        
        <h2 style="color: #333;">Welcome to P2P Learn, ${name}! 🎉</h2>
        <p style="color: #555; line-height: 1.6;">Thank you for joining our community. To complete your registration, please verify your email address using the code below:</p>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; margin: 25px 0; border: 2px dashed #4f46e5;">
          <div style="font-size: 48px; font-weight: bold; color: #4f46e5; letter-spacing: 10px; font-family: monospace;">
            ${otp}
          </div>
        </div>
        
        <p style="color: #555; line-height: 1.6;">This code will expire in <strong>10 minutes</strong>.</p>
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="color: #666; font-size: 14px; margin: 0;">If you didn't create an account with P2P Learn, please ignore this email.</p>
        </div>
        
        <hr style="border: none; border-top: 2px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">© 2024 P2P Learn. All rights reserved.</p>
        <p style="color: #999; font-size: 12px; text-align: center; margin: 5px 0 0;">This is an automated message, please do not reply.</p>
      </div>
    `
  }),

  // Password Reset
  passwordReset: (name, resetUrl) => ({
    subject: "Reset Your Password - P2P Learn",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #4f46e5; margin: 0;">P2P Learn</h1>
          <p style="color: #666; margin: 5px 0;">Password Reset Request</p>
        </div>
        
        <h2 style="color: #333;">Hello ${name},</h2>
        <p style="color: #555; line-height: 1.6;">We received a request to reset your password. Click the button below to create a new password:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: #4f46e5; color: white; padding: 14px 40px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; box-shadow: 0 2px 10px rgba(79, 70, 229, 0.3);">
            Reset Password
          </a>
        </div>
        
        <p style="color: #555; line-height: 1.6;">This link will expire in <strong>1 hour</strong>.</p>
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="color: #666; font-size: 14px; margin: 0;">If you didn't request a password reset, please ignore this email.</p>
        </div>
        
        <hr style="border: none; border-top: 2px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">© 2024 P2P Learn. All rights reserved.</p>
      </div>
    `
  }),

  // Contact Form Confirmation
  contactConfirmation: (name, subject, message) => ({
    subject: "Thank You for Contacting P2P Learn",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #4f46e5; margin: 0;">P2P Learn</h1>
          <p style="color: #666; margin: 5px 0;">We've Received Your Message</p>
        </div>
        
        <h2 style="color: #333;">Thank You, ${name}! 🙏</h2>
        <p style="color: #555; line-height: 1.6;">We have received your message and will get back to you within 24 hours.</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
          <p style="color: #666; margin: 0 0 10px 0;"><strong>Subject:</strong> ${subject}</p>
          <div style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #4f46e5;">
            <p style="color: #333; margin: 0; line-height: 1.6; white-space: pre-wrap;">${message}</p>
          </div>
        </div>
        
        <p style="color: #555; line-height: 1.6;">Our team will review your message and respond as soon as possible.</p>
        
        <hr style="border: none; border-top: 2px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">© 2024 P2P Learn. All rights reserved.</p>
      </div>
    `
  }),

  // Admin Notification
  adminNotification: (name, email, subject, message, userId) => ({
    subject: `New Contact Form: ${subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #4f46e5; margin: 0;">P2P Learn</h1>
          <p style="color: #666; margin: 5px 0;">New Contact Form Submission</p>
        </div>
        
        <div style="background: #f0f4ff; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
          <p style="margin: 5px 0;"><strong>From:</strong> ${name}</p>
          <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p style="margin: 5px 0;"><strong>Subject:</strong> ${subject}</p>
          ${userId ? `<p style="margin: 5px 0;"><strong>User ID:</strong> ${userId}</p>` : '<p style="margin: 5px 0;"><strong>User:</strong> Guest</p>'}
          <p style="margin: 5px 0;"><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
          <p style="color: #666; margin: 0 0 10px 0;"><strong>Message:</strong></p>
          <div style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #4f46e5;">
            <p style="color: #333; margin: 0; line-height: 1.6; white-space: pre-wrap;">${message}</p>
          </div>
        </div>
        
        <hr style="border: none; border-top: 2px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">Reply to this email to respond to the user.</p>
      </div>
    `
  })
};

// Send email function
const sendEmail = async (to, template, data) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      ...template
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Email failed to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  transporter,
  verifyEmailConnection,
  emailTemplates,
  sendEmail
};