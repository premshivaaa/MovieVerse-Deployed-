const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

dotenv.config();

const app = express();

// Database Connection with caching for serverless environments
let isConnected = false;

const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) {
        return;
    }
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        isConnected = true;
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('MongoDB connection error:', err);
    }
};

// Middleware
app.use(helmet());
app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);

        const allowedOrigins = [
            process.env.FRONTEND_URL,
            'http://localhost:5173',
            'http://localhost:5000'
        ].filter(Boolean);

        if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
            return callback(null, true);
        }
        return callback(null, true);
    },
    credentials: true
}));
app.use(express.json());

// Ensure Database is connected before executing route queries
app.use(async (req, res, next) => {
    await connectDB();
    next();
});

// Rate Limiting
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Limit each IP to 20 requests per windowMs
    message: 'Too many login/register attempts from this IP, please try again after 15 minutes'
});

// Import Routes
const authRoutes = require('./routes/auth');
const movieRoutes = require('./routes/movies');

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/movies', movieRoutes);

// Health Check / Basic Routes
app.get(['/', '/api'], (req, res) => {
    res.send('MovieVerse API is running...');
});

// 404 handler
app.use((req, res, next) => {
    res.status(404).json({ message: 'Route not found' });
});

// Start server locally or in non-serverless environments
if (!process.env.VERCEL) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
