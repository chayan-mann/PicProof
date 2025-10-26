# PicProof 🌟

A next-generation social media platform that prioritizes trust, authenticity, and intelligent engagement with AI-powered content verification capabilities.

## 🚀 Features

- **Secure Authentication**: JWT-based auth + Google OAuth 2.0 integration
- **User Profiles**: Customizable profiles with follow/unfollow system
- **Post Creation**: Share text, images, and videos with your followers
- **Social Interactions**: Like, comment, and engage with posts
- **Real-time Feed**: Personalized feed based on who you follow
- **Search Functionality**: Discover and connect with new users
- **Notifications**: Stay updated with likes, comments, and new followers
- **Dark/Light Mode**: Toggle between themes for comfortable viewing
- **AI-Ready Infrastructure**: Built-in support for AI content verification
- **Responsive Design**: Beautiful UI that works on all devices

## 🛠️ Tech Stack

### Backend
- Node.js + Express.js - Server framework
- MongoDB + Mongoose - Database and ODM
- Passport.js - Authentication (JWT + Google OAuth)
- Multer - File uploads
- bcryptjs - Password hashing

### Frontend
- React 19 + Vite - UI framework and build tool
- React Router DOM - Client-side routing
- Axios - HTTP client
- Zustand - State management
- Lucide React - Icon library

## 🚦 Getting Started

### Backend Setup
```bash
cd server
npm install
# Create .env file with MONGO_URL, JWT_SECRET, PORT
npm run dev
```

### Frontend Setup
```bash
cd client
npm install
# Create .env file with VITE_API_URL=http://localhost:8000/api
npm run dev
```

## 📚 API Endpoints

- **Auth**: /api/auth (register, login, logout, google oauth)
- **Users**: /api/users (profile, follow, search)
- **Posts**: /api/posts (create, feed, like, delete)
- **Comments**: /api/posts/:id/comments
- **Notifications**: /api/notifications

Full API documentation available in `server/API_DOCS.md`

## 👨‍💻 Author

Built by Chayan Mann
