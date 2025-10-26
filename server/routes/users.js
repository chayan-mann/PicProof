const express = require("express");
const {
  getUserProfile,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  searchUsers,
  updateProfilePicture,
} = require("../controllers/userController");
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = express.Router();

router.get("/search", searchUsers);
router.get("/:id", getUserProfile);
router.get("/:id/followers", getFollowers);
router.get("/:id/following", getFollowing);

// Protected routes
router.post("/:id/follow", protect, followUser);
router.delete("/:id/follow", protect, unfollowUser);
router.put(
  "/profile-picture",
  protect,
  upload.single("image"),
  updateProfilePicture
);

module.exports = router;
