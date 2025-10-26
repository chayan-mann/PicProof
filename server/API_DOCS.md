# PicProof API Documentation

Base URL: `http://localhost:8000/api`

## Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## Auth Endpoints

### Register User

**POST** `/auth/register`

Request body:

```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

Response:

```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "username": "johndoe",
    "email": "john@example.com",
    "name": "John Doe",
    "profilePicture": "https://via.placeholder.com/150",
    "bio": "",
    "followersCount": 0,
    "followingCount": 0,
    "isVerified": false,
    "role": "user"
  }
}
```

### Login

**POST** `/auth/login`

Request body:

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Google OAuth Login

**GET** `/auth/google`

Redirects to Google OAuth consent screen. After authorization, redirects to callback with JWT token.

### Get Current User

**GET** `/auth/me` 🔒

Returns currently authenticated user's information.

### Update User Details

**PUT** `/auth/updatedetails` 🔒

Request body:

```json
{
  "name": "John Updated",
  "bio": "New bio text",
  "email": "newemail@example.com"
}
```

### Update Password

**PUT** `/auth/updatepassword` 🔒

Request body:

```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

### Logout

**GET** `/auth/logout` 🔒

---

## User Endpoints

### Get User Profile

**GET** `/users/:id`

Returns user profile with post count.

### Search Users

**GET** `/users/search?q=john`

Query parameters:

- `q` - Search query (searches username and name)

### Follow User

**POST** `/users/:id/follow` 🔒

### Unfollow User

**DELETE** `/users/:id/follow` 🔒

### Get Followers

**GET** `/users/:id/followers`

### Get Following

**GET** `/users/:id/following`

### Update Profile Picture

**PUT** `/users/profile-picture` 🔒

Form data:

- `image` - Image file (jpeg, jpg, png, gif)

---

## Post Endpoints

### Get Feed

**GET** `/posts/feed?page=1&limit=10` 🔒

Returns posts from users you follow + your own posts.

Query parameters:

- `page` - Page number (default: 1)
- `limit` - Posts per page (default: 10)

Response:

```json
{
  "success": true,
  "count": 10,
  "total": 50,
  "page": 1,
  "pages": 5,
  "data": [...]
}
```

### Get Single Post

**GET** `/posts/:id`

### Get User Posts

**GET** `/posts/user/:userId?page=1&limit=10`

### Create Post

**POST** `/posts` 🔒

Form data:

- `content` - Post text (1-500 characters)
- `media` - Optional image/video file
- `visibility` - 'public', 'followers', or 'private' (optional)
- `tags` - Array of tags (optional)

Example with JavaScript fetch:

```javascript
const formData = new FormData();
formData.append("content", "This is my post");
formData.append("media", fileInput.files[0]);
formData.append("visibility", "public");

fetch("/api/posts", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
  },
  body: formData,
});
```

### Update Post

**PUT** `/posts/:id` 🔒

Request body:

```json
{
  "content": "Updated content"
}
```

### Delete Post

**DELETE** `/posts/:id` 🔒

### Like/Unlike Post

**POST** `/posts/:id/like` 🔒

Toggles like status. Returns:

```json
{
  "success": true,
  "message": "Post liked",
  "liked": true,
  "likesCount": 42
}
```

---

## Comment Endpoints

### Get Post Comments

**GET** `/comments/post/:postId?page=1&limit=20`

### Create Comment

**POST** `/comments` 🔒

Request body:

```json
{
  "content": "Great post!",
  "postId": "post_id_here",
  "parentCommentId": "optional_for_replies"
}
```

### Update Comment

**PUT** `/comments/:id` 🔒

Request body:

```json
{
  "content": "Updated comment"
}
```

### Delete Comment

**DELETE** `/comments/:id` 🔒

### Like/Unlike Comment

**POST** `/comments/:id/like` 🔒

---

## Notification Endpoints

### Get Notifications

**GET** `/notifications?page=1&limit=20` 🔒

Response includes:

- `unreadCount` - Number of unread notifications
- Populated sender and post information

### Mark Notification as Read

**PUT** `/notifications/:id/read` 🔒

### Mark All as Read

**PUT** `/notifications/read-all` 🔒

### Delete Notification

**DELETE** `/notifications/:id` 🔒

---

## Error Responses

All endpoints return consistent error format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email"
    }
  ]
}
```

Common HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (not logged in or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting

(To be implemented)

- Standard endpoints: 100 requests per 15 minutes
- Auth endpoints: 5 requests per 15 minutes

---

## File Upload Limits

- Max file size: 10MB
- Allowed formats:
  - Images: jpeg, jpg, png, gif
  - Videos: mp4, mov, avi

---

## Notes

- All timestamps are in ISO 8601 format
- Pagination starts at page 1
- Default limit for list endpoints is 10-20 items
- 🔒 indicates protected routes (require authentication)
