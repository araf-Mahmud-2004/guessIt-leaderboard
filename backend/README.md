# Backend API

A Node.js Express backend with MongoDB following the Router → Controller → Service architecture pattern.

## Architecture

```
Router → Controller → Service → Model → Database
```

- **Routes**: Define API endpoints and handle HTTP requests
- **Controllers**: Handle request/response logic and validation
- **Services**: Contain business logic and data processing
- **Models**: Define data structure and database interactions

## Project Structure

```
backend/
├── config/
│   └── database.js          # MongoDB connection configuration
├── controllers/
│   ├── authController.js    # Authentication controller
│   └── userController.js    # User management controller
├── middleware/
│   ├── auth.js             # Authentication & authorization middleware
│   └── validation.js       # Input validation middleware
├── models/
│   └── User.js             # User model schema
├── routes/
│   ├── authRoutes.js       # Authentication routes
│   └── userRoutes.js       # User management routes
├── services/
│   └── userService.js      # User business logic
├── utils/
│   └── responseHelper.js   # Response helper functions
├── .env                    # Environment variables
├── package.json           # Dependencies and scripts
├── server.js              # Main application entry point
└── README.md              # This file
```

## Features

- User registration and authentication
- JWT-based authorization
- Role-based access control (user/admin)
- Input validation
- Error handling
- Pagination support
- Password hashing
- Soft delete functionality

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   Update the `.env` file with your configuration:
   ```
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/backend_db
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=30d
   ```

3. **Start MongoDB**
   Make sure MongoDB is running on your system.

4. **Run the Application**
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user (protected)

### User Routes (`/api/users`)
- `POST /api/users` - Create a new user
- `GET /api/users/profile` - Get current user profile (protected)
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID (admin only)
- `PUT /api/users/:id` - Update user (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)

### Health Check
- `GET /health` - Server health check

## Request/Response Examples

### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123"
}
```

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password123"
}
```

### Get Users (Admin)
```bash
GET /api/users?page=1&limit=10
Authorization: Bearer <jwt_token>
```

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [] // Optional validation errors
}
```

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based authorization
- Input validation and sanitization
- CORS enabled
- Environment variable protection

## Development

To add new features:

1. Create model in `models/`
2. Create service in `services/`
3. Create controller in `controllers/`
4. Create routes in `routes/`
5. Add routes to `server.js`

## Dependencies

- **express**: Web framework
- **mongoose**: MongoDB ODM
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT authentication
- **express-validator**: Input validation
- **cors**: Cross-origin resource sharing
- **dotenv**: Environment variable management