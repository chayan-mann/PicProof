const LLMComment = require("../models/LLMComment");
const Post = require("../models/Post");
const { getResponse } = require("../services/LLMService");

exports.getLLMComment = async (req, res, next) => {
  try {
    const { postId, prompt } = req.body;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }
    const response = await getResponse(post.content, prompt);
    const comment = await LLMComment.create({ post: post, content: response });
    console.log(comment);
    res.status(200).json({ success: true, data: comment });
  } catch (error) {
    next(error);
  }
};