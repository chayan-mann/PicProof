import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Camera, Users, UserPlus, UserMinus, UserCheck } from "lucide-react";
import { userAPI, postAPI, authAPI } from "../api";
import { useAuthStore } from "../store/authStore";
import PostCard from "../components/PostCard";
import FollowListModal from "../components/FollowListModal";
import { getProfilePicture } from "../utils/imageUrl";
import "./ProfilePage.css";

const ProfilePage = () => {
  const { userId } = useParams();
  const { user: currentUser, updateUser } = useAuthStore();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showFollowModal, setShowFollowModal] = useState(null); // 'followers' or 'following' or null
  const [settings, setSettings] = useState({
    ageRating: 'under18',
    isSynthetic: false,
    isHarmful: false,
    syntheticImages: false,
  });
  const currentUserId = currentUser?._id || currentUser?.id;
  const isOwnProfile = currentUserId === userId;

  useEffect(() => {
    const fetchProfile = async () => {
      // Validate userId before making API call
      if (!userId || userId === "undefined" || userId === "null") {
        console.error("Invalid userId:", userId);
        setLoading(false);
        return;
      }

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
        
        // Check if current user is following this user by checking current user's following list
        const isOwnProfile = currentUserId === userId;
        if (!isOwnProfile && currentUser?.following) {
          const followingIds = currentUser.following.map(
            (f) => typeof f === "object" ? f._id || f.id : f
          );
          setIsFollowing(followingIds.includes(userId));
        } else {
          setIsFollowing(false);
        }
        
        // Load moderation preferences if viewing own profile
        if (isOwnProfile && userRes.data.data.moderationPreferences) {
          setSettings(userRes.data.data.moderationPreferences);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        console.error("Error response:", error.response?.data);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId, currentUser?.following, currentUserId]);

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await userAPI.unfollowUser(userId);
        setIsFollowing(false);
        setUser((prev) => ({
          ...prev,
          followersCount: prev.followersCount - 1,
        }));
        // Update current user's following list in auth store
        updateUser({
          ...currentUser,
          following: currentUser.following.filter((f) => {
            const fid = typeof f === "object" ? f._id || f.id : f;
            return fid !== userId;
          }),
        });
      } else {
        await userAPI.followUser(userId);
        setIsFollowing(true);
        setUser((prev) => ({
          ...prev,
          followersCount: prev.followersCount + 1,
        }));
        // Update current user's following list in auth store
        updateUser({
          ...currentUser,
          following: [...(currentUser.following || []), userId],
        });
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

  const handleSettingsChange = async (newSettings) => {
    setSettings(newSettings);
    
    // Update in database
    try {
      await authAPI.updateDetails({
        moderationPreferences: newSettings,
      });
    } catch (error) {
      console.error("Error updating moderation preferences:", error);
      alert("Failed to update settings");
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
              <div
                className="stat clickable"
                onClick={() => setShowFollowModal("followers")}
                style={{ cursor: "pointer" }}
              >
                <strong>{user.followersCount || 0}</strong>
                <span>Followers</span>
              </div>
              <div
                className="stat clickable"
                onClick={() => setShowFollowModal("following")}
                style={{ cursor: "pointer" }}
              >
                <strong>{user.followingCount || 0}</strong>
                <span>Following</span>
              </div>
            </div>
          </div>
          <button
            onClick={isOwnProfile ? undefined : handleFollow}
            className={`btn follow-btn ${
              isOwnProfile
                ? "btn-outline"
                : isFollowing
                ? "btn-outline"
                : "btn-primary"
            }`}
            disabled={isOwnProfile}
            aria-disabled={isOwnProfile}
            title={
              isOwnProfile
                ? "You can't follow yourself"
                : isFollowing
                ? "Unfollow"
                : "Follow"
            }
          >
            {isOwnProfile ? (
              <>Your profile</>
            ) : isFollowing ? (
              <>
                <UserCheck size={18} /> Following
              </>
            ) : (
              <>
                <UserPlus size={18} /> Follow
              </>
            )}
          </button>
        </div>
      </div>

      {isOwnProfile && (
        <div className="moderation-actions">
        <div className="profile-settings card">
          <h3>Content Settings</h3>
          <div className="settings-row">
            <label>
              <input
                type="checkbox"
                checked={settings.isSynthetic}
                onChange={() =>
                  handleSettingsChange({
                    ...settings,
                    isSynthetic: !settings.isSynthetic,
                  })
                }
              />
              Allow synthetic content
            </label>
          </div>
          <div className="settings-row">
            <label>
              <input
                type="checkbox"
                checked={settings.syntheticImages}
                onChange={() =>
                  handleSettingsChange({
                    ...settings,
                    syntheticImages: !settings.syntheticImages,
                  })
                }
              />
              Allow synthetic images
            </label>
          </div>
          <div className="settings-row">
            <label>
              <input
                type="checkbox"
                checked={settings.isHarmful}
                onChange={() =>
                  handleSettingsChange({
                    ...settings,
                    isHarmful: !settings.isHarmful,
                  })
                }
              />
              Allow potentially harmful content
            </label>
          </div>
        </div>
        </div>
        )
      }

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

      {showFollowModal && (
        <FollowListModal
          userId={userId}
          type={showFollowModal}
          onClose={() => setShowFollowModal(null)}
        />
      )}
    </div>
  );
};

export default ProfilePage;
