import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import MovieTrailer from '../components/MovieTrailer';
import { API_BASE_URL } from '../utils/api';

const MovieDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/movies/details/${id}`);
                setMovie(res.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

    if (loading) return (
        <div className="flex justify-center items-center h-[60vh]">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-primary border-t-transparent"></div>
        </div>
    );

    if (!movie) return (
        <div className="text-center py-20 bg-brand-card rounded-2xl border border-slate-800">
            <p className="text-brand-muted font-medium mb-4">The requested database ID could not be located.</p>
            <button onClick={() => navigate(-1)} className="btn-primary">Return to Console</button>
        </div>
    );

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="relative h-[400px] md:h-[600px] rounded-[2rem] overflow-hidden shadow-2xl border border-slate-800">
                <img
                    src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-brand-bg/60 to-transparent" />

                <div className="absolute inset-0 flex items-end p-8 md:p-16">
                    <div className="flex flex-col md:flex-row gap-8 items-start md:items-end w-full">
                        <img
                            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                            alt={movie.title}
                            className="w-40 md:w-64 rounded-2xl shadow-2xl border-4 border-slate-900 hidden md:block"
                        />
                        <div className="space-y-4 flex-1">
                            <div className="flex flex-wrap gap-2">
                                {movie.genres?.map(g => (
                                    <span key={g.id} className="px-2 py-1 bg-brand-primary/20 text-brand-primary text-[10px] font-bold uppercase tracking-wider rounded-md border border-brand-primary/30">
                                        {g.name}
                                    </span>
                                ))}
                            </div>
                            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-white leading-tight">
                                {movie.title}
                            </h1>
                            <div className="flex items-center space-x-4 text-sm font-semibold text-brand-muted">
                                <span>{movie.release_date.split('-')[0]}</span>
                                <span>•</span>
                                <span>{movie.runtime} min</span>
                                <span>•</span>
                                <span className="flex items-center text-yellow-500">
                                    <svg className="w-4 h-4 mr-1 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                    {movie.vote_average.toFixed(1)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-12 px-4 md:px-0">
                <div className="lg:col-span-2 space-y-8">
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-white tracking-tight border-l-4 border-brand-primary pl-4">The Context</h2>
                        <p className="text-lg text-brand-muted leading-relaxed">
                            {movie.overview}
                        </p>
                    </section>
                    <MovieTrailer videos={movie.videos} />
                </div>


                <div className="space-y-8">
                    <section className="bg-brand-card p-6 rounded-3xl border border-slate-800 space-y-6">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Key Operatives</h3>
                        <div className="space-y-4">
                            {movie.credits?.cast.slice(0, 5).map(person => (
                                <div key={person.id} className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden flex-shrink-0">
                                        {person.profile_path && (
                                            <img src={`https://image.tmdb.org/t/p/w200${person.profile_path}`} alt="" className="w-full h-full object-cover" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white">{person.name}</p>
                                        <p className="text-xs text-brand-muted">{person.character}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

            </div>
        </div>
    );
};

export default MovieDetail;
