const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const path = require("path");

// Load env vars
dotenv.config();

// Import database connection
const connectDatabase = require("./config/database");

// Import passport config
require("./config/passport");

// Import error handler
const errorHandler = require("./middleware/error");

// Import routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const postRoutes = require("./routes/posts");
const commentRoutes = require("./routes/comments");
const notificationRoutes = require("./routes/notifications");

// Initialize app
const app = express();

// Connect to database
connectDatabase();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// CORS
app.use(
  cors({
    origin: [process.env.CLIENT_URL || "http://localhost:5173", "https://discontinuously-vinaceous-sook.ngrok-free.dev"],
    credentials: true,
  })
);

// Security headers - Configure Helmet to allow serving static files
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
  })
);

// Dev logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Passport middleware
app.use(passport.initialize());

// Serve static files (uploads)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API Routes
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "PicProof API is running",
    version: "1.0.0",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/notifications", notificationRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
  });
});

// Error handler (must be last)
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

const PORT = process.env.PORT || 8000;

const server = app.listen(PORT, () => {
  console.log(`
    ╔═══════════════════════════════════════════════════╗
    ║                                                   ║
    ║   🚀 PicProof Server Running                     ║
    ║                                                   ║
    ║   Environment: ${
      process.env.NODE_ENV || "development"
    }                      ║
    ║   Port: ${PORT}                                    ║
    ║   URL: http://localhost:${PORT}                   ║
    ║                                                   ║
    ╚═══════════════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
