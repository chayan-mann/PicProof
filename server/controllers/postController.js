const Post = require("../models/Post");
const User = require("../models/User");
const Comment = require("../models/Comment");
const Notification = require("../models/Notification");
const { getModerationResponse } = require("../services/LLMService");
const { callFlaskAPI } = require("../services/FlaskService");
const mongoose = require("mongoose");
const fs = require("fs");

// @desc    Create a post
// @route   POST /api/posts
// @access  Private
exports.createPost = async (req, res, next) => {
  try {
    const { content, visibility, tags } = req.body;

    let aiResponse = await getModerationResponse(content);
    let start = aiResponse.indexOf("{");
    let end = aiResponse.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end >= start) {
      aiResponse = aiResponse.substring(start, end + 1).trim();
    } else {
      aiResponse = aiResponse.trim();
    }
    aiResponse = JSON.parse(aiResponse);

    const postData = {
      content,
      author: req.user.id,
      visibility: visibility || "public",
      tags: tags || [],
      text_analysis: aiResponse,
    };

  // Handle media upload
  if (req.file) {
      postData.mediaUrl = `/uploads/${req.file.filename}`;
      postData.mediaType = req.file.mimetype.startsWith("image")
        ? "image"
        : "video";

      // Create AI flag entry for media analysis (will be processed by AI service)
      const buffer = fs.readFileSync(req.file.path);
      const mediaAnalysisResponse = await callFlaskAPI(buffer, req.file.filename, req.file.mimetype);
      postData.image_analysis = mediaAnalysisResponse;
      const post = await Post.create(postData);

      // Populate author before returning so client can render immediately
      await post.populate("author", "username name profilePicture isVerified");

      return res.status(201).json({
        success: true,
        data: post,
        message: "Post created. Media is being analyzed for authenticity.",
      });
    }

    const post = await Post.create(postData);
    // Populate author before returning
    await post.populate("author", "username name profilePicture isVerified");

    res.status(201).json({
      success: true,
      data: post,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all posts (feed)
// @route   GET /api/posts/feed
// @access  Private
exports.getFeed = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Build content filters from user moderation preferences
    const moderation = req.user?.moderationPreferences || {};
    const agePref = moderation.ageRating; // 'under18' | '18+' | '21+'
    const allowSynthetic = moderation.isSynthetic === true; // allow any synthetic content
    const allowHarmful = moderation.isHarmful === true; // allow harmful content
    const allowSyntheticImages = moderation.syntheticImages === true; // specifically allow synthetic images

    let allowedAges = ["safe"]; // default
    if (agePref === "18+") {
      allowedAges = ["safe", "sensitive"];
    } else if (agePref === "21+") {
      allowedAges = ["safe", "sensitive", "explicit"];
    }

    const contentFilters = [];

    // Age rating filter applies to both text and image analyses, when present
    contentFilters.push({
      $or: [
        { "text_analysis.age_rating": { $in: allowedAges } },
        { "text_analysis.age_rating": { $exists: false } },
      ],
    });
    contentFilters.push({
      $or: [
        { "image_analysis.age_rating": { $in: allowedAges } },
        { "image_analysis.age_rating": { $exists: false } },
      ],
    });

    // Harmful content filter (if user does NOT allow harmful)
    if (!allowHarmful) {
      contentFilters.push({
        $or: [
          { "text_analysis.isHarmful": false },
          { "text_analysis.isHarmful": { $exists: false } },
        ],
      });
      contentFilters.push({
        $or: [
          { "image_analysis.isHarmful": false },
          { "image_analysis.isHarmful": { $exists: false } },
        ],
      });
    }

    // Synthetic content filters
    if (!allowSynthetic) {
      // Block synthetic in both text and image analyses
      contentFilters.push({
        $or: [
          { "text_analysis.isSynthetic": false },
          { "text_analysis.isSynthetic": { $exists: false } },
        ],
      });
      contentFilters.push({
        $or: [
          { "image_analysis.isSynthetic": false },
          { "image_analysis.isSynthetic": { $exists: false } },
        ],
      });
    } else if (!allowSyntheticImages) {
      // User allows synthetic generally, but NOT synthetic images specifically
      contentFilters.push({
        $or: [
          { "image_analysis.isSynthetic": false },
          { "image_analysis.isSynthetic": { $exists: false } },
        ],
      });
    }

    const baseVisibility = {
      visibility: { $in: ["public", "followers"] },
    };

    const filteredOthersClause = {
      $and: [
        { author: { $in: req.user.following || [] } },
        baseVisibility,
        ...contentFilters,
      ],
    };

    // Always include user's own posts without content filters
    const ownClause = { author: req.user.id };

    const finalQuery = { $or: [ownClause, filteredOthersClause] };

    // Get posts from users the current user follows + their own posts with filters
    const posts = await Post.find(finalQuery)
      .populate("author", "username name profilePicture isVerified")
      .populate({
        path: "comments",
        options: { limit: 3 },
        populate: { path: "author", select: "username profilePicture" },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments(finalQuery);

    res.status(200).json({
      success: true,
      count: posts.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: posts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single post
// @route   GET /api/posts/:id
// @access  Public
exports.getPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "username name profilePicture isVerified")
      .populate({
        path: "comments",
        populate: { path: "author", select: "username profilePicture" },
      });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        ...post.toObject(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private
exports.updatePost = async (req, res, next) => {
  try {
    let post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Make sure user is post owner
    if (post.author.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to update this post",
      });
    }

    post.content = req.body.content || post.content;
    post.isEdited = true;
    post.editedAt = Date.now();

    await post.save();

    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
exports.deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Make sure user is post owner
    if (post.author.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Not authorized to delete this post",
      });
    }

    // Delete associated comments
    await Comment.deleteMany({ post: post._id });

    await post.deleteOne();

    res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Like/Unlike a post
// @route   POST /api/posts/:id/like
// @access  Private
exports.likePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Check if already liked
    const likeIndex = post.likes.indexOf(req.user.id);

    if (likeIndex > -1) {
      // Unlike
      post.likes.splice(likeIndex, 1);
      await post.save();

      return res.status(200).json({
        success: true,
        message: "Post unliked",
        liked: false,
        likesCount: post.likesCount,
      });
    } else {
      // Like
      post.likes.push(req.user.id);
      await post.save();

      // Create notification (don't notify yourself)
      if (post.author.toString() !== req.user.id) {
        await Notification.create({
          recipient: post.author,
          sender: req.user._id,
          type: "like",
          post: post._id,
          message: `${req.user.username} liked your post`,
          link: `/post/${post._id}`,
        });
      }

      return res.status(200).json({
        success: true,
        message: "Post liked",
        liked: true,
        likesCount: post.likesCount,
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's posts
// @route   GET /api/posts/user/:userId
// @access  Public
exports.getUserPosts = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Validate userId
    if (!userId || userId === "undefined" || userId === "null") {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    // Check if userId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    console.log("Fetching posts for user:", userId);

    const posts = await Post.find({ author: userId })
      .populate("author", "username name profilePicture isVerified")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments({ author: userId });

    console.log("Found posts:", posts.length);

    res.status(200).json({
      success: true,
      count: posts.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: posts,
    });
  } catch (error) {
    console.error("Error in getUserPosts:", error);
    next(error);
  }
};
