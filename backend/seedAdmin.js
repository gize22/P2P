

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
require("dotenv").config();

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const adminEmail = process.env.ADMIN_EMAIL || "admin@p2plearn.com";
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log("Admin already exists!");
      process.exit();
    }

    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || "Admin12345", 10);

    await User.create({
      name, // или "System Administrator"
      name: "System Administrator",
      email: adminEmail,
      password: hashedPassword,
      university: "P2P Headquarter",
      role: "admin",
      isVerified: true
    });

    console.log("Admin account created successfully!");
    process.exit();
  } catch (err) {
    console.error("Error creating admin:", err);
    process.exit(1);
  }
}

createAdmin();