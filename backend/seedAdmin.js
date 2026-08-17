const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
require("dotenv").config();

async function createAdmin() {
  try {
    // ከ MongoDB Atlas ጋር መገናኘት
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for seeding admin...");

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.log("Please define ADMIN_EMAIL and ADMIN_PASSWORD in your .env file!");
      process.exit(1);
    }

    // አድሚኑ ቀድሞውኑ በዳታቤዝ ውስጥ መኖሩን ማረጋገጥ
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      existingAdmin.role = "admin";
      existingAdmin.isVerified = true;
      await existingAdmin.save();
      console.log("Admin user already exists! Role successfully updated to 'admin'.");
      process.exit(0);
    }

    // ፓስወርዱን በደህንነት (Hash) ማመስጠር
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // አዲስ Super Admin መፍጠር
    await User.create({
      name: "System Administrator",
      email: adminEmail,
      password: hashedPassword,
      university: "P2P Headquarter",
      role: "admin",
      isVerified: true
    });

    console.log(`Super Admin account created successfully with email: ${adminEmail}`);
    process.exit(0);
  } catch (err) {
    console.error("Error creating admin:", err);
    process.exit(1);
  }
}

createAdmin();