const express = require("express");
const Question = require("../models/Question");
const Answer = require("../models/Answer");

const router = express.Router();

// 1. CREATE A QUESTION (አዲስ ጥያቄ መለጠፍ)
router.post("/", async (req, res) => {
  try {
    const { title, content, author, tags } = req.body;

    if (!title || !content || !author) {
      return res.status(400).json({ message: "Title, content and author are required" });
    }

    const newQuestion = await Question.create({
      title,
      content,
      author,
      tags: tags ? tags.map(t => t.trim()) : []
    });

    res.status(201).json({
      message: "Question posted successfully",
      question: newQuestion
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// 2. GET ALL QUESTIONS (ሁሉንም ጥያቄዎች ከነላኪያቸው ስም ጋር ማምጣት)
router.get("/", async (req, res) => {
  try {
    const questions = await Question.find()
      .populate("author", "name university")
      .sort({ createdAt: -1 }); // አዲሶቹ መጀመሪያ እንዲመጡ

    res.status(200).json(questions);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// 3. GET SINGLE QUESTION & ITS ANSWERS (የአንድን ጥያቄ ዝርዝር እና የተሰጡትን መልሶች ማምጣት)
router.get("/:id", async (req, res) => {
  try {
    const question = await Question.findById(req.params.id).populate("author", "name university");
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    const answers = await Answer.find({ question: req.params.id })
      .populate("author", "name university")
      .sort({ createdAt: 1 });

    res.status(200).json({ question, answers });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// 4. POST AN ANSWER TO A QUESTION (ለጥያቄው መልስ መስጠት)
router.post("/:id/answers", async (req, res) => {
  try {
    const { content, author } = req.body;

    if (!content || !author) {
      return res.status(400).json({ message: "Content and author are required" });
    }

    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    const newAnswer = await Answer.create({
      question: req.params.id,
      author,
      content
    });

    // የላኪውን ስም populate አድርጎ መመለስ
    const populatedAnswer = await Answer.findById(newAnswer._id).populate("author", "name university");

    res.status(201).json({
      message: "Answer posted successfully",
      answer: populatedAnswer
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;