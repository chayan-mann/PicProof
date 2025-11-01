import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Link } from "react-router-dom";
import { userAPI } from "../api";
import { getProfilePicture } from "../utils/imageUrl";
import { useAuthStore } from "../store/authStore";
import "./FollowListModal.css";

const FollowListModal = ({ userId, type, onClose }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(new Set());
  const { user: currentUser } = useAuthStore();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Fetch populated users from dedicated endpoints
        const response =
          type === "followers"
            ? await userAPI.getFollowers(userId)
            : await userAPI.getFollowing(userId);

        const list = response.data?.data || [];
        setUsers(list);

        // Set initial following state
        if (currentUser) {
          const followingSet = new Set(currentUser.following || []);
          setFollowing(followingSet);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [userId, type, currentUser]);

  const handleFollow = async (targetUserId) => {
    try {
      const isFollowing = following.has(targetUserId);
      if (isFollowing) {
        await userAPI.unfollowUser(targetUserId);
      } else {
        await userAPI.followUser(targetUserId);
      }
      setFollowing((prev) => {
        const newSet = new Set(prev);
        if (isFollowing) {
          newSet.delete(targetUserId);
        } else {
          newSet.add(targetUserId);
        }
        return newSet;
      });
    } catch (error) {
      console.error("Error following/unfollowing user:", error);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content follow-list-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{type === "followers" ? "Followers" : "Following"}</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="empty-state">
              <p>No {type === "followers" ? "followers" : "following"} yet</p>
            </div>
          ) : (
            <div className="users-list">
              {users.map((user) => (
                <div key={user._id} className="user-item">
                  <Link
                    to={`/profile/${user._id}`}
                    className="user-info"
                    onClick={onClose}
                  >
                    <img
                      src={getProfilePicture(user.profilePicture)}
                      alt={user.username}
                      className="user-avatar"
                    />
                    <div className="user-details">
                      <div className="user-name">{user.name}</div>
                      <div className="user-username">@{user.username}</div>
                      {user.bio && <div className="user-bio">{user.bio}</div>}
                    </div>
                  </Link>
                  {currentUser && currentUser._id !== user._id && (
                    <button
                      onClick={() => handleFollow(user._id)}
                      className={`follow-btn ${
                        following.has(user._id) ? "following" : ""
                      }`}
                    >
                      {following.has(user._id) ? "Unfollow" : "Follow"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowListModal;
