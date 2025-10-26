import { useState } from "react";
import { Image, X } from "lucide-react";
import { postAPI } from "../api";
import "./CreatePostForm.css";

const CreatePostForm = ({ onPostCreated }) => {
  const [content, setContent] = useState("");
  const [media, setMedia] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMedia(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !media) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("content", content);
    if (media) formData.append("media", media);

    try {
      const response = await postAPI.createPost(formData);
      onPostCreated(response.data.data);
      setContent("");
      setMedia(null);
      setPreview("");
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-post-form card">
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          className="post-textarea"
          maxLength={500}
        />

        {preview && (
          <div className="media-preview">
            <img src={preview} alt="Preview" />
            <button
              type="button"
              onClick={() => {
                setMedia(null);
                setPreview("");
              }}
              className="remove-media"
            >
              <X size={20} />
            </button>
          </div>
        )}

        <div className="form-actions">
          <label className="media-upload-btn">
            <Image size={20} />
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleMediaChange}
              style={{ display: "none" }}
            />
          </label>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || (!content.trim() && !media)}
          >
            {loading ? "Posting..." : "Post"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePostForm;
