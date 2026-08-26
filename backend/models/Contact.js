const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true,
      trim: true
    },
    email: { 
      type: String, 
      required: true,
      lowercase: true,
      trim: true
    },
    subject: { 
      type: String, 
      default: "General Inquiry",
      trim: true
    },
    message: { 
      type: String, 
      required: true,
      trim: true
    },
    isRead: { 
      type: Boolean, 
      default: false 
    },
    status: {
      type: String,
      enum: ["pending", "read", "replied"],
      default: "pending"
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Contact", contactSchema);