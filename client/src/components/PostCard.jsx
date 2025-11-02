import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, MessageCircle, Trash2, AlertTriangle } from "lucide-react";
import { postAPI } from "../api";
import { useAuthStore } from "../store/authStore";
import { getProfilePicture, getImageUrl } from "../utils/imageUrl";
import { formatTime } from "../utils/formatTime";
import PostModal from "./PostModal";
import "./PostCard.css";

const PostCard = ({ post, onDelete }) => {
  const textAnalysis = post.text_analysis;
  const imageAnalysis = post.image_analysis;
  const isSynthetic = textAnalysis?.isSynthetic;
  const ageRating = textAnalysis?.age_rating;
  const imagePrediction = imageAnalysis?.prediction;
  const isHarmful = textAnalysis?.isHarmful;
  const [showModal, setShowModal] = useState(false);
  const [liked, setLiked] = useState(
    post.likes?.includes(useAuthStore.getState().user?._id) || false
  );
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const { user } = useAuthStore();
  const isOwnPost = user?._id === post.author?._id;

  const handleLike = async () => {
    try {
      const response = await postAPI.likePost(post._id);
      setLiked(response.data.liked);
      setLikesCount(response.data.likesCount);
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Delete this post?")) {
      try {
        await postAPI.deletePost(post._id);
        onDelete(post._id);
      } catch (error) {
        console.error("Error deleting post:", error);
      }
    }
  };

  return (
    <div className="post-card card">
      <div className="post-header">
        <Link to={`/profile/${post.author?._id}`} className="post-author">
          <img
            src={getProfilePicture(post.author?.profilePicture)}
            alt={post.author?.username}
            className="author-avatar"
          />
          <div className="author-info">
            <div className="author-name">
              {post.author?.name || "Unknown User"}
            </div>
            <div className="post-meta">
              <span className="author-username">
                @{post.author?.username || "unknown"}
              </span>
              <span className="post-time"> · {formatTime(post.createdAt)}</span>
            </div>
          </div>
        </Link>
        {isOwnPost && (
          <button onClick={handleDelete} className="delete-btn">
            <Trash2 size={18} />
          </button>
        )}
      </div>

      <div className="post-content">
        <p>{post.content}</p>
        {post.mediaUrl && (
          <div className="post-media">
            <img src={getImageUrl(post.mediaUrl)} alt="Post media" />
            {post.aiFlag && post.aiFlag.isSynthetic && (
              <div className="ai-warning">
                <AlertTriangle size={16} />
                Potential synthetic media detected
              </div>
            )}
          </div>
        )}
      </div>

      <div className="post-tags">
        {isSynthetic && <span className="tag synthetic">Synthetic</span>}
        {isHarmful && <span className="tag harmful">Harmful</span>}
        {ageRating && ageRating !== "safe" && (
          <span className="tag age-rating">{ageRating}</span>
        )}
        {imagePrediction && imagePrediction !== "REAL" && (
          <span className="tag image-prediction">{imagePrediction}</span>
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
        <button className="action-btn" onClick={() => setShowModal(true)}>
          <MessageCircle size={20} />
          <span>{post.commentsCount || 0}</span>
        </button>
      </div>

      {showModal && (
        <PostModal postId={post._id} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
};

export default PostCard;
