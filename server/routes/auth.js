const express = require("express");
const passport = require("passport");
const { body } = require("express-validator");
const {
  register,
  login,
  getMe,
  updateDetails,
  updatePassword,
  logout,
  googleCallback,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");

const router = express.Router();

// Validation rules
const registerValidation = [
  body("username")
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers, and underscores"),
  body("email").isEmail().withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("name").optional().trim().isLength({ max: 50 }),
];

const loginValidation = [
  body("email").isEmail().withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

const updateDetailsValidation = [
  body("name").optional().trim().isLength({ max: 50 }),
  body("bio").optional().trim().isLength({ max: 200 }),
  body("email")
    .optional()
    .isEmail()
    .withMessage("Please provide a valid email"),
];

const updatePasswordValidation = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters"),
];

// Routes
router.post("/register", registerValidation, validate, register);
router.post("/login", loginValidation, validate, login);
router.get("/me", protect, getMe);
router.put(
  "/updatedetails",
  protect,
  updateDetailsValidation,
  validate,
  updateDetails
);
router.put(
  "/updatepassword",
  protect,
  updatePasswordValidation,
  validate,
  updatePassword
);
router.get("/logout", protect, logout);

// Google OAuth routes
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login",
  }),
  googleCallback
);

module.exports = router;
