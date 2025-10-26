import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, MessageCircle, Trash2, Send } from "lucide-react";
import { commentAPI } from "../api";
import { useAuthStore } from "../store/authStore";
import { getProfilePicture } from "../utils/imageUrl";
import { formatTime } from "../utils/formatTime";
import "./Comment.css";

const Comment = ({
  comment,
  postId,
  onDelete,
  onReplyAdded,
  isReply = false,
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replies, setReplies] = useState(comment.replies || []);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(comment.likesCount || 0);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuthStore();
  const isOwnComment = user?._id === comment.author?._id;

  const handleLike = async () => {
    try {
      const response = await commentAPI.likeComment(comment._id);
      setLiked(response.data.liked);
      setLikesCount(response.data.likesCount);
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Delete this comment?")) {
      try {
        await commentAPI.deleteComment(comment._id);
        onDelete(comment._id);
      } catch (error) {
        console.error("Error deleting comment:", error);
      }
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setSubmitting(true);
    try {
      const response = await commentAPI.createComment({
        content: replyText,
        postId: postId,
        parentComment: comment._id,
      });
      setReplies([...replies, response.data.data]);
      setReplyText("");
      setShowReplyForm(false);
      if (onReplyAdded) onReplyAdded();
    } catch (error) {
      console.error("Error creating reply:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReplyDeleted = (replyId) => {
    setReplies((prev) => prev.filter((r) => r._id !== replyId));
    if (onReplyAdded) onReplyAdded();
  };

  return (
    <div className={`comment ${isReply ? "reply" : ""}`}>
      <Link to={`/profile/${comment.author?._id}`}>
        <img
          src={getProfilePicture(comment.author?.profilePicture)}
          alt={comment.author?.username}
          className="comment-avatar"
        />
      </Link>
      <div className="comment-content">
        <div className="comment-header">
          <Link
            to={`/profile/${comment.author?._id}`}
            className="comment-author"
          >
            <span className="author-name">{comment.author?.name}</span>
            <span className="author-username">@{comment.author?.username}</span>
          </Link>
          <span className="comment-time">{formatTime(comment.createdAt)}</span>
        </div>
        <p className="comment-text">{comment.content}</p>
        <div className="comment-actions">
          <button
            onClick={handleLike}
            className={`comment-action ${liked ? "liked" : ""}`}
          >
            <Heart size={16} fill={liked ? "currentColor" : "none"} />
            <span>{likesCount > 0 && likesCount}</span>
          </button>
          {!isReply && (
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="comment-action"
            >
              <MessageCircle size={16} />
              <span>Reply</span>
            </button>
          )}
          {isOwnComment && (
            <button
              onClick={handleDelete}
              className="comment-action delete-btn"
            >
              <Trash2 size={16} />
              <span>Delete</span>
            </button>
          )}
        </div>

        {showReplyForm && (
          <form onSubmit={handleReply} className="reply-form">
            <img
              src={getProfilePicture(user?.profilePicture)}
              alt="Your avatar"
              className="reply-avatar"
            />
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={`Reply to @${comment.author?.username}...`}
              className="reply-input"
              disabled={submitting}
              autoFocus
            />
            <button
              type="submit"
              className="reply-submit"
              disabled={!replyText.trim() || submitting}
            >
              {submitting ? "Posting..." : "Reply"}
            </button>
          </form>
        )}

        {replies.length > 0 && (
          <div className="replies">
            {replies.map((reply) => (
              <Comment
                key={reply._id}
                comment={reply}
                postId={postId}
                onDelete={handleReplyDeleted}
                isReply={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Comment;
