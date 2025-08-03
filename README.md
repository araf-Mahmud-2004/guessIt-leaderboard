# GuessIt Leaderboard

A number guessing game with user authentication and leaderboard functionality.

## Project Structure

- `frontend/` - React + Vite frontend application
- `backend/` - Node.js + Express backend API

## Deployment on Vercel

### Prerequisites

1. **MongoDB Database**: Set up a MongoDB database (MongoDB Atlas recommended)
2. **Supabase Account**: For additional authentication features (if used)

### Step-by-Step Deployment

1. **Fork/Clone this repository** to your GitHub account

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign in with your GitHub account
   - Click "New Project"
   - Import your repository

3. **Configure Environment Variables** in Vercel Dashboard:

   **Frontend Variables** (add these in Vercel's Environment Variables section):
   ```
   VITE_API_URL=https://your-app-name.vercel.app/api
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

   **Backend Variables**:
   ```
   NODE_ENV=production
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_secure_jwt_secret
   JWT_EXPIRE=7d
   ```

4. **Deploy**:
   - Vercel will automatically detect the configuration from `vercel.json`
   - The build process will handle both frontend and backend
   - Your app will be available at `https://your-app-name.vercel.app`

### Important Notes

- The backend API will be available at `/api/*` routes
- The frontend will be served from the root domain
- Make sure to update `VITE_API_URL` to match your Vercel deployment URL
- Ensure your MongoDB database allows connections from Vercel's IP ranges

### Local Development

1. **Backend**:
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your local configuration
   npm run dev
   ```

2. **Frontend**:
   ```bash
   cd frontend
   npm install
   cp .env.example .env.local
   # Edit .env.local with your configuration
   npm run dev
   ```

### Environment Variables Setup

#### MongoDB Setup
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get your connection string
4. Add it as `MONGODB_URI` in Vercel

#### JWT Secret
Generate a secure random string for `JWT_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Troubleshooting

- **API not working**: Check that `VITE_API_URL` points to your Vercel domain
- **Database connection issues**: Verify MongoDB URI and network access settings
- **Build failures**: Check the Vercel build logs for specific error messages