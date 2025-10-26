# PicProof Backend

Professional backend API for PicProof social media platform built with Node.js, Express, MongoDB, and Passport.js.

## Features

- 🔐 **Authentication**: JWT + Google OAuth 2.0
- 👥 **User Management**: Profiles, follow/unfollow, search
- 📝 **Posts**: Create, read, update, delete with media support
- 💬 **Comments**: Nested comments with replies
- ❤️ **Engagement**: Like posts and comments
- 🔔 **Notifications**: Real-time notification system
- 🤖 **AI Integration**: Ready for AI-powered content verification
- 🛡️ **Security**: Helmet, CORS, input validation
- 📁 **File Upload**: Multer for image/video uploads

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Passport.js (JWT + Google OAuth)
- **Validation**: Express Validator
- **Security**: Helmet, bcryptjs
- **File Upload**: Multer

## Project Structure

```
server/
├── config/
│   ├── database.js         # MongoDB connection
│   └── passport.js         # Passport strategies
├── controllers/
│   ├── authController.js   # Authentication logic
│   ├── userController.js   # User operations
│   ├── postController.js   # Post operations
│   ├── commentController.js # Comment operations
│   └── notificationController.js
├── middleware/
│   ├── auth.js            # JWT verification
│   ├── error.js           # Error handler
│   ├── upload.js          # File upload config
│   └── validate.js        # Validation middleware
├── models/
│   ├── User.js            # User schema
│   ├── Post.js            # Post schema
│   ├── Comment.js         # Comment schema
│   ├── AIFlag.js          # AI detection schema
│   └── Notification.js    # Notification schema
├── routes/
│   ├── auth.js            # Auth routes
│   ├── users.js           # User routes
│   ├── posts.js           # Post routes
│   ├── comments.js        # Comment routes
│   └── notifications.js   # Notification routes
├── utils/
│   ├── createUploadsDir.js
│   └── sendTokenResponse.js
├── uploads/               # User uploaded files
├── .env                   # Environment variables
├── .gitignore
├── index.js               # Entry point
└── package.json
```

## Installation

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables in `.env`:

   - Set your MongoDB connection string
   - Generate a secure JWT_SECRET
   - Add Google OAuth credentials (get from Google Cloud Console)

3. Create uploads directory (auto-created on first run)

## Running the Server

Development mode with auto-reload:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/password
- `GET /api/auth/google` - Google OAuth login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/updatedetails` - Update user details
- `PUT /api/auth/updatepassword` - Update password
- `GET /api/auth/logout` - Logout

### Users

- `GET /api/users/:id` - Get user profile
- `GET /api/users/search?q=query` - Search users
- `POST /api/users/:id/follow` - Follow user
- `DELETE /api/users/:id/follow` - Unfollow user
- `GET /api/users/:id/followers` - Get followers
- `GET /api/users/:id/following` - Get following
- `PUT /api/users/profile-picture` - Update profile picture

### Posts

- `GET /api/posts/feed` - Get feed (following + own posts)
- `GET /api/posts/:id` - Get single post
- `GET /api/posts/user/:userId` - Get user's posts
- `POST /api/posts` - Create post (with optional media)
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/posts/:id/like` - Like/unlike post

### Comments

- `GET /api/comments/post/:postId` - Get post comments
- `POST /api/comments` - Create comment
- `PUT /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment
- `POST /api/comments/:id/like` - Like/unlike comment

### Notifications

- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

## Authentication

### JWT Authentication

Send token in Authorization header:

```
Authorization: Bearer <token>
```

### Google OAuth

1. Visit `/api/auth/google` to initiate OAuth flow
2. User authorizes with Google
3. Callback returns JWT token

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- HTTP-only cookies
- CORS protection
- Helmet security headers
- Input validation and sanitization
- File upload restrictions

## Database Models

### User

- Authentication (local + Google OAuth)
- Profile information
- Followers/Following relationships
- Role-based access control

### Post

- Text content + optional media
- Visibility settings (public/followers/private)
- Engagement metrics (likes, comments, shares)

### Comment

- Nested structure with replies
- Like functionality
- Author tracking

### AIFlag

- Media authenticity detection
- Confidence scores
- Detection metadata

### Notification

- Multiple notification types
- Read/unread status
- Linked resources

## Future Enhancements

- [ ] AI-powered deepfake detection integration
- [ ] Real-time chat with Socket.io
- [ ] Advanced search with Elasticsearch
- [ ] Redis caching layer
- [ ] Rate limiting
- [ ] Email verification
- [ ] Password reset functionality
- [ ] Two-factor authentication
- [ ] Admin dashboard
- [ ] Analytics and insights

## Error Handling

The API uses consistent error responses:

```json
{
  "success": false,
  "message": "Error message here",
  "errors": [] // Optional validation errors
}
```

## Contributing

1. Follow the existing code structure
2. Use proper error handling
3. Add validation for all inputs
4. Document new endpoints
5. Test thoroughly before committing

## License

MIT
