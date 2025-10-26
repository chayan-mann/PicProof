import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Camera, Users, UserPlus, UserMinus } from "lucide-react";
import { userAPI, postAPI } from "../api";
import { useAuthStore } from "../store/authStore";
import PostCard from "../components/PostCard";
import { getProfilePicture } from "../utils/imageUrl";
import "./ProfilePage.css";

const ProfilePage = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuthStore();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const isOwnProfile = currentUser?._id === userId;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        console.log("Fetching profile for userId:", userId);
        const [userRes, postsRes] = await Promise.all([
          userAPI.getUserProfile(userId),
          postAPI.getUserPosts(userId),
        ]);
        console.log("User data:", userRes.data);
        console.log("Posts data:", postsRes.data);
        setUser(userRes.data.data);
        setPosts(postsRes.data.data);
        setIsFollowing(
          userRes.data.data.followers?.some((f) => f._id === currentUser?._id)
        );
      } catch (error) {
        console.error("Error fetching profile:", error);
        console.error("Error response:", error.response?.data);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId, currentUser]);

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await userAPI.unfollowUser(userId);
        setIsFollowing(false);
        setUser((prev) => ({
          ...prev,
          followersCount: prev.followersCount - 1,
        }));
      } else {
        await userAPI.followUser(userId);
        setIsFollowing(true);
        setUser((prev) => ({
          ...prev,
          followersCount: prev.followersCount + 1,
        }));
      }
    } catch (error) {
      console.error("Error following user:", error);
    }
  };

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profilePicture", file);

    try {
      const response = await userAPI.updateProfilePicture(formData);
      setUser((prev) => ({
        ...prev,
        profilePicture: response.data.data.profilePicture,
      }));
    } catch (error) {
      console.error("Error updating profile picture:", error);
      alert("Failed to update profile picture");
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!user) return <div className="error">User not found</div>;

  return (
    <div className="profile-page">
      <div className="profile-header card">
        <div className="profile-cover" />
        <div className="profile-info">
          <div className="avatar-section">
            <img
              src={getProfilePicture(user.profilePicture)}
              alt={user.username}
              className="profile-avatar"
            />
            {isOwnProfile && (
              <label
                className="change-avatar-btn"
                title="Change profile picture"
              >
                <Camera size={20} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  style={{ display: "none" }}
                />
              </label>
            )}
          </div>
          <div className="profile-details">
            <h1>{user.name}</h1>
            <p className="username">@{user.username}</p>
            {user.bio && <p className="bio">{user.bio}</p>}
            <div className="profile-stats">
              <div className="stat">
                <strong>{posts.length}</strong>
                <span>Posts</span>
              </div>
              <div className="stat">
                <strong>{user.followersCount || 0}</strong>
                <span>Followers</span>
              </div>
              <div className="stat">
                <strong>{user.followingCount || 0}</strong>
                <span>Following</span>
              </div>
            </div>
          </div>
          {!isOwnProfile && (
            <button
              onClick={handleFollow}
              className={`btn follow-btn ${
                isFollowing ? "btn-outline" : "btn-primary"
              }`}
            >
              {isFollowing ? (
                <>
                  <UserMinus size={18} /> Unfollow
                </>
              ) : (
                <>
                  <UserPlus size={18} /> Follow
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="profile-posts">
        <h2>
          <Users size={20} /> Posts
        </h2>
        {posts.length === 0 ? (
          <div className="no-posts card">
            <p>No posts yet</p>
            {isOwnProfile && (
              <p className="hint">Share your first post to get started!</p>
            )}
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onDelete={(id) =>
                setPosts((prev) => prev.filter((p) => p._id !== id))
              }
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
