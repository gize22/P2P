const express = require("express");
const Review = require("../models/Review");
const User = require("../models/User");

const router = express.Router();

// 1. ADD REVIEW & RATING
router.post("/", async (req, res) => {
  try {
    const { reviewer, reviewedUser, session, rating, comment } = req.body;

    if (!reviewer || !reviewedUser || !rating) {
      return res.status(400).json({ message: "Reviewer, reviewedUser and rating are required" });
    }

    const review = await Review.create({
      reviewer,
      reviewedUser,
      session,
      rating,
      comment
    });

    // ተማሪው ያገኘውን አማካኝ ሬቲንግ ማስተካከል
    const reviews = await Review.find({ reviewedUser });
    const totalRating = reviews.reduce((acc, item) => acc + item.rating, 0);
    const avgRating = totalRating / reviews.length;

    await User.findByIdAndUpdate(reviewedUser, { rating: avgRating.toFixed(1) });

    res.status(201).json({
      message: "Review added successfully",
      review
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// 2. GET USER REVIEWS (ለአንድ ተማሪ የተሰጡ ሪቪውች)
router.get("/user/:userId", async (req, res) => {
  try {
    const reviews = await Review.find({ reviewedUser: req.params.userId })
      .populate("reviewer", "name");

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router; // 👈 ትክክለኛው መዝጊያ