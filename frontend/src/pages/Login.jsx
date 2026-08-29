import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import {toastSuccess} from '../utils/toast';
import { API_BASE_URL } from '../utils/api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
            login(res.data.user, res.data.token);
            navigate('/');
            toastSuccess(`Welcome Back, ${res.data.user.name} `)
        } catch (err) {
            setError(err.response?.data?.message || 'Authentication failed. Please verify credentials.');
        }
    };

    return (
       <div className="w-full flex items-center justify-center p-6">
            <div className="w-full max-w-md space-y-8 p-8 md:p-12 card-brutal">
                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-black tracking-tight text-white text-comic">Welcome Back</h2>
                    <p className="text-brand-muted text-sm">Access your cinematic vault</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-red-400 text-xs text-center font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Account ID</label>
                            <input
                                type="email"
                                placeholder="name@domain.com"
                                className="input-field"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Key Phrase</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="input-field"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="w-full btn-primary">
                        Login
                    </button>
                </form>

                <p className="text-center text-sm text-brand-muted">
                    New operative? <Link to="/register" className="text-brand-primary font-bold hover:underline">Create credentials</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
