# MovieVerse – Your universe of movies



## 🚀 Features
- **User Authentication**: Register and Login functionality.
- **TMDB Integration**: Explore popular movies and search for your favorites.
- **Personal Watchlist**: Add or remove movies from your personal vault.
- **Protected Routes**: Secure access to app features.

## 📂 Project Structure

### Backend (`/backend`)
- `server.js`: Main entry point and server configuration.
- `models/`: Database schemas (User, Movie).
- `routes/`: API endpoints with business logic.
- `middleware/`: Authentication checks.

### Frontend (`/frontend`)
- `src/App.jsx`: Root component with routing.
- `src/context/`: Auth state management.
- `src/pages/`: Main application views.
- `src/components/`: Reusable UI parts.

## 🛠️ Setup Instructions

### 1. Backend Setup
1. `cd backend`
2. `npm install`
3. Create `.env` file:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   TMDB_API_KEY=your_tmdb_api_key
   ```
4. `npm run dev` (starts on localhost:5000)

### 2. Frontend Setup
1. `cd frontend`
2. `npm install`
3. `npm run dev` (starts on localhost:5173)

## 📜 Credits
Data provided by TMDB API.

