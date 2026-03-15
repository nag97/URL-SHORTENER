# URL Shortener - Full Stack Application

A complete URL shortening service with React frontend and Node.js/Express backend, deployed on Render with PostgreSQL.

## 🚀 Tech Stack

- **Frontend:** React 18 + Vite + Tailwind CSS + Radix UI
- **Backend:** Node.js + Express + PostgreSQL
- **Authentication:** JWT tokens
- **Database:** PostgreSQL (Render Postgres)
- **Deployment:** Render (Static Frontend + Web Service Backend)

## 📁 Project Structure

```
├── src/                    # Frontend React application
│   ├── components/         # React components
│   ├── pages/              # Page components (Auth, Dashboard, etc.)
│   ├── db/                 # API layer (calls backend endpoints)
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities
│   └── context.jsx         # Auth context
│
├── backend/                # Express backend API
│   ├── server.js           # Express app entry point
│   ├── routes/             # API endpoints
│   │   ├── auth.js         # Authentication endpoints
│   │   ├── urls.js         # URL CRUD endpoints
│   │   └── redirect.js     # Redirect & analytics
│   ├── middleware/         # Auth middleware (JWT verification)
│   ├── models/             # Database layer
│   │   └── db.js           # PostgreSQL connection & queries
│   └── package.json        # Backend dependencies
│
├── public/                 # Static assets
├── package.json            # Frontend dependencies & scripts
├── vite.config.js          # Vite configuration
└── tailwind.config.js      # Tailwind CSS configuration
```

## 🔧 Setup Instructions

### Prerequisites
- Node.js v16+ installed
- PostgreSQL database (or Render PostgreSQL)
- Git configured

### Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/nag97/URL-SHORTENER.git
   cd URL-SHORTENER
   ```

2. **Install frontend dependencies:**
   ```bash
   npm install
   ```

3. **Install backend dependencies:**
   ```bash
   cd backend
   npm install
   cd ..
   ```

4. **Create backend .env file:**
   ```bash
   cp backend/.env.example backend/.env
   ```
   Update `backend/.env` with your PostgreSQL credentials:
   ```
   DATABASE_URL=postgresql://user:password@host:port/database
   JWT_SECRET=your-secret-key-here
   PORT=5000
   FRONTEND_URL=http://localhost:5173
   NODE_ENV=development
   ```

5. **Create frontend .env file:**
   ```bash
   cat > .env << EOF
   VITE_API_URL=http://localhost:5000/api
   EOF
   ```

6. **Start both servers (from root directory):**
   ```bash
   npm run dev:all
   ```
   Or run separately in different terminals:
   ```bash
   # Terminal 1: Frontend
   npm run dev
   
   # Terminal 2: Backend
   cd backend && npm run dev
   ```

7. **Open in browser:**
   - Frontend: http://localhost:5173
   - Backend Health: http://localhost:5000/health

## 🚀 Deployment on Render

### Step 1: Create PostgreSQL Database
1. Go to https://render.com
2. Click **"New +"** → **"PostgreSQL"**
3. Configure and create
4. Copy the connection string

### Step 2: Deploy Backend Service

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `node backend/server.js`
4. Add Environment Variables:
   - `DATABASE_URL=` (from PostgreSQL)
   - `JWT_SECRET=` (generate with `openssl rand -hex 32`)
   - `PORT=5000`
   - `NODE_ENV=production`
   - `FRONTEND_URL=` (update after frontend deploys)
5. Deploy

### Step 3: Deploy Frontend (Static Site)

1. Click **"New +"** → **"Static Site"**
2. Connect same repository
3. Configure:
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
4. Add Environment Variable:
   - `VITE_API_URL=https://[backend-url]/api`
5. Deploy

### Step 4: Update Backend Environment

1. Go to backend service on Render
2. Update `FRONTEND_URL` to your frontend URL
3. Save (auto-redeploy)

## 📝 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires JWT)
- `POST /api/auth/logout` - Logout

### URLs
- `GET /api/urls` - Get all URLs for user (requires JWT)
- `POST /api/urls` - Create short URL (requires JWT)
- `GET /api/urls/:id` - Get specific URL (requires JWT)
- `DELETE /api/urls/:id` - Delete URL (requires JWT)

### Redirect & Analytics
- `GET /:shortCode` - Redirect to original URL
- `POST /api/analytics/click/:id` - Record click
- `GET /api/analytics/stats/:urlId` - Get click statistics

## 🔐 Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

### Backend (backend/.env)
```
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your-secret-key-minimum-32-chars
PORT=5000
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

## 📦 Available Scripts

### Frontend
```bash
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Backend
```bash
npm run dev          # Start with auto-reload
npm run start        # Start server
```

### Both
```bash
npm run dev:all      # Start frontend + backend (requires concurrently)
npm run build:all    # Build frontend + install backend deps
```

## 🧪 Testing

### Local Testing
1. Create an account
2. Create a shortened URL
3. Copy the short link
4. Open in new tab - should redirect
5. Check click count increases

### Render Testing
Same as above, but using your Render URLs:
- Frontend: `https://your-frontend.onrender.com`
- Backend: `https://your-backend.onrender.com`

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| CORS errors | Check `FRONTEND_URL` in backend .env |
| Database connection fails | Verify `DATABASE_URL` is correct |
| Frontend can't reach API | Ensure `VITE_API_URL` matches backend URL |
| Redirect returns 404 | Verify database tables were created |
| JWT errors | Check `JWT_SECRET` is set in backend |

## 📚 Database Schema

### Users Table
```sql
id (UUID, PK)
email (VARCHAR, UNIQUE)
password_hash (VARCHAR)
name (VARCHAR)
profile_pic (TEXT)
created_at (TIMESTAMP)
```

### URLs Table
```sql
id (UUID, PK)
user_id (UUID, FK to users)
title (VARCHAR)
original_url (TEXT)
short_url (VARCHAR, UNIQUE)
custom_url (VARCHAR, UNIQUE)
qr (TEXT - base64 encoded)
clicks (INTEGER)
created_at (TIMESTAMP)
```

### Clicks Table
```sql
id (UUID, PK)
url_id (UUID, FK to urls)
timestamp (TIMESTAMP)
device (VARCHAR)
user_agent (TEXT)
```

## 📄 License

This project is part of a URL Shortener learning series.

## 👤 Author

Deployed and maintained for Render hosting.
