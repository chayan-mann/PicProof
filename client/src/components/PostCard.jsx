import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, MessageCircle, Trash2, AlertTriangle } from "lucide-react";
import { postAPI } from "../api";
import { useAuthStore } from "../store/authStore";
import "./PostCard.css";

const PostCard = ({ post, onDelete }) => {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const { user } = useAuthStore();
  const isOwnPost = user?.id === post.author?._id;

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
            src={
              post.author?.profilePicture || "https://via.placeholder.com/40"
            }
            alt={post.author?.username}
            className="author-avatar"
          />
          <div>
            <div className="author-name">{post.author?.name}</div>
            <div className="author-username">@{post.author?.username}</div>
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
            <img
              src={`http://localhost:8000${post.mediaUrl}`}
              alt="Post media"
            />
            {post.aiFlag && post.aiFlag.isSynthetic && (
              <div className="ai-warning">
                <AlertTriangle size={16} />
                Potential synthetic media detected
              </div>
            )}
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
  );
};

export default PostCard;
