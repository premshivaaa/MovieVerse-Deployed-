const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tmdbId: {
        type: Number,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    poster: String,
    overview: String,
    rating: Number,
    year: String
}, { timestamps: true });

module.exports = mongoose.model('Movie', movieSchema);
