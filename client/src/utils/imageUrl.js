// Helper function to get the full image URL
export const getImageUrl = (path) => {
  if (!path) return "/user.png";
  if (path.startsWith("http")) return path;
  if (path.startsWith("/uploads")) return `http://localhost:8000${path}`;
  return path;
};

export const getProfilePicture = (profilePicture) => {
  return getImageUrl(profilePicture) || "/user.png";
};
