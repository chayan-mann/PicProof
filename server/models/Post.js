const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, "Post content is required"],
      maxlength: [500, "Post content cannot exceed 500 characters"],
      trim: true,
    },
    mediaUrl: {
      type: String,
      default: "",
    },
    mediaType: {
      type: String,
      enum: ["image", "video", "none"],
      default: "none",
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    shares: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
    },
    visibility: {
      type: String,
      enum: ["public", "followers", "private"],
      default: "public",
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    mentions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Virtuals
postSchema.virtual("likesCount").get(function () {
  return this.likes.length;
});

postSchema.virtual("commentsCount").get(function () {
  return this.comments.length;
});

postSchema.virtual("sharesCount").get(function () {
  return this.shares.length;
});

// Indexes for better performance
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });

// Ensure virtuals are included
postSchema.set("toJSON", { virtuals: true });
postSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Post", postSchema);
