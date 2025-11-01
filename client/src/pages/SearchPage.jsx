import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, UserPlus, UserCheck } from "lucide-react";
import { userAPI } from "../api";
import { getProfilePicture } from "../utils/imageUrl";
import { useAuthStore } from "../store/authStore";
import "./SearchPage.css";

const SearchPage = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [followedUsers, setFollowedUsers] = useState(new Set());
  const { user: currentUser } = useAuthStore();
  const currentUserId = currentUser?._id || currentUser?.id;

  useEffect(() => {
    const searchUsers = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const response = await userAPI.searchUsers(query);
        const list = response.data.data || [];
        // Exclude self on client for extra safety
        const filtered = currentUserId
          ? list.filter((u) => u._id !== currentUserId)
          : list;
        setResults(filtered);
      } catch (error) {
        console.error("Error searching users:", error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounce);
  }, [query, currentUserId]);

  const handleFollow = async (userId) => {
    try {
      await userAPI.followUser(userId);
      setFollowedUsers((prev) => new Set(prev).add(userId));
    } catch (error) {
      console.error("Error following user:", error);
    }
  };

  const handleUnfollow = async (userId) => {
    try {
      await userAPI.unfollowUser(userId);
      setFollowedUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    } catch (error) {
      console.error("Error unfollowing user:", error);
    }
  };

  return (
    <div className="search-page">
      <div className="search-header card">
        <h1>Search Users</h1>
        <div className="search-bar">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for users..."
            className="search-input"
          />
        </div>
      </div>

      <div className="search-results">
        {loading && <div className="loading">Searching...</div>}

        {!loading && query && results.length === 0 && (
          <div className="no-results card">No users found</div>
        )}

        {results.map((user) => (
          <div key={user._id} className="user-card card">
            <Link to={`/profile/${user._id}`} className="user-info">
              <img
                src={getProfilePicture(user.profilePicture)}
                alt={user.username}
                className="user-avatar"
              />
              <div className="user-details">
                <div className="user-name">{user.name}</div>
                <div className="user-username">@{user.username}</div>
                {user.bio && <p className="user-bio">{user.bio}</p>}
              </div>
            </Link>
            {followedUsers.has(user._id) ? (
              <button
                onClick={() => handleUnfollow(user._id)}
                className="btn btn-outline"
              >
                <UserCheck size={18} /> Following
              </button>
            ) : (
              <button
                onClick={() => handleFollow(user._id)}
                className="btn btn-primary"
              >
                <UserPlus size={18} /> Follow
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchPage;
