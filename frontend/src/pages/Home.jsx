import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MovieCard from '../components/MovieCard';
import {toastSuccess} from "../utils/toast"

const Home = () => {
    const [movies, setMovies] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [addedMovieIds, setAddedMovieIds] = useState([]);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        await Promise.all([fetchPopularMovies(), fetchWatchlistIds()]);
    };

    const fetchWatchlistIds = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/movies/watchlist`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const ids = res.data.map(m => m.tmdbId);
            setAddedMovieIds(ids);
        } catch (err) {
            console.error('Failed to fetch watchlist IDs:', err);
        }
    };

    const fetchPopularMovies = async () => {
        try {
            setLoading(true);
            setError('');
            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/movies/popular`);
            setMovies(res.data.results || []);
            setLoading(false);
        } catch (err) {
            console.error('Fetch error:', err);
            setError('Unable to reach the movie server. Please check your connection.');
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) {
            fetchPopularMovies();
            return;
        }
        try {
            setLoading(true);
            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/movies/search?query=${searchQuery}`);
            setMovies(res.data.results);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const addToWatchlist = async (movie) => {
        if (addedMovieIds.includes(movie.id)) return;

        try {
            const token = localStorage.getItem('token');
            await axios.post(`${import.meta.env.VITE_API_BASE_URL}/movies/watchlist`, {
                tmdbId: movie.id,
                title: movie.title,
                poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
                overview: movie.overview,
                rating: movie.vote_average,
                year: movie.release_date ? movie.release_date.split('-')[0] : 'N/A'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAddedMovieIds(prev => [...prev, movie.id]);
            toastSuccess('Added 🎬')

        } catch (err) {
            console.error('Add failed', err);
        }
    };

    const removeFromWatchlist = async (movie) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/movies/watchlist/${movie.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAddedMovieIds(prev => prev.filter(id => id !== movie.id));
              toastSuccess('Removed 🎬');
        } catch (err) {
            console.error('Removal failed', err);
        }
    };


    return (
        <div className="space-y-12">
            <header className="max-w-3xl mx-auto text-center space-y-6 pt-12">
                <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white text-comic">
                    Cinema Without <span className="text-brand-secondary">Boundaries</span>
                </h1>
                <p className="text-lg text-brand-muted max-w-xl mx-auto">
                    Curated collections of the world's most exceptional storytelling, delivered directly to your vault.
                </p>

                <form onSubmit={handleSearch} className="relative max-w-md mx-auto">
                    <input
                        type="text"
                        placeholder="Search for titles..."
                        className="input-field pl-12"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <button type="submit" className="hidden">Search</button>
                </form>
            </header>

            <section className="space-y-8">
                <div className="flex items-baseline justify-between border-b-[3px] border-[#0a0a0f] pb-4">
                    <h2 className="text-2xl font-black text-white tracking-tight text-comic">
                        {searchQuery ? `Scanning context: "${searchQuery}"` : "Global Curations"}
                    </h2>
                    <span className="text-xs font-bold text-brand-muted uppercase tracking-widest">{movies.length} Results</span>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-400 text-sm text-center">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-primary border-t-transparent"></div>
                    </div>
                ) : (
                    <div className="movie-grid">
                        {movies.map(movie => (
                            <MovieCard
                                key={movie.id}
                                movie={movie}
                                onAction={addedMovieIds.includes(movie.id) ? removeFromWatchlist : addToWatchlist}
                                actionLabel={addedMovieIds.includes(movie.id) ? true : false}
                            />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default Home;
