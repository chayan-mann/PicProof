const express = require("express");
const { body } = require("express-validator");
const {
  createComment,
  getPostComments,
  updateComment,
  deleteComment,
  likeComment,
} = require("../controllers/commentController");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");

const router = express.Router();

// Validation
const createCommentValidation = [
  body("content")
    .trim()
    .isLength({ min: 1, max: 300 })
    .withMessage("Comment must be between 1 and 300 characters"),
  body("postId").notEmpty().withMessage("Post ID is required"),
];

const updateCommentValidation = [
  body("content")
    .trim()
    .isLength({ min: 1, max: 300 })
    .withMessage("Comment must be between 1 and 300 characters"),
];

// Routes
router.get("/post/:postId", getPostComments);

// Protected routes
router.post("/", protect, createCommentValidation, validate, createComment);
router.put("/:id", protect, updateCommentValidation, validate, updateComment);
router.delete("/:id", protect, deleteComment);
router.post("/:id/like", protect, likeComment);

module.exports = router;
