import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Watchlist from './pages/Watchlist';
import MovieDetail from './pages/MovieDetail';
import './index.css';
import { Toaster } from 'react-hot-toast';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-brand-bg">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-primary border-t-transparent"></div>
            </div>
        );
    }
    if (!user) return <Navigate to="/login" />;
    return children;
};

function AppContent() {
    return (
        <div className="min-h-screen flex flex-col bg-brand-bg selection:bg-brand-primary/30">
            <Navbar />
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col justify-center">
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                    <Route path="/watchlist" element={<ProtectedRoute><Watchlist /></ProtectedRoute>} />
                    <Route path="/movie/:id" element={<ProtectedRoute><MovieDetail /></ProtectedRoute>} />


                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </main>
            <footer className="py-8 border-t border-slate-800 text-center text-xs font-bold text-slate-600 uppercase tracking-widest">
                MovieVerse • Created by Premshiva • &copy; {new Date().getFullYear()}
            </footer>
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Toaster position="top-right" reverseOrder={false} toastOptions={{
                    style: {
                        background: '#1e293b', color: '#fff', border: '1px solid #334155'
                    }
                }}
                />
                <AppContent />
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
