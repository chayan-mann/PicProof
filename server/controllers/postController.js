const Post = require("../models/Post");
const User = require("../models/User");
const Comment = require("../models/Comment");
const AIFlag = require("../models/AIFlag");
const Notification = require("../models/Notification");
const { GoogleGenAI } = require("@google/genai");
const mongoose = require("mongoose");
const ai = new GoogleGenAI({});

async function getResponse(prompt) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `You are a content moderation AI.
Analyze the following content and respond ONLY in JSON format:
{
  "isSynthetic": <boolean>,
  "age_rating": <"safe" | "sensitive" | "explicit">,
  "isHarmful": <boolean>
}
Do not include any explanations or additional text. Only return the JSON object.
Content:
${prompt}`
          }
        ],
      },
    ],
  });

  return response.text;
}

// @desc    Create a post
// @route   POST /api/posts
// @access  Private
exports.createPost = async (req, res, next) => {
  try {
    const { content, visibility, tags } = req.body;

    let aiResponse = await getResponse(content);
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
    };

  // Handle media upload
  if (req.file) {
      postData.mediaUrl = `/uploads/${req.file.filename}`;
      postData.mediaType = req.file.mimetype.startsWith("image")
        ? "image"
        : "video";

      // Create AI flag entry for media analysis (will be processed by AI service)
      const post = await Post.create(postData);

      await AIFlag.create({
        post: post._id,
        status: "pending",
      });

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

    // Get posts from users the current user follows + their own posts
    const posts = await Post.find({
      $or: [{ author: { $in: req.user.following } }, { author: req.user.id }],
      visibility: { $in: ["public", "followers"] },
    })
      .populate("author", "username name profilePicture isVerified")
      .populate({
        path: "comments",
        options: { limit: 3 },
        populate: { path: "author", select: "username profilePicture" },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get AI flags for posts with media
    const postsWithFlags = await Promise.all(
      posts.map(async (post) => {
        const postObj = post.toObject();
        if (post.mediaUrl) {
          const aiFlag = await AIFlag.findOne({ post: post._id });
          postObj.aiFlag = aiFlag;
        }
        return postObj;
      })
    );

    const total = await Post.countDocuments({
      $or: [{ author: { $in: req.user.following } }, { author: req.user.id }],
      visibility: { $in: ["public", "followers"] },
    });

    res.status(200).json({
      success: true,
      count: posts.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: postsWithFlags,
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

    // Get AI flag if exists
    let aiFlag = null;
    if (post.mediaUrl) {
      aiFlag = await AIFlag.findOne({ post: post._id });
    }

    res.status(200).json({
      success: true,
      data: {
        ...post.toObject(),
        aiFlag,
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

    // Delete associated AI flags
    await AIFlag.deleteOne({ post: post._id });

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
