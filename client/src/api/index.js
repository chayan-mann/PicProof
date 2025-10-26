import api from "./axios";

// Auth APIs
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  getMe: () => api.get("/auth/me"),
  updateDetails: (data) => api.put("/auth/updatedetails", data),
  updatePassword: (data) => api.put("/auth/updatepassword", data),
  logout: () => api.get("/auth/logout"),
};

// User APIs
export const userAPI = {
  getUserProfile: (id) => api.get(`/users/${id}`),
  getProfile: (id) => api.get(`/users/${id}`),
  searchUsers: (query) => api.get(`/users/search?q=${query}`),
  followUser: (id) => api.post(`/users/${id}/follow`),
  unfollowUser: (id) => api.delete(`/users/${id}/follow`),
  getFollowers: (id) => api.get(`/users/${id}/followers`),
  getFollowing: (id) => api.get(`/users/${id}/following`),
  updateProfilePicture: (formData) =>
    api.put("/users/profile-picture", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

// Post APIs
export const postAPI = {
  getFeed: (page = 1, limit = 10) =>
    api.get(`/posts/feed?page=${page}&limit=${limit}`),
  getPost: (id) => api.get(`/posts/${id}`),
  getUserPosts: (userId, page = 1, limit = 10) =>
    api.get(`/posts/user/${userId}?page=${page}&limit=${limit}`),
  createPost: (formData) =>
    api.post("/posts", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  updatePost: (id, data) => api.put(`/posts/${id}`, data),
  deletePost: (id) => api.delete(`/posts/${id}`),
  likePost: (id) => api.post(`/posts/${id}/like`),
};

// Comment APIs
export const commentAPI = {
  getPostComments: (postId, page = 1, limit = 20) =>
    api.get(`/comments/post/${postId}?page=${page}&limit=${limit}`),
  createComment: (data) => api.post("/comments", data),
  updateComment: (id, data) => api.put(`/comments/${id}`, data),
  deleteComment: (id) => api.delete(`/comments/${id}`),
  likeComment: (id) => api.post(`/comments/${id}/like`),
};

// Notification APIs
export const notificationAPI = {
  getNotifications: (page = 1, limit = 20) =>
    api.get(`/notifications?page=${page}&limit=${limit}`),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put("/notifications/read-all"),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
};
