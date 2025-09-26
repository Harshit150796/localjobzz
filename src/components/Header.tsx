
import React, { useState } from 'react';
import { Search, Plus, Menu, X, LogIn, UserPlus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './auth/AuthModal';
import UserMenu from './UserMenu';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const navigate = useNavigate();
  const { user } = useAuth();
  

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to category page with search query
      navigate(`/category/all?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };


  return (
    <header className="bg-background shadow-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-brand text-brand-foreground px-2.5 py-1 rounded-lg font-bold text-lg">
              L
            </div>
            <span className="text-xl font-bold text-foreground">localjobzz</span>
          </Link>


          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-lg mx-4">
            <form onSubmit={handleSearch} className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for jobs..."
                className="w-full pl-10 pr-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent bg-background"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </form>
          </div>

          {/* Auth/User Section */}
          <div className="hidden md:flex items-center space-x-2">
            {user ? (
              <UserMenu />
            ) : (
              <>
                <button
                  onClick={() => {
                    setAuthMode('login');
                    setShowAuthModal(true);
                  }}
                  className="flex items-center space-x-1.5 text-muted-foreground hover:text-brand px-2 py-1.5 rounded hover:bg-surface transition-colors text-sm"
                >
                  <LogIn className="h-4 w-4" />
                  <span className="font-medium">Sign In</span>
                </button>
                
                <button
                  onClick={() => {
                    setAuthMode('register');
                    setShowAuthModal(true);
                  }}
                  className="flex items-center space-x-1.5 bg-primary text-primary-foreground px-3 py-1.5 rounded text-sm hover:bg-primary/90 transition-colors"
                >
                  <UserPlus className="h-4 w-4" />
                  <span className="font-medium">Sign Up</span>
                </button>
              </>
            )}
          </div>

          {/* Post Ad Button */}
          <Link 
            to="/post"
            className="hidden md:flex items-center space-x-1.5 bg-brand text-brand-foreground px-3 py-1.5 rounded text-sm hover:bg-brand-light transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span className="font-medium">Post Ad</span>
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="space-y-4">
              
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for jobs..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </form>
              
              {/* Mobile Auth Buttons */}
              {user ? (
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-3">Welcome back, {user.name}!</p>
                  <div className="flex space-x-2">
                    <Link 
                      to="/profile"
                      className="flex-1 bg-gray-800 text-white px-4 py-3 rounded-lg text-center"
                    >
                      My Profile
                    </Link>
                    <Link 
                      to="/messages"
                      className="flex-1 bg-orange-500 text-white px-4 py-3 rounded-lg text-center"
                    >
                      Messages
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setAuthMode('login');
                      setShowAuthModal(true);
                      setIsMenuOpen(false);
                    }}
                    className="flex-1 flex items-center justify-center space-x-2 border border-gray-300 text-gray-700 px-4 py-3 rounded-lg"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>Sign In</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      setAuthMode('register');
                      setShowAuthModal(true);
                      setIsMenuOpen(false);
                    }}
                    className="flex-1 flex items-center justify-center space-x-2 bg-gray-800 text-white px-4 py-3 rounded-lg"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Sign Up</span>
                  </button>
                </div>
              )}
              
              <Link 
                to="/post"
                className="flex items-center justify-center space-x-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-3 rounded-lg w-full"
              >
                <Plus className="h-4 w-4" />
                <span className="font-medium">Post Free Ad</span>
              </Link>
            </div>
          </div>
        )}
      </div>
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        initialMode={authMode}
      />
    </header>
  );
};

export default Header;
