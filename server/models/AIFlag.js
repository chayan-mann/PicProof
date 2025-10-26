const mongoose = require("mongoose");

const aiFlagSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      unique: true,
    },
    isSynthetic: {
      type: Boolean,
      default: false,
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0,
    },
    flagType: {
      type: String,
      enum: ["deepfake", "manipulated", "ai-generated", "authentic", "unknown"],
      default: "unknown",
    },
    reason: {
      type: String,
      default: "",
    },
    detectionModel: {
      type: String,
      default: "v1.0",
    },
    analysisDetails: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    checkedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["pending", "analyzed", "failed"],
      default: "pending",
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Single index for the post field (already unique above)
aiFlagSchema.index({ isSynthetic: 1, confidence: -1 });

module.exports = mongoose.model("AIFlag", aiFlagSchema);
