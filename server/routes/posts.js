const express = require("express");
const { body } = require("express-validator");
const {
  createPost,
  getFeed,
  getPost,
  updatePost,
  deletePost,
  likePost,
  getUserPosts,
} = require("../controllers/postController");
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");
const validate = require("../middleware/validate");

const router = express.Router();

// Validation
const createPostValidation = [
  body("content")
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage("Post content must be between 1 and 500 characters"),
];

const updatePostValidation = [
  body("content")
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage("Post content must be between 1 and 500 characters"),
];

// Routes
router.get("/feed", protect, getFeed);
router.get("/user/:userId", getUserPosts);
router.get("/:id", getPost);

// Protected routes
router.post(
  "/",
  protect,
  upload.single("media"),
  createPostValidation,
  validate,
  createPost
);
router.put("/:id", protect, updatePostValidation, validate, updatePost);
router.delete("/:id", protect, deletePost);
router.post("/:id/like", protect, likePost);

module.exports = router;
