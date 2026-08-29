import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { toastSuccess } from '../utils/toast';
import { API_BASE_URL } from '../utils/api';

const Register = () => {
    const [name, setName] = useState('');   
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${API_BASE_URL}/auth/register`, { name, email, password });
            login(res.data.user, res.data.token);
            navigate('/');
            toastSuccess(`Welcome ${res.data.user.name}`)
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please review your input.');
        }
    };

    return (
        <div className="w-full flex items-center justify-center p-6">
            <div className="w-full max-w-md space-y-8 p-8 md:p-12 card-brutal">
                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-black tracking-tight text-white text-comic">Join the Collective</h2>
                    <p className="text-brand-muted text-sm">Initialize your professional movie vault</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-red-400 text-xs text-center font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Full Identity</label>
                            <input
                                type="text"
                                placeholder="Your Name"
                                className="input-field"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
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
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Secure Key</label>
                            <input
                                type="password"
                                placeholder="Min. 8 characters"
                                className="input-field"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="w-full btn-primary">
                        Create Account
                    </button>
                </form>

                <p className="text-center text-sm text-brand-muted">
                    Already an operative? <Link to="/login" className="text-brand-primary font-bold hover:underline">Verify Identity</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
