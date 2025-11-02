# PicProof: AI-Powered Social Media Platform

PicProof is a next-generation social media platform designed to combat misinformation by integrating AI-powered image verification. It allows users to share images, follow other users, and engage with content, while providing a trust score for each image to indicate its authenticity.

## Features

- **User Authentication**: Secure user registration and login with email/password and Google OAuth.
- **Social Feed**: A dynamic feed to view posts from followed users.
- **Create & Share**: Upload images with captions.
- **AI Image Verification**: Each uploaded image is analyzed by a deep learning model to detect if it's real or potentially AI-generated/manipulated.
- **User Profiles**: View user profiles, posts, follower, and following counts.
- **Follow System**: Follow and unfollow other users to customize your feed.
- **Notifications**: Receive notifications for new followers and comments on your posts.
- **Search**: Find and discover other users on the platform.

## Tech Stack

The project is built with the MERN stack and includes a separate Python server for machine learning inference.

- **Frontend**:
  - React.js (with Vite)
  - Zustand for state management
  - React Router for navigation
  - Axios for API requests
  - Lucide React for icons

- **Backend**:
  - Node.js & Express.js
  - MongoDB with Mongoose for database management
  - JWT (JSON Web Tokens) & Passport.js for authentication
  - Multer for file uploads
  - Google Gemini API for potential generative AI features.

- **AI/ML**:
  - Python
  - Flask as a micro-framework to serve the model
  - PyTorch for the deepfake detection model (`discriminator_cnn.pth`)

## Project Structure

The repository is a monorepo containing three main parts:

```
.
├── client/              # React frontend application
├── server/              # Node.js/Express backend API
└── model_inference/     # Python/Flask server for AI model inference
```

- `client/`: Contains all the UI components, pages, and logic for the user-facing application.
- `server/`: The core backend that handles business logic, user data, authentication, and interaction with the database.
- `model_inference/`: A lightweight Flask server that exposes an endpoint to the main backend for running the image classification model.

## Getting Started

Follow these instructions to set up and run the project on your local machine.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer recommended)
- [Python](https://www.python.org/) (v3.8 or newer)
- [MongoDB](https://www.mongodb.com/try/download/community) instance (local or a cloud-based one like MongoDB Atlas)
- `git` for cloning the repository.

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/chayan-mann/PicProof.git
   cd PicProof
   ```

2. **Set up the Backend Server:**
   ```bash
   cd server
   npm install
   ```
   Create a `.env` file in the `server/` directory. This file is crucial for storing sensitive information. Add the following variables:

   ```env
   PORT=5000
   MONGO_URI=<YOUR_MONGODB_CONNECTION_STRING>
   JWT_SECRET=<YOUR_JWT_SECRET>
   JWT_EXPIRE=30d
   
   # Google OAuth Credentials
   GOOGLE_CLIENT_ID=<YOUR_GOOGLE_CLIENT_ID>
   GOOGLE_CLIENT_SECRET=<YOUR_GOOGLE_CLIENT_SECRET>

   # URL of the Flask AI Service
   FLASK_API_URL=http://127.0.0.1:8000/predict
   ```

3. **Set up the Frontend Client:**
   ```bash
   cd ../client
   npm install
   ```

4. **Set up the AI Model Inference Server:**
   ```bash
   cd ../model_inference
   pip install -r requirements.txt
   ```

### Running the Application

You need to run all three parts (backend, frontend, and AI server) concurrently in separate terminal windows.

1. **Start the Backend Server:**
   ```bash
   # In the /server directory
   npm run dev
   ```
   The server will start on the port defined in your `.env` file (e.g., `http://localhost:5000`).

2. **Start the Frontend Application:**
   ```bash
   # In the /client directory
   npm run dev
   ```
   The React development server will start, typically at `http://localhost:5173`.

3. **Start the AI Model Server:**
   ```bash
   # In the /model_inference directory
   python inference.py
   ```
   The Flask server will start on port `8000`.

Once all services are running, you can open your browser and navigate to the frontend URL (e.g., `http://localhost:5173`) to use the application.

## API

The backend API documentation, including available endpoints, request formats, and responses, can be found in the `server/API_DOCS.md` file.

## License

This project is licensed under the MIT License.
