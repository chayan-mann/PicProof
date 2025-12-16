// Helper function to get the full image URL
export const getImageUrl = (path) => {
  if (!path) return "/user.png";

  // Handle Buffer object from MongoDB
  if (path && path.type === 'Buffer' && Array.isArray(path.data)) {
    const base64String = btoa(
      new Uint8Array(path.data).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ''
      )
    );
    return `data:image/jpeg;base64,${base64String}`;
  }

  if (typeof path === 'string') {
    if (path.startsWith("http")) return path;
    if (path.startsWith("/uploads")) return `http://localhost:8000${path}`;
  }

  return path;
};

export const getProfilePicture = (profilePicture) => {
  return getImageUrl(profilePicture) || "/user.png";
};
