import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Clapperboard } from 'lucide-react'

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="sticky top-0 z-50 bg-brand-bg border-b-[3px] border-[#0a0a0f] shadow-[0px_4px_0px_#0a0a0f]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">


                        <Link to="/" className="flex items-center gap-2 text-2xl font-black tracking-tight text-white text-comic">
                            <Clapperboard size={25} className='text-brand-primary' />
                            MovieVerse
                        </Link>
                    </div>

                    <div className="flex items-center space-x-6">
                        {user ? (
                            <>
                                <Link to="/" className="text-sm font-medium text-brand-muted hover:text-brand-text transition-colors  border-brand-primary hover:border-b-4 ">
                                    Home
                                </Link>
                                <Link to="/watchlist" className="text-sm font-medium text-brand-muted hover:text-brand-text transition-colors  border-brand-primary hover:border-b-4 ">
                                    Watchlist
                                </Link>
                                <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-slate-800">
                                    <span className="text-sm text-brand-muted">
                                        Hi, <span className="text-brand-text font-semibold">{user.name}</span>
                                    </span>
                                    <button
                                        onClick={handleLogout}
                                        className="text-sm font-semibold text-red-400 hover:text-red-300 transition-colors"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-sm font-medium text-brand-muted hover:text-brand-text transition-colors">
                                    Login
                                </Link>
                                <Link to="/register" className="btn-primary">
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
