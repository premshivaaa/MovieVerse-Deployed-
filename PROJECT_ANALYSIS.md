# MovieVerse – Complete System Architecture & End-to-End Execution Guide

This document provides a comprehensive, file-by-file breakdown of the **MovieVerse** project. It covers the entire technology stack, fundamental software engineering concepts, end-to-end user interaction workflows, network communication, and internal state management.

---

## 1. Project Overview & Architecture

**MovieVerse** is a full-stack **MERN** (MongoDB, Express.js, React 19, Node.js) web application integrated with **The Movie Database (TMDB) API** and **YouTube**. It allows users to register, log in, search for movies, view popular releases, inspect comprehensive movie details (genres, runtime, cast, and embedded trailers), and maintain a personalized, persistent watchlist (termed the "Cinematic Vault").

### Architectural Diagram

```
+-------------------------------------------------------------------------------+
|                                  CLIENT TIER                                  |
|                                                                               |
|   React 19 + Vite 7 SPA (Port 5173)                                           |
|   - Tailwind CSS v4 Neo-Brutalist Design System                               |
|   - React Router DOM v7 (Route Guards & Dynamic Routes)                       |
|   - AuthContext (Global User State & LocalStorage Synchronization)            |
|   - Axios HTTP Client (Interceptors for Auto-Logout on 401)                   |
+-------------------------------------------------------------------------------+
                                      |
                           HTTP / REST JSON (CORS)
                                      |
+-------------------------------------------------------------------------------+
|                                  SERVER TIER                                  |
|                                                                               |
|   Express.js & Node.js API (Port 5000)                                        |
|   - Security: Helmet, Rate Limiter (Brute-Force Protection), CORS             |
|   - Auth: JWT (JSON Web Tokens) & Bcrypt Password Salting/Hashing             |
|   - Protected Middleware: Bearer Token Extraction & Verification              |
|   - TMDB Reverse Proxy: Shields TMDB API key from client exposure             |
+-------------------------------------------------------------------------------+
                     /                                     \
           Mongoose ODM (Atlas)                    Axios HTTP Proxy
                   /                                         \
+-----------------------------+               +---------------------------------+
|        DATABASE TIER        |               |      EXTERNAL SERVICES TIER     |
|                             |               |                                 |
|   MongoDB Atlas Database    |               |   1. TMDB REST API v3           |
|   - Users Collection        |               |      (Popular, Search, Details) |
|   - Movies Collection       |               |   2. YouTube IFrame API         |
|     (Watchlist documents)   |               |      (Embedded Trailers)        |
+-----------------------------+               +---------------------------------+
```

---

## 2. Technology Stack & Design Justifications

### Frontend Stack
| Technology | Version | Purpose | Why It Was Chosen For That Place |
| :--- | :--- | :--- | :--- |
| **React** | `^19.2.0` | UI component layer, Virtual DOM, and state management. | **Why React?** Provides declarative, component-driven UI architecture. Components like `MovieCard`, `Navbar`, and `MovieTrailer` are reused across multiple views. React's Virtual DOM ensures fast re-renders when toggling watchlist states or filtering search queries without refreshing the page. |
| **Vite** | `^7.3.1` | Next-generation frontend build tool and dev server. | **Why Vite?** Replaces bulky bundlers (like Webpack or Create-React-App). Vite leverages native browser ES Modules (ESM) for instantaneous sub-second dev server start and ultra-fast Hot Module Replacement (HMR). Rollup-backed production builds yield optimized, minified bundles. |
| **React Router DOM** | `^7.13.1` | Single-Page Application (SPA) declarative client-side routing. | **Why React Router?** Enables seamless client-side page transitions without page reloads. Facilitates the `ProtectedRoute` route-guard pattern to block unauthorized users, and extracts dynamic URL parameters (e.g. `/movie/:id` via `useParams()`). |
| **Tailwind CSS** | `^4.2.1` | Utility-first CSS engine with custom design system. | **Why Tailwind?** Speeds up UI design directly in JSX without jumping between stylesheets. Tailwind v4's modern engine allows custom theme definition directly via `@theme` in `index.css`, creating a bespoke **Neo-Brutalist** aesthetic with zero runtime CSS overhead and no dead code. |
| **Axios** | `^1.13.5` | Promise-based HTTP client for API communications. | **Why Axios over `fetch`?** Native `fetch` does not reject promises on HTTP error codes (like `401` or `500`) and requires manual `.json()` parsing. Axios automatically handles JSON serialization, supports request cancelation, and critically provides **Response Interceptors** used here to globally intercept `401 Unauthorized` responses and trigger automatic logout. |
| **React Hot Toast**| `^2.6.0` | Non-intrusive micro-feedback alert system. | **Why React Hot Toast?** Far superior to browser-blocking `alert()`. It provides accessible, animated, non-blocking toast notifications positioned at `top-right` that auto-dismiss when movies are added (`Added 🎬`) or removed (`Removed 🎬`). |
| **Lucide React** | `^0.575.0` | Modern SVG iconography. | **Why Lucide React?** Lightweight, tree-shakeable SVG icons (such as `Clapperboard` in the Navbar) that scale cleanly with zero icon font rendering issues or styling bloat. |

### Backend Stack
| Technology | Version | Purpose | Why It Was Chosen For That Place |
| :--- | :--- | :--- | :--- |
| **Node.js** | Runtime | Asynchronous, event-driven JavaScript server runtime. | **Why Node.js?** Allows a single unified language (JavaScript) across both frontend and backend. Its event loop and non-blocking I/O excel at high-concurrency API gateway tasks, such as simultaneously proxying TMDB movie data and querying MongoDB. |
| **Express.js** | `^4.22.1` | Minimalist web application server framework. | **Why Express?** Highly unopinionated, battle-tested framework with a lightweight middleware pipeline. It makes assembling sequential pipelines (Helmet -> CORS -> JSON Parser -> Rate Limiter -> Routes -> Error Handlers) clear and manageable. |
| **MongoDB & Mongoose** | `^8.23.0` | NoSQL document database and Object Data Modeling (ODM). | **Why MongoDB & Mongoose over SQL?** Movie data from TMDB is inherently hierarchical JSON with variable properties (posters, genres, credits, overviews). MongoDB stores documents natively in BSON matching this structure without rigid table migrations. Mongoose introduces schema enforcement, automatic timestamping (`createdAt`, `updatedAt`), and relationship referencing (`ref: 'User'`). |
| **JSON Web Token (`jsonwebtoken`)** | `^9.0.3` | Cryptographic stateless authentication mechanism. | **Why JWT over Server Sessions?** Eliminates the need for server-side session stores (like Redis or memory tables), allowing the backend to scale horizontally without sticky sessions. The token is self-contained: it carries the user ID securely signed with `JWT_SECRET`, expiring safely in 7 days. |
| **BcryptJS** | `^2.4.3` | Adaptive cryptographic password salting and hashing. | **Why Bcrypt over SHA-256/MD5?** SHA and MD5 are fast mathematical algorithms vulnerable to GPU-based rainbow table brute-force cracking. Bcrypt is deliberately computationally slow, incorporating dynamic salt rounds (10 rounds used here) to make offline dictionary attacks computationally infeasible. |
| **Helmet** | `^8.3.0` | HTTP security response headers manager. | **Why Helmet?** Secures Express apps by setting 15+ standard HTTP security headers (including `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, and strict HSTS policies) to guard against clickjacking, cross-site scripting (XSS), and MIME sniffing. |
| **Express Rate Limit** | `^8.6.2` | Anti-brute-force rate limiter for sensitive routes. | **Why Express Rate Limit?** Protects authentication endpoints (`/api/auth`) from brute-force password guessing and credential stuffing attacks by capping attempts to 20 requests per 15-minute window per IP. |
| **CORS** | `^2.8.6` | Cross-Origin Resource Sharing middleware. | **Why CORS?** Since frontend (`localhost:5173`) and backend (`localhost:5000`) reside on different ports during development, browsers block requests by default under the Same-Origin Policy. `cors()` explicitly allows requests from `process.env.FRONTEND_URL`. |
| **Dotenv** | `^16.6.1` | Environment variable isolation utility. | **Why Dotenv?** Adheres to 12-Factor App principles by externalizing sensitive credentials (`MONGODB_URI`, `JWT_SECRET`, `TMDB_API_KEY`) away from version control into `.env` files. |

---

## 3. Architectural Decision Log: Why Each Technology & Pattern Was Chosen

### 1. Why React 19 instead of Plain HTML/JS or Angular/Vue?
- **Component Reusability**: The movie cards rendered on the Home page, Search results, and Watchlist page share 95% of their presentation and behavior. With React, `<MovieCard />` is written once and configured via props (`onAction`, `actionLabel`).
- **Dynamic State Synchronization**: When a user adds a movie on the Home screen, the card button flips to "remove", the ID is added to memory, and the watchlist count updates without a full page reload. Plain JavaScript would require tedious and error-prone manual DOM manipulations (`document.getElementById`, `element.classList.add`).
- **Lean Learning Curve vs Angular**: Angular enforces heavy TypeScript structures, RxJS Observables, and strict dependency injection. React provides a flexible, functional programming model using simple hooks.

### 2. Why Vite instead of Webpack or Create-React-App (CRA)?
- **Instant Server Startup**: CRA and Webpack bundle the entire application into memory before serving. Vite skips bundling during development altogether, serving source files over native browser ES Modules (ESM), which boots the server in milliseconds.
- **Lightning Hot Module Replacement (HMR)**: Changes made to styles or components update in the browser almost instantaneously without losing component state.
- **CRA is Deprecated**: The official React team has deprecated Create-React-App; Vite is the modern industry standard for client-side React SPAs.

### 3. Why Tailwind CSS v4 instead of Plain CSS or Component Libraries (MUI / Bootstrap)?
- **Custom Design Freedom**: Component libraries like Bootstrap or Material UI force generic, easily recognizable aesthetics. MovieVerse uses a custom **Neo-Brutalist** aesthetic (bold borders, stark drop shadows, comic typography), which is trivial to create in Tailwind via utility classes like `border-[3px] border-[#0a0a0f] shadow-[4px_4px_0px_#0a0a0f]`.
- **Zero Dead Code**: Tailwind purges all unused CSS classes at build time, resulting in tiny CSS bundle sizes.
- **Scoped Styling without Context Switching**: Developers don't need to juggle separate `.css` files and keep track of BEM class names; styles live directly alongside markup in JSX.

### 4. Why React Router DOM v7 instead of Multi-Page Navigation?
- **True Single-Page Application (SPA) Experience**: Eliminates white-screen flashing during page changes.
- **Protected Client-Side Route Guards**: Encapsulating routes within `<ProtectedRoute>` ensures private content is never rendered before verifying user authentication in memory.
- **Dynamic URL Route Matching**: Simplifies capturing dynamic IDs (e.g., `/movie/550`) using the `useParams()` hook.

### 5. Why Axios instead of the Browser's Native `fetch()`?
- **Global Interceptors**: Native `fetch` provides no clean way to intercept responses globally. Axios allows defining `axios.interceptors.response.use(...)` in [AuthContext.jsx](file:///c:/Users/mopad/OneDrive/Attachments/Desktop/MERN/MovieVerse/frontend/src/context/AuthContext.jsx). If any API call returns a `401 Unauthorized` (e.g. token expired), the interceptor automatically cleans up `localStorage` and logs the user out.
- **Sensible HTTP Error Handling**: Native `fetch` does not throw an error when receiving `404 Not Found` or `500 Server Error` (it only rejects on network failures). Axios automatically rejects on `4xx` and `5xx` statuses, simplifying `try/catch` blocks.
- **Automatic JSON Parsing**: Removes the repetitive boilerplate of calling `await response.json()`.

### 6. Why MongoDB & Mongoose instead of SQL (PostgreSQL / MySQL)?
- **Natural Fit for Third-Party API Data**: TMDB delivers movies as deeply nested JSON objects. Storing movie bookmarks in MongoDB does not require breaking data across multiple rigid normalized SQL tables (`movies`, `genres`, `posters`, `casts`).
- **Flexible Document Model**: As TMDB metadata evolves or additional fields are stored, MongoDB schemas can adapt without disruptive `ALTER TABLE` database migrations.
- **Mongoose Schema Validation**: Prevents data corruption by enforcing constraints (e.g., required fields, type checking, unique emails) on top of the schemaless database.

### 7. Why Stateless JWT instead of Server-Side Sessions / Cookies?
- **Stateless & Scalable**: In session-based authentication, the server must store session IDs in memory or a shared Redis cluster. With JWT, the server signs the token once; every subsequent request carries the token, and the server validates it mathematically via `jwt.verify(token, secret)` without database overhead.
- **Decoupled Architecture**: Enables future expansion to native mobile apps (React Native, iOS, Android) that do not support browser cookies natively.

### 8. Why BcryptJS instead of Plain SHA-256 or MD5?
- **Protection Against Rainbow Tables**: Fast cryptographic hashes like MD5 and SHA-256 can be reverse-engineered using precomputed hash tables (rainbow tables) or cracked at billions of guesses per second on modern GPUs.
- **Salting & Work Factor**: Bcrypt injects a cryptographic salt (random data) and performs $2^{10}$ rounds of iterative hashing, making brute-force cracking attempts too slow and costly for attackers.

### 9. Why a Backend Reverse Proxy for TMDB instead of Direct Client Calls?
- **API Key Confidentiality**: If React called `https://api.tmdb.org/3/...` directly, the `TMDB_API_KEY` would be visible to anyone opening the browser's Network tab or JavaScript bundle.
- **Rate Limit Management & Caching**: Moving external calls to the Express backend allows future integration of server-side caching (e.g., caching popular movies for 1 hour) to reduce external API consumption.

### 10. Why Context API instead of Redux or Zustand?
- **Lightweight Auth State**: The global application state only consists of `user` and `loading`. Introducing Redux Toolkit would require redundant boilerplate (slices, dispatchers, actions, reducers). Context API is built directly into React, adding zero bundle size.

### 11. Why Controlled Components (Two-Way Binding Simulation)?
- **Predictable Input State**: Managing form fields through React state (`useState`) ensures that input values are always accessible synchronously in JavaScript for validation, disabling submit buttons, and cleaning user input before it leaves the browser.

---

## 4. Core Concepts & Design Patterns

### 1. Two-Way Data Binding Simulation (Controlled Components)
In React, form elements like `<input>` don't have automatic two-way binding out of the box like Angular or Vue. Instead, MovieVerse employs the **Controlled Component Pattern**:
- State is held in React memory (`useState`).
- Input receives state via its `value` attribute (`value={email}`).
- User keystrokes trigger `onChange={(e) => setEmail(e.target.value)}`.
- The state update triggers a component re-render, ensuring the UI and the internal state remain in sync.

### 2. Context API & Global State Management
Instead of passing authentication state down through multiple tiers of components (prop drilling), MovieVerse encapsulates authentication logic inside [AuthContext.jsx](file:///c:/Users/mopad/OneDrive/Attachments/Desktop/MERN/MovieVerse/frontend/src/context/AuthContext.jsx).
- **State provided**: `user`, `loading`, `login()`, `logout()`.
- **Consumer components**: [Navbar.jsx](file:///c:/Users/mopad/OneDrive/Attachments/Desktop/MERN/MovieVerse/frontend/src/components/Navbar.jsx), [App.jsx](file:///c:/Users/mopad/OneDrive/Attachments/Desktop/MERN/MovieVerse/frontend/src/App.jsx), [Login.jsx](file:///c:/Users/mopad/OneDrive/Attachments/Desktop/MERN/MovieVerse/frontend/src/pages/Login.jsx), [Register.jsx](file:///c:/Users/mopad/OneDrive/Attachments/Desktop/MERN/MovieVerse/frontend/src/pages/Register.jsx).

### 3. Route Guarding / Higher-Order Component Pattern
The application secures private views using a `ProtectedRoute` wrapper component in [App.jsx](file:///c:/Users/mopad/OneDrive/Attachments/Desktop/MERN/MovieVerse/frontend/src/App.jsx#L13-L24).
- Checks `loading`: renders an animated loader while reading `localStorage`.
- Checks `user`: if `null`, returns `<Navigate to="/login" />` to block access.
- If verified: renders the child component (`children`).

### 4. Axios Response Interceptors & Session Expiry Handling
Inside [AuthContext.jsx](file:///c:/Users/mopad/OneDrive/Attachments/Desktop/MERN/MovieVerse/frontend/src/context/AuthContext.jsx#L18-L32), an Axios interceptor inspects every HTTP response:
- If a server responds with status code `401 Unauthorized` (e.g., token expired, forged, or missing), the interceptor automatically:
  1. Sets `user` state to `null`.
  2. Removes `user` and `token` from `localStorage`.
  3. Forces a window navigation to `/login`.
- Automatically cleans up the interceptor on unmount using `axios.interceptors.response.eject`.

### 5. Stateless JWT Authentication with Bearer Tokens
The server maintains no server-side sessions in memory or database:
- On login/registration, a JWT token is created containing `{ id: savedUser._id }`, signed with `JWT_SECRET`, expiring in 7 days.
- Protected requests send the token in the HTTP header: `Authorization: Bearer <token>`.
- The [authMiddleware.js](file:///c:/Users/mopad/OneDrive/Attachments/Desktop/MERN/MovieVerse/backend/middleware/authMiddleware.js) middleware decodes the token, attaches `req.user = verified.id`, and yields control to the route handler.

### 6. One-Way Cryptographic Salting & Hashing
Passwords are never stored in plain text. Before saving to MongoDB, the backend uses `bcrypt.hash(password, 10)` to produce a one-way salt and hash string. During login, `bcrypt.compare(password, user.password)` validates the password securely against timing attacks.

### 7. Reverse Proxy & API Key Shielding
If the frontend called the TMDB API directly, the private `TMDB_API_KEY` would be visible in browser network inspections. MovieVerse passes all TMDB requests through its Express backend routes ([movies.js](file:///c:/Users/mopad/OneDrive/Attachments/Desktop/MERN/MovieVerse/backend/routes/movies.js)), keeping third-party credentials secure.

### 8. Rate Limiting & DoS Protection
Using `express-rate-limit`, the `/api/auth` endpoint is locked to **20 requests per 15-minute window** per IP address, neutralizing brute-force dictionary attacks against user credentials.

### 9. Neo-Brutalist UI Styling System
Defined in [index.css](file:///c:/Users/mopad/OneDrive/Attachments/Desktop/MERN/MovieVerse/frontend/src/index.css):
- High-contrast outlines: `border-[3px] border-[#0a0a0f]`
- Hard-edge drop shadows: `shadow-[4px_4px_0px_#0a0a0f]`
- Tactile feedback: `active:translate-x-[2px] active:translate-y-[2px]`
- Cyberpunk-inspired palette: Pink `#ff3b7c`, Cyan `#45f3ff`, Deep Navy `#17182b`.

---

## 5. End-to-End User Interaction Scenarios & Execution Flow

Below is the step-by-step lifecycle for each action a user can take in the application.

---

### Scenario 1: Initial Application Load & Bootstrapping

```
User enters URL (http://localhost:5173) 
   │
   ▼
[main.jsx] mounts <React.StrictMode><App /></React.StrictMode>
   │
   ▼
[App.jsx] wraps with <AuthProvider> and <BrowserRouter>
   │
   ▼
[AuthContext.jsx] useEffect runs:
   ├── Reads localStorage.getItem('user') and localStorage.getItem('token')
   ├── Sets user state if found, or null
   ├── Registers Axios 401 Interceptor
   └── Sets loading = false
   │
   ▼
[App.jsx] <ProtectedRoute> evaluates user state:
   ├── If authenticated -> Renders <Home />
   └── If unauthenticated -> Redirects to /login
```

- **Files Involved**:
  - [frontend/src/main.jsx](file:///c:/Users/mopad/OneDrive/Attachments/Desktop/MERN/MovieVerse/frontend/src/main.jsx#L1-L9)
  - [frontend/src/App.jsx](file:///c:/Users/mopad/OneDrive/Attachments/Desktop/MERN/MovieVerse/frontend/src/App.jsx#L13-L66)
  - [frontend/src/context/AuthContext.jsx](file:///c:/Users/mopad/OneDrive/Attachments/Desktop/MERN/MovieVerse/frontend/src/context/AuthContext.jsx#L10-L32)
- **Concepts**: React Lifecycle (`useEffect`), Context Provider, Local Storage Deserialization, Route Guards, Virtual DOM Hydration.

---

### Scenario 2: User Registration ("Create Credentials")

#### Step 1: UI Navigation & Input
- **Action**: User clicks "Sign Up" on the Navbar or "Create credentials" on Login page.
- **Frontend File**: [Register.jsx](file:///c:/Users/mopad/OneDrive/Attachments/Desktop/MERN/MovieVerse/frontend/src/pages/Register.jsx)
- **Concepts**: Controlled Inputs, Synthetic Event Handling (`onChange`, `onSubmit`).
- **Data Captured**: `name`, `email`, `password`.

#### Step 2: Form Submission & Validation
- **Action**: User clicks "Create Account".
- **Frontend Code**: `handleSubmit(e)` in [Register.jsx](file:///c:/Users/mopad/OneDrive/Attachments/Desktop/MERN/MovieVerse/frontend/src/pages/Register.jsx#L15-L25).
- **HTTP Request**:
  - **Endpoint**: `POST http://localhost:5000/api/auth/register`
  - **Body**: `{ "name": "...", "email": "...", "password": "..." }`

#### Step 3: Backend Processing
- **Backend Files**:
  - [backend/server.js](file:///c:/Users/mopad/OneDrive/Attachments/Desktop/MERN/MovieVerse/backend/server.js#L21-L31) (`authLimiter` rate limiter)
  - [backend/routes/auth.js](file:///c:/Users/mopad/OneDrive/Attachments/Desktop/MERN/MovieVerse/backend/routes/auth.js#L8-L43)
  - [backend/models/User.js](file:///c:/Users/mopad/OneDrive/Attachments/Desktop/MERN/MovieVerse/backend/models/User.js)
- **Execution Flow**:
  1. Checks for empty fields (`!name || !email || !password`). Returns `400` if missing.
  2. Validates email structure using regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`.
  3. Validates password length (`password.length >= 6`).
  4. Queries MongoDB: `User.findOne({ email })`. Returns `400 "User already exists"` if duplicate.
  5. Hashes password: `await bcrypt.hash(password, 10)`.
  6. Saves new document: `new User({...}).save()`.
  7. Issues JWT: `jwt.sign({ id: savedUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' })`.
  8. Responds with status `200` JSON: `{ token, user: { id, name, email } }`.

#### Step 4: Frontend State Update & Navigation
- **Handler**: `login(res.data.user, res.data.token)` called in [AuthContext.jsx](file:///c:/Users/mopad/OneDrive/Attachments/Desktop/MERN/MovieVerse/frontend/src/context/AuthContext.jsx#L34-L38).
- **Storage**: Updates `user` in memory and sets `localStorage.setItem('token', token)`.
- **Feedback**: `toastSuccess("Welcome <name>")` triggers a toast popup.
- **Routing**: `navigate('/')` moves user straight to the Home dashboard.

---

### Scenario 3: User Login ("Verify Identity")

#### Step 1: Submission
- **Frontend File**: [Login.jsx](file:///c:/Users/mopad/OneDrive/Attachments/Desktop/MERN/MovieVerse/frontend/src/pages/Login.jsx#L14-L24)
- **HTTP Request**: `POST http://localhost:5000/api/auth/login` with `{ email, password }`.

#### Step 2: Backend Authentication
- **Backend File**: [backend/routes/auth.js](file:///c:/Users/mopad/OneDrive/Attachments/Desktop/MERN/MovieVerse/backend/routes/auth.js#L46-L73)
- **Execution Flow**:
  1. Validates presence of email and password.
  2. Queries `User.findOne({ email })`. If null, returns `400 "User does not exist"`.
  3. Compares password hashes: `bcrypt.compare(password, user.password)`. If false, returns `400 "Invalid credentials"`.
  4. Signs JWT with `{ id: user._id }` valid for 7 days.
  5. Returns token and sanitized user details.

#### Step 3: Resolution & Navigation
- Token and user data saved to `localStorage` and `AuthContext`.
- Toast: `"Welcome Back, <name>"`.
- Navigation to `/`.

---

### Scenario 4: Home Dashboard Loading & Watchlist Synchronization

When the user lands on the Home page (`/`), two data sources are merged simultaneously.

```
[Home.jsx] mounts
   │
   ├──> fetchPopularMovies() ──> GET /api/movies/popular ──> Axios calls TMDB /movie/popular
   │                                                             │
   │                                                             ▼
   │                                                  Returns 20 popular movies
   │
   └──> fetchWatchlistIds()   ──> GET /api/movies/watchlist ──> Mongoose: Movie.find({ userId })
                                       (with Bearer Token)       │
                                                                 ▼
                                                      Returns user's saved movies
   │
   ▼
Synchronize: setAddedMovieIds(watchlist.map(m => m.tmdbId))
   │
   ▼
Render Grid: <MovieCard /> instances configured with dynamic "Add" or "Remove" state
```

- **Frontend File**: [Home.jsx](file:///c:/Users/mopad/OneDrive/Attachments/Desktop/MERN/MovieVerse/frontend/src/pages/Home.jsx#L13-L47)
- **Backend Files**:
  - [backend/routes/movies.js](file:///c:/Users/mopad/OneDrive/Attachments/Desktop/MERN/MovieVerse/backend/routes/movies.js#L27-L39) (`/popular`)
  - [backend/routes/movies.js](file:///c:/Users/mopad/OneDrive/Attachments/Desktop/MERN/MovieVerse/backend/routes/movies.js#L58-L66) (`/watchlist`)
  - [backend/middleware/authMiddleware.js](file:///c:/Users/mopad/OneDrive/Attachments/Desktop/MERN/MovieVerse/backend/middleware/authMiddleware.js)
- **Concepts**: `Promise.all` concurrent fetching, Bearer token authorization, state synchronization between external API and personal MongoDB records.

---

### Scenario 5: Searching Movies via TMDB

#### Step 1: User Typing & Submission
- **Action**: User types a movie title (e.g. "Inception") into the search input and presses `Enter`.
- **Frontend Code**: `handleSearch(e)` in [Home.jsx](file:///c:/Users/mopad/OneDrive/Attachments/Desktop/MERN/MovieVerse/frontend/src/pages/Home.jsx#L49-L64).
- **Edge Case**: If search box is empty, it gracefully re-fetches popular movies.

#### Step 2: Backend Proxy Query
- **HTTP Request**: `GET http://localhost:5000/api/movies/search?query=Inception`
- **Backend Code**: [backend/routes/movies.js](file:///c:/Users/mopad/OneDrive/Attachments/Desktop/MERN/MovieVerse/backend/routes/movies.js#L10-L24)
- **External Call**: Axios sends `GET https://api.tmdb.org/3/search/movie?api_key=TMDB_API_KEY&query=Inception`.
- **Response**: TMDB search results array returned to client.

#### Step 3: UI Transformation
- `movies` state replaced with search results.
- Header title dynamically switches to: `Scanning context: "Inception"`.
- Movie count updates to reflect search results.

---

### Scenario 6: Viewing Movie Details & Watching the Trailer

#### Step 1: Clicking Movie Poster / Card
- **Action**: User clicks on a poster or "View Details".
- **Frontend Route**: Navigates to `/movie/:id` via `<Link to={'/movie/${movie.id}'}>` in [MovieCard.jsx](file:///c:/Users/mopad/OneDrive/Attachments/Desktop/MERN/MovieVerse/frontend/src/components/MovieCard.jsx#L7).

#### Step 2: Fetching Full Movie Metadata & Videos
- **Frontend File**: [MovieDetail.jsx](file:///c:/Users/mopad/OneDrive/Attachments/Desktop/MERN/MovieVerse/frontend/src/pages/MovieDetail.jsx#L12-L25)
- **Hook**: `useParams()` extracts the movie ID from the route.
- **HTTP Request**: `GET http://localhost:5000/api/movies/details/:id`
- **Backend File**: [backend/routes/movies.js](file:///c:/Users/mopad/OneDrive/Attachments/Desktop/MERN/MovieVerse/backend/routes/movies.js#L42-L55)
- **External TMDB Call**:
  - Appends sub-resources in a single request: `append_to_response: 'credits,videos'`.
  - Retrieves: Overview, release date, backdrop image, runtime, genres, cast credits, and official YouTube trailer keys.

#### Step 3: Rendering Detailed View
- Full backdrop banner with gradient overlay.
- Genre badges, runtime, and average rating.
- Top 5 cast operatives with profile photos and character names.
- **Trailer Component**: [MovieTrailer.jsx](file:///c:/Users/mopad/OneDrive/Attachments/Desktop/MERN/MovieVerse/frontend/src/components/MovieTrailer.jsx#L3-L26) filters videos array for `site === "YouTube"` and `type === "Trailer" || type === "Teaser"`, embedding a responsive YouTube `<iframe>`.

---

### Scenario 7: Adding a Movie to the Watchlist

#### Step 1: User Click
- **Action**: User clicks "Add to Watchlist" on a card in the Home grid.
- **Frontend File**: [Home.jsx](file:///c:/Users/mopad/OneDrive/Attachments/Desktop/MERN/MovieVerse/frontend/src/pages/Home.jsx#L66-L87) invoking `addToWatchlist(movie)`.

#### Step 2: Optimistic Check & Network Request
- Checks if `addedMovieIds.includes(movie.id)`. If present, exits immediately to prevent duplicate requests.
- **HTTP Request**:
  - **Method**: `POST http://localhost:5000/api/movies/watchlist`
  - **Headers**: `Authorization: Bearer <token>`
  - **Body**:
    ```json
    {
      "tmdbId": 550,
      "title": "Fight Club",
      "poster": "https://image.tmdb.org/t/p/w500/...",
      "overview": "...",
      "rating": 8.4,
      "year": "1999"
    }
    ```

#### Step 3: Backend Verification & Insertion
- **Backend File**: [backend/routes/movies.js](file:///c:/Users/mopad/OneDrive/Attachments/Desktop/MERN/MovieVerse/backend/routes/movies.js#L69-L93)
- Middleware verifies JWT, sets `req.user`.
- Checks duplicate in MongoDB: `Movie.findOne({ userId: req.user, tmdbId })`.
- Inserts new document in MongoDB: `new Movie({ userId: req.user, tmdbId, ... }).save()`.
- Responds with `{ message: "Added to watchlist" }`.

#### Step 4: UI State Mutation
- Frontend updates local state: `setAddedMovieIds(prev => [...prev, movie.id])`.
- The button instantly transforms into a red "remove" button.
- Toast displays: `"Added 🎬"`.

---

### Scenario 8: Removing a Movie from the Watchlist (via Home Page)

#### Step 1: User Click
- **Action**: User clicks the red "remove" button on an added movie card.
- **Frontend Code**: `removeFromWatchlist(movie)` in [Home.jsx](file:///c:/Users/mopad/OneDrive/Attachments/Desktop/MERN/MovieVerse/frontend/src/pages/Home.jsx#L89-L100).
- **HTTP Request**:
  - **Method**: `DELETE http://localhost:5000/api/movies/watchlist/:tmdbId`
  - **Headers**: `Authorization: Bearer <token>`

#### Step 2: Backend Deletion
- **Backend File**: [backend/routes/movies.js](file:///c:/Users/mopad/OneDrive/Attachments/Desktop/MERN/MovieVerse/backend/routes/movies.js#L96-L104)
- Executes: `Movie.findOneAndDelete({ userId: req.user, tmdbId: req.params.id })`.

#### Step 3: State Re-render
- Filters ID from state: `setAddedMovieIds(prev => prev.filter(id => id !== movie.id))`.
- Button toggles back to cyan "Add to Watchlist".
- Toast displays: `"Removed 🎬"`.

---

### Scenario 9: Visiting the Watchlist Page ("Personal Vault")

#### Step 1: Navigation
- User clicks "Watchlist" in [Navbar.jsx](file:///c:/Users/mopad/OneDrive/Attachments/Desktop/MERN/MovieVerse/frontend/src/components/Navbar.jsx#L34).
- Navigates to `/watchlist`, protected by `<ProtectedRoute>`.

#### Step 2: Fetching Vault Documents
- **Frontend File**: [Watchlist.jsx](file:///c:/Users/mopad/OneDrive/Attachments/Desktop/MERN/MovieVerse/frontend/src/pages/Watchlist.jsx#L13-L26)
- **HTTP Request**: `GET http://localhost:5000/api/movies/watchlist` with `Authorization: Bearer <token>`.
- **Backend**: `Movie.find({ userId: req.user })` returns all saved movie documents.
- **UI States**:
  - If loading: displays glowing spinner.
  - If empty: renders empty state placeholder ("Your vault is currently empty").
  - If movies exist: renders `<MovieCard />` grid with `actionLabel="Remove from Vault"`.

#### Step 3: Deletion from Vault
- Clicking "Remove from Vault" calls `DELETE /api/movies/watchlist/:tmdbId`.
- On success: `setMovies(movies.filter(m => m.tmdbId !== movie.tmdbId))` removes the card from the screen without a full page reload.

---

### Scenario 10: User Logout Flow

- **Action**: User clicks "Logout" in [Navbar.jsx](file:///c:/Users/mopad/OneDrive/Attachments/Desktop/MERN/MovieVerse/frontend/src/components/Navbar.jsx#L42-L46).
- **Execution**:
  1. Calls `logout()` from `AuthContext`:
     - Clears `user` state to `null`.
     - Removes `localStorage.removeItem('user')`.
     - Removes `localStorage.removeItem('token')`.
  2. Calls `navigate('/')`.
  3. `<ProtectedRoute>` triggers because `user === null`, automatically redirecting to `/login`.
  4. Navbar updates: shows "Login" and "Sign Up" buttons.

---

### Scenario 11: Token Expiry / Unauthorized Access Interceptor

1. A user's JWT expires after 7 days, or the user alters the token in DevTools.
2. The user attempts to add a movie or view the watchlist.
3. Backend [authMiddleware.js](file:///c:/Users/mopad/OneDrive/Attachments/Desktop/MERN/MovieVerse/backend/middleware/authMiddleware.js#L19-L21) throws `TokenExpiredError` or `JsonWebTokenError` and responds with HTTP status `401 Unauthorized`.
4. Axios response interceptor in [AuthContext.jsx](file:///c:/Users/mopad/OneDrive/Attachments/Desktop/MERN/MovieVerse/frontend/src/context/AuthContext.jsx#L20-L28) catches the `401`.
5. Interceptor clears all credentials from `localStorage` and forces `window.location.href = '/login'`, guaranteeing that expired sessions never leave the app in a broken state.

---

### Scenario 12: Invalid URL / 404 Routing

- **Frontend**: Any undefined path (e.g. `/invalid-url`) is captured by `<Route path="*" element={<Navigate to="/" />} />` in [App.jsx](file:///c:/Users/mopad/OneDrive/Attachments/Desktop/MERN/MovieVerse/frontend/src/App.jsx#L40) and seamlessly redirected to `/`.
- **Backend**: Any unmapped API route triggers the Express 404 middleware in [server.js](file:///c:/Users/mopad/OneDrive/Attachments/Desktop/MERN/MovieVerse/backend/server.js#L40-L42) returning `{ "message": "Route not found" }`.

---

## 6. File Inventory & Cross-File Dependency Map

### Backend Directory Structure (`/backend`)
```
backend/
├── server.js                     # Root server initialization & middleware stack
├── .env                          # Configuration & Secret keys (PORT, MONGO_URI, JWT_SECRET, TMDB_API_KEY)
├── package.json                  # Dependencies & start/dev scripts
├── middleware/
│   └── authMiddleware.js         # JWT verification & request user injection
├── models/
│   ├── User.js                   # Mongoose User Schema (name, email, password)
│   └── Movie.js                  # Mongoose Movie Schema (userId, tmdbId, title, poster, etc.)
└── routes/
    ├── auth.js                   # Auth endpoints (/api/auth/register, /api/auth/login)
    └── movies.js                 # TMDB Proxy & Watchlist endpoints (/popular, /search, /details, /watchlist)
```

### Frontend Directory Structure (`/frontend`)
```
frontend/
├── index.html                    # Root HTML5 template
├── vite.config.js                # Vite configuration with React plugin
├── package.json                  # Dependencies & scripts (dev, build, lint)
├── .env                          # Frontend environment (VITE_API_BASE_URL)
└── src/
    ├── main.jsx                  # React DOM root render entry point
    ├── App.jsx                   # Router, ProtectedRoute, layout structure, toaster
    ├── index.css                 # Tailwind CSS directives, theme colors, neo-brutalist utilities
    ├── context/
    │   └── AuthContext.jsx       # Context Provider, user state, Axios interceptor
    ├── components/
    │   ├── Navbar.jsx            # Sticky navigation bar with dynamic auth links
    │   ├── MovieCard.jsx         # Reusable card component for movie posters & action buttons
    │   └── MovieTrailer.jsx      # YouTube trailer embed component
    ├── pages/
    │   ├── Home.jsx              # Popular movies showcase, search bar, add/remove handlers
    │   ├── Login.jsx             # Controlled form for user login
    │   ├── Register.jsx          # Controlled form for new account registration
    │   ├── MovieDetail.jsx       # Detailed backdrop, metadata, cast list, trailer
    │   └── Watchlist.jsx         # User's personal movie vault with remove capability
    └── utils/
        └── toast.js              # Wrapper for react-hot-toast notifications
```

---

## 7. Summary Matrix: User Actions vs Systems Involved

| User Interaction | Primary Frontend File | Supporting Components | API Endpoint | Backend File | Database / External Service |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Visit App** | `App.jsx` | `AuthContext.jsx` | None (Local Check) | None | `localStorage` |
| **Register** | `Register.jsx` | `AuthContext.jsx`, `toast.js` | `POST /api/auth/register` | `auth.js` | MongoDB (`User` model) |
| **Log In** | `Login.jsx` | `AuthContext.jsx`, `toast.js` | `POST /api/auth/login` | `auth.js` | MongoDB (`User` model) |
| **View Popular Movies** | `Home.jsx` | `MovieCard.jsx` | `GET /api/movies/popular` | `movies.js` | TMDB API (`/movie/popular`) |
| **Search Movies** | `Home.jsx` | `MovieCard.jsx` | `GET /api/movies/search` | `movies.js` | TMDB API (`/search/movie`) |
| **View Movie Details** | `MovieDetail.jsx` | `MovieTrailer.jsx` | `GET /api/movies/details/:id` | `movies.js` | TMDB API & YouTube |
| **Add to Watchlist** | `Home.jsx` | `MovieCard.jsx`, `toast.js` | `POST /api/movies/watchlist` | `movies.js`, `authMiddleware.js` | MongoDB (`Movie` model) |
| **Remove from Watchlist (Home)** | `Home.jsx` | `MovieCard.jsx`, `toast.js` | `DELETE /api/movies/watchlist/:id` | `movies.js`, `authMiddleware.js` | MongoDB (`Movie` model) |
| **Inspect Watchlist** | `Watchlist.jsx` | `MovieCard.jsx` | `GET /api/movies/watchlist` | `movies.js`, `authMiddleware.js` | MongoDB (`Movie` model) |
| **Remove from Watchlist (Vault)** | `Watchlist.jsx` | `MovieCard.jsx` | `DELETE /api/movies/watchlist/:id` | `movies.js`, `authMiddleware.js` | MongoDB (`Movie` model) |
| **Log Out** | `Navbar.jsx` | `AuthContext.jsx` | None (Client-side) | None | `localStorage` |
