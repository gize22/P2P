const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
require("dotenv").config();

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for seeding admin...");

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.log("Please define ADMIN_EMAIL and ADMIN_PASSWORD in your .env file!");
      process.exit(1);
    }

    // ፓስወርዱን አዲስ በሆነ ሐሽ ማመስጠር
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      // 👈 አድሚኑ ከነበረ ሮሉን፣ ቬሪፊኬሽኑን እና ፓስወርዱን 100% ከ .env ጋር እናመሳስለዋለን
      existingAdmin.role = "admin";
      existingAdmin.isVerified = true;
      existingAdmin.password = hashedPassword;
      await existingAdmin.save();
      console.log("Admin user already exists. Password & role successfully updated from .env!");
      process.exit(0);
    }

    // አዲስ አድሚን መፍጠር
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