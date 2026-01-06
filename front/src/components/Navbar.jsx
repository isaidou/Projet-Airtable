import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X, Search, User } from 'lucide-react';

const Navbar = () => {
    const { isAuthenticated, logout, isAdmin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const adminLinks = [
        { label: 'Technologies', path: '/technologies' },
        { label: 'Catégories', path: '/categories' },
        { label: 'Utilisateurs', path: '/students' },
        { label: 'Contacts', path: '/contacts' },
    ];

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
        } else {
            navigate('/');
        }
    };

    return (
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16 gap-4">
                    <div
                        className="text-xl font-bold text-slate-900 cursor-pointer select-none flex-shrink-0"
                        onClick={() => navigate('/')}
                    >
                        Portfolio
                    </div>

                    {isAuthenticated && (
                        <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-8">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Rechercher des projets..."
                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                                />
                                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                            </div>
                        </form>
                    )}

                    <div className="hidden md:flex items-center gap-2 flex-shrink-0">
                        {isAuthenticated && isAdmin && adminLinks.map(link => (
                            <button
                                key={link.path}
                                onClick={() => navigate(link.path)}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                                    ${location.pathname === link.path 
                                        ? 'bg-slate-900 text-white' 
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                    }`}
                            >
                                {link.label}
                            </button>
                        ))}
                        {!isAdmin && (
                            <button
                                onClick={() => navigate('/contact')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                    location.pathname === '/contact'
                                        ? 'bg-slate-900 text-white'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                }`}
                            >
                                Contact
                            </button>
                        )}
                        {isAuthenticated ? (
                            <>
                                <button
                                    onClick={() => navigate('/profile')}
                                    className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                                    title="Profil"
                                >
                                    <User size={20} />
                                </button>
                                <button
                                    onClick={logout}
                                    className="px-4 py-2 rounded-md text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                                >
                                    Déconnexion
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => navigate('/register')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                                        location.pathname === '/register'
                                            ? 'bg-slate-900 text-white hover:bg-slate-800'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                    }`}
                                >
                                    S'inscrire
                                </button>
                                <button
                                    onClick={() => navigate('/login')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                                        location.pathname === '/login'
                                            ? 'bg-slate-900 text-white hover:bg-slate-800'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                    }`}
                                >
                                    Se connecter
                                </button>
                            </>
                        )}
                    </div>

                    <div className="md:hidden">
                        <button 
                            onClick={() => setMenuOpen(!menuOpen)} 
                            className="p-2 text-slate-600 hover:text-slate-900 transition-colors"
                        >
                            {menuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {menuOpen && (
                <div className="md:hidden border-t border-slate-200 bg-white">
                    <div className="px-4 py-4 space-y-2">
                        {isAuthenticated && isAdmin && adminLinks.map(link => (
                            <button
                                key={link.path}
                                onClick={() => { setMenuOpen(false); navigate(link.path); }}
                                className={`block w-full text-left px-4 py-2 rounded-md text-sm font-medium transition-colors
                                    ${location.pathname === link.path 
                                        ? 'bg-slate-900 text-white' 
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                    }`}
                            >
                                {link.label}
                            </button>
                        ))}
                        {!isAdmin && (
                            <button
                                onClick={() => { setMenuOpen(false); navigate('/contact'); }}
                                className={`block w-full text-left px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                    location.pathname === '/contact'
                                        ? 'bg-slate-900 text-white'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                }`}
                            >
                                Contact
                            </button>
                        )}
                        {isAuthenticated ? (
                            <>
                                <button
                                    onClick={() => { setMenuOpen(false); navigate('/profile'); }}
                                    className="block w-full text-left px-4 py-2 rounded-md text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                                >
                                    Profil
                                </button>
                                <button
                                    onClick={() => { setMenuOpen(false); logout(); }}
                                    className="block w-full text-left px-4 py-2 rounded-md text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                                >
                                    Déconnexion
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => { setMenuOpen(false); navigate('/register'); }}
                                    className={`block w-full text-left px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                                        location.pathname === '/register'
                                            ? 'bg-slate-900 text-white hover:bg-slate-800'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                    }`}
                                >
                                    S'inscrire
                                </button>
                                <button
                                    onClick={() => { setMenuOpen(false); navigate('/login'); }}
                                    className={`block w-full text-left px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                                        location.pathname === '/login'
                                            ? 'bg-slate-900 text-white hover:bg-slate-800'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                    }`}
                                >
                                    Se connecter
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
