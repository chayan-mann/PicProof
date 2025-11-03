const LLMComment = require("../models/LLMComment");
const Post = require("../models/Post");
const fs = require("fs");
const path = require("path");
const { getResponse } = require("../services/LLMService");

exports.getLLMComment = async (req, res, next) => {
  try {
    const { postId, prompt } = req.body;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }
    let mediaBuffer = null;
    if (post.mediaUrl) {
        // Convert URL path to filesystem path
        const filename = path.basename(post.mediaUrl);
        const filePath = path.join(__dirname, "..", "uploads", filename);
        mediaBuffer = fs.readFileSync(filePath);
    }
    const response = await getResponse(post.content, prompt, mediaBuffer, post.mediaType);
    const comment = await LLMComment.create({ post: post, content: response });
    res.status(200).json({ success: true, data: comment });
  } catch (error) {
    next(error);
  }
};