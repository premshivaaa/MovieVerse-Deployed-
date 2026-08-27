import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MovieCard from '../components/MovieCard';

const Watchlist = () => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWatchlist();
    }, []);

    const fetchWatchlist = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/movies/watchlist`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMovies(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const removeFromWatchlist = async (movie) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/movies/watchlist/${movie.tmdbId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMovies(movies.filter(m => m.tmdbId !== movie.tmdbId));
        } catch (err) {
            console.error('Removal failed', err);
        }
    };

    return (
        <div className="space-y-12 py-12">
            <header className="space-y-2">
                <h1 className="text-3xl font-extrabold tracking-tight text-white">Your Professional Vault</h1>
                <p className="text-brand-muted">A curated repository of your selected cinematic interests.</p>
            </header>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-primary border-t-transparent"></div>
                </div>
            ) : (
                <>
                    {movies.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-32 space-y-4 bg-brand-card/30 border border-dashed border-slate-800 rounded-3xl">
                            <svg className="w-12 h-12 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            <p className="text-slate-500 font-medium">Your vault is currently empty.</p>
                        </div>
                    ) : (
                        <div className="movie-grid">
                            {movies.map(movie => (
                                <MovieCard
                                    key={movie._id}
                                    movie={movie}
                                    onAction={removeFromWatchlist}
                                    actionLabel="Remove from Vault"
                                />
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Watchlist;
