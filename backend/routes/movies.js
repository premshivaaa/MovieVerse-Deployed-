const express = require('express');
const router = express.Router();
const axios = require('axios');
const Movie = require('../models/Movie');
const auth = require('../middleware/authMiddleware');

const TMDB_BASE_URL = 'https://api.tmdb.org/3';

// Search Movies (TMDB)
router.get('/search', async (req, res) => {
    try {
        const { query } = req.query;
        const response = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
            params: {
                api_key: process.env.TMDB_API_KEY,
                query: query
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Trending/Popular Movies (TMDB)
router.get('/popular', async (req, res) => {
    try {
        const response = await axios.get(`${TMDB_BASE_URL}/movie/popular`, {
            params: {
                api_key: process.env.TMDB_API_KEY
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Popular movies error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get Movie Details (TMDB)
router.get('/details/:id', async (req, res) => {
    try {
        const response = await axios.get(`${TMDB_BASE_URL}/movie/${req.params.id}`, {
            params: {
                api_key: process.env.TMDB_API_KEY,
                append_to_response: 'credits,videos'
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Movie details error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Watchlist - Get All
router.get('/watchlist', auth, async (req, res) => {
    try {
        const movies = await Movie.find({ userId: req.user });
        res.json(movies);
    } catch (error) {
        console.error('Get watchlist error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Watchlist - Add
router.post('/watchlist', auth, async (req, res) => {
    try {
        const { tmdbId, title, poster, overview, rating, year } = req.body;

        if (!tmdbId || !title) {
            return res.status(400).json({ message: 'tmdbId and title are required' });
        }

        const existing = await Movie.findOne({ userId: req.user, tmdbId });
        if (existing) {
            return res.status(400).json({ message: 'Movie already in watchlist' });
        }

        const newMovie = new Movie({
            userId: req.user,
            tmdbId, title, poster, overview, rating, year
        });

        await newMovie.save();
        res.json({ message: 'Added to watchlist' });
    } catch (error) {
        console.error('Add to watchlist error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Watchlist - Remove
router.delete('/watchlist/:id', auth, async (req, res) => {
    try {
        await Movie.findOneAndDelete({ userId: req.user, tmdbId: req.params.id });
        res.json({ message: 'Removed from watchlist' });
    } catch (error) {
        console.error('Remove from watchlist error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
