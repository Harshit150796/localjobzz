
import React, { useState, useRef, useEffect } from 'react';
import { Search, Plus, Menu, X, LogIn, UserPlus, MapPin } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './auth/AuthModal';
import UserMenu from './UserMenu';

const Header = () => {
  // City selector component for job location search
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [cityInputValue, setCityInputValue] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();
  const cityDropdownRef = useRef<HTMLDivElement>(null);

  const popularIndianCities = [
    'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 
    'Pune', 'Ahmedabad', 'Surat', 'Jaipur', 'Lucknow', 'Kanpur', 
    'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Patna', 
    'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik', 'Faridabad', 
    'Meerut', 'Rajkot', 'Varanasi', 'Srinagar', 'Aurangabad', 'Dhanbad', 
    'Amritsar', 'Allahabad', 'Ranchi', 'Howrah', 'Coimbatore', 'Jabalpur'
  ];

  // Filter cities based on input
  const filteredCities = popularIndianCities.filter(city =>
    city.toLowerCase().includes(cityInputValue.toLowerCase())
  ).slice(0, 8); // Limit to 8 results for better UX
  

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to jobs page with search query
      navigate(`/jobs/all?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleCityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCityInputValue(value);
    setShowCityDropdown(value.length > 0);
  };

  const handleCitySelect = (city: string) => {
    setCityInputValue(city);
    setShowCityDropdown(false);
    // Navigate to city jobs page using existing route structure
    navigate(`/jobs/${encodeURIComponent(city.toLowerCase().replace(/\s+/g, '-'))}`);
  };

  const handleCityFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cityInputValue.trim()) {
      setShowCityDropdown(false);
      navigate(`/jobs/${encodeURIComponent(cityInputValue.trim().toLowerCase().replace(/\s+/g, '-'))}`);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target as Node)) {
        setShowCityDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


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


          {/* Search & City Selector - Desktop */}
          <div className="hidden md:flex flex-1 max-w-3xl mx-4 space-x-3">
            {/* City Selector */}
            <div className="relative min-w-36" ref={cityDropdownRef}>
              <form onSubmit={handleCityFormSubmit}>
                <input
                  type="text"
                  value={cityInputValue}
                  onChange={handleCityInputChange}
                  onFocus={() => setShowCityDropdown(cityInputValue.length > 0)}
                  onBlur={() => setTimeout(() => setShowCityDropdown(false), 200)}
                  placeholder="City..."
                  className="w-full pl-10 pr-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent bg-background text-sm"
                />
              </form>
              <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              
              {/* City Dropdown */}
              {showCityDropdown && filteredCities.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                  <div className="p-1">
                    {filteredCities.map((city) => (
                      <button
                        key={city}
                        onMouseDown={() => handleCitySelect(city)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative flex-1">
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
          <div className="md:hidden py-4 border-t border-border">
            <div className="space-y-4">
              
              {/* Mobile City Selector */}
              <div className="relative">
                <form onSubmit={handleCityFormSubmit}>
                  <input
                    type="text"
                    value={cityInputValue}
                    onChange={handleCityInputChange}
                    onFocus={() => setShowCityDropdown(cityInputValue.length > 0)}
                    onBlur={() => setTimeout(() => setShowCityDropdown(false), 200)}
                    placeholder="City..."
                    className="w-full pl-10 pr-4 py-2 border border-input rounded-lg bg-background text-sm"
                  />
                </form>
                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                
                {showCityDropdown && filteredCities.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 max-h-40 overflow-y-auto">
                    <div className="p-1">
                      {filteredCities.slice(0, 6).map((city) => (
                        <button
                          key={city}
                          onMouseDown={() => {
                            handleCitySelect(city);
                            setIsMenuOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for jobs..."
                  className="w-full pl-10 pr-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent bg-background"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
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
