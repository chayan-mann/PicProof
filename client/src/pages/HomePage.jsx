import { useState, useEffect, useCallback } from "react";
import { postAPI } from "../api";
import CreatePostForm from "../components/CreatePostForm";
import PostCard from "../components/PostCard";
import "./HomePage.css";

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchFeed = useCallback(async () => {
    try {
      const response = await postAPI.getFeed(page, 10);
      if (page === 1) {
        setPosts(response.data.data);
      } else {
        setPosts((prev) => [...prev, ...response.data.data]);
      }
      setHasMore(response.data.page < response.data.pages);
    } catch (error) {
      console.error("Error fetching feed:", error);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handlePostDeleted = (postId) => {
    setPosts((prev) => prev.filter((post) => post._id !== postId));
  };

  return (
    <div className="home-page">
      <div className="home-container">
        <div className="home-main">
          <div className="page-header">
            <h2>Home</h2>
          </div>

          <CreatePostForm onPostCreated={handlePostCreated} />

          <div className="posts-list">
            {loading && page === 1 ? (
              <div className="loading-container">
                <div className="spinner"></div>
              </div>
            ) : posts.length === 0 ? (
              <div className="empty-state">
                <p>No posts yet. Follow some users to see their posts!</p>
              </div>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  onDelete={handlePostDeleted}
                />
              ))
            )}

            {hasMore && !loading && (
              <button
                onClick={() => setPage((prev) => prev + 1)}
                className="btn btn-outline load-more-btn"
              >
                Load More
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
