const Comment = require("../models/Comment");
const Post = require("../models/Post");
const Notification = require("../models/Notification");

// @desc    Create a comment
// @route   POST /api/comments
// @access  Private
exports.createComment = async (req, res, next) => {
  try {
    const { content, postId, parentCommentId } = req.body;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const commentData = {
      content,
      author: req.user.id,
      post: postId,
    };

    // If it's a reply to another comment
    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        return res.status(404).json({
          success: false,
          message: "Parent comment not found",
        });
      }
      commentData.parentComment = parentCommentId;
      parentComment.replies.push(comment._id);
      await parentComment.save();
    }

    const comment = await Comment.create(commentData);

    // Add comment to post
    post.comments.push(comment._id);
    await post.save();

    // Populate author info
    await comment.populate("author", "username name profilePicture");

    // Create notification (don't notify yourself)
    if (post.author.toString() !== req.user.id) {
      await Notification.create({
        recipient: post.author,
        sender: req.user._id,
        type: "comment",
        post: post._id,
        comment: comment._id,
        message: `${req.user.username} commented on your post`,
        link: `/post/${post._id}`,
      });
    }

    res.status(201).json({
      success: true,
      data: comment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get comments for a post
// @route   GET /api/comments/post/:postId
// @access  Public
exports.getPostComments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const comments = await Comment.find({
      post: req.params.postId,
      parentComment: null, // Only get top-level comments
    })
      .populate("author", "username name profilePicture isVerified")
      .populate({
        path: "replies",
        populate: { path: "author", select: "username profilePicture" },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Comment.countDocuments({
      post: req.params.postId,
      parentComment: null,
    });

    res.status(200).json({
      success: true,
      count: comments.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: comments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update comment
// @route   PUT /api/comments/:id
// @access  Private
exports.updateComment = async (req, res, next) => {
  try {
    let comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // Make sure user is comment owner
    if (comment.author.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to update this comment",
      });
    }

    comment.content = req.body.content;
    comment.isEdited = true;
    comment.editedAt = Date.now();

    await comment.save();

    res.status(200).json({
      success: true,
      data: comment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private
exports.deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // Make sure user is comment owner
    if (
      comment.author.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to delete this comment",
      });
    }

    // Remove from post's comments array
    await Post.findByIdAndUpdate(comment.post, {
      $pull: { comments: comment._id },
    });

    // Delete all replies
    await Comment.deleteMany({ parentComment: comment._id });

    await comment.deleteOne();

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Like/Unlike a comment
// @route   POST /api/comments/:id/like
// @access  Private
exports.likeComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // Check if already liked
    const likeIndex = comment.likes.indexOf(req.user.id);

    if (likeIndex > -1) {
      // Unlike
      comment.likes.splice(likeIndex, 1);
      await comment.save();

      return res.status(200).json({
        success: true,
        message: "Comment unliked",
        liked: false,
        likesCount: comment.likesCount,
      });
    } else {
      // Like
      comment.likes.push(req.user.id);
      await comment.save();

      return res.status(200).json({
        success: true,
        message: "Comment liked",
        liked: true,
        likesCount: comment.likesCount,
      });
    }
  } catch (error) {
    next(error);
  }
};
