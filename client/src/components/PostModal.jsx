import { useState, useEffect } from "react";
import { X, Heart, MessageCircle, Send, Sparkles } from "lucide-react";
import { postAPI, commentAPI } from "../api";
import { useAuthStore } from "../store/authStore";
import { getProfilePicture, getImageUrl } from "../utils/imageUrl";
import { formatTime } from "../utils/formatTime";
import Comment from "./Comment";
import "./PostModal.css";

const PostModal = ({ postId, onClose }) => {
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [llmComments, setLlmComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [showLLMPrompt, setShowLLMPrompt] = useState(false);
  const [llmPrompt, setLlmPrompt] = useState("");
  const [generatingLLM, setGeneratingLLM] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchPostAndComments = async () => {
      try {
        const [postRes, commentsRes] = await Promise.all([
          postAPI.getPost(postId),
          commentAPI.getPostComments(postId),
        ]);
        setPost(postRes.data.data);
        setComments(commentsRes.data.data || []);
        setLiked(postRes.data.data.likes?.includes(user?._id) || false);
        setLikesCount(postRes.data.data.likesCount || 0);
      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPostAndComments();
  }, [postId, user]);

  const handleLike = async () => {
    try {
      const response = await postAPI.likePost(postId);
      setLiked(response.data.liked);
      setLikesCount(response.data.likesCount);
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const response = await commentAPI.createComment({
        content: newComment,
        postId: postId,
      });
      setComments([response.data.data, ...comments]);
      setNewComment("");
      setPost((prev) => ({
        ...prev,
        commentsCount: (prev.commentsCount || 0) + 1,
      }));
    } catch (error) {
      console.error("Error creating comment:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCommentDeleted = (commentId) => {
    setComments((prev) => prev.filter((c) => c._id !== commentId));
    setPost((prev) => ({
      ...prev,
      commentsCount: Math.max((prev.commentsCount || 1) - 1, 0),
    }));
  };

  const handleReplyAdded = () => {
    setPost((prev) => ({
      ...prev,
      commentsCount: (prev.commentsCount || 0) + 1,
    }));
  };

  const handleGenerateLLMComment = async (e) => {
    e.preventDefault();
    if (!llmPrompt.trim()) return;

    setGeneratingLLM(true);
    try {
      const response = await commentAPI.generateLLMComment(postId, llmPrompt);
      setLlmComments((prev) => [response.data.data, ...prev]);
      setLlmPrompt("");
      setShowLLMPrompt(false);
      setPost((prev) => ({
        ...prev,
        commentsCount: (prev.commentsCount || 0) + 1,
      }));
    } catch (error) {
      console.error("Error generating LLM comment:", error);
      alert("Failed to generate AI comment. Please try again.");
    } finally {
      setGeneratingLLM(false);
    }
  };

  const quickPrompts = [
    "Analyze this post",
    "What's interesting about this?",
    "Provide insights",
    "Summarize this post",
  ];

  if (loading) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="modal-post">
          <div className="post-header">
            <img
              src={getProfilePicture(post.author?.profilePicture)}
              alt={post.author?.username}
              className="author-avatar"
            />
            <div className="author-info">
              <div className="author-name">{post.author?.name}</div>
              <div className="post-meta">
                <span className="author-username">
                  @{post.author?.username}
                </span>
                <span className="post-time">
                  {" "}
                  · {formatTime(post.createdAt)}
                </span>
              </div>
            </div>
          </div>

          <div className="post-content">
            <p>{post.content}</p>
            {(post.image || post.mediaUrl) && (
              <div className="post-media">
                <img src={getImageUrl(post.image || post.mediaUrl)} alt="Post media" />
              </div>
            )}
          </div>

          <div className="post-actions">
            <button
              onClick={handleLike}
              className={`action-btn ${liked ? "liked" : ""}`}
            >
              <Heart size={20} fill={liked ? "currentColor" : "none"} />
              <span>{likesCount}</span>
            </button>
            <button className="action-btn">
              <MessageCircle size={20} />
              <span>{post.commentsCount || 0}</span>
            </button>
          </div>
        </div>

        <div className="modal-comments">
          <div className="comment-input-section">
            <form onSubmit={handleSubmitComment} className="comment-form">
              <img
                src={getProfilePicture(user?.profilePicture)}
                alt="Your avatar"
                className="comment-avatar"
              />
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="comment-input"
                disabled={submitting}
              />
              <button
                type="submit"
                className="comment-submit"
                disabled={!newComment.trim() || submitting}
              >
                <Send size={20} />
              </button>
            </form>
            <button
              onClick={() => setShowLLMPrompt(!showLLMPrompt)}
              className="llm-toggle-btn"
              title="Get AI-generated comment"
            >
              <Sparkles size={18} />
              <span>AI Comment</span>
            </button>
          </div>

          {showLLMPrompt && (
            <div className="llm-prompt-section">
              <form onSubmit={handleGenerateLLMComment} className="llm-prompt-form">
                <div className="quick-prompts">
                  {quickPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setLlmPrompt(prompt)}
                      className="quick-prompt-btn"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
                <div className="llm-input-group">
                  <input
                    type="text"
                    value={llmPrompt}
                    onChange={(e) => setLlmPrompt(e.target.value)}
                    placeholder="Ask AI to comment on this post..."
                    className="llm-prompt-input"
                    disabled={generatingLLM}
                  />
                  <button
                    type="submit"
                    className="llm-generate-btn"
                    disabled={!llmPrompt.trim() || generatingLLM}
                  >
                    {generatingLLM ? "Generating..." : "Generate"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowLLMPrompt(false);
                      setLlmPrompt("");
                    }}
                    className="llm-cancel-btn"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="comments-list">
            {llmComments.length > 0 && (
              <>
                {llmComments.map((comment) => (
                  <Comment
                    key={comment._id}
                    comment={comment}
                    postId={postId}
                    isLLM={true}
                  />
                ))}
              </>
            )}
            {comments.length === 0 && llmComments.length === 0 ? (
              <p className="no-comments">
                No comments yet. Be the first to comment!
              </p>
            ) : (
              comments.map((comment) => (
                <Comment
                  key={comment._id}
                  comment={comment}
                  postId={postId}
                  onDelete={handleCommentDeleted}
                  onReplyAdded={handleReplyAdded}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostModal;
