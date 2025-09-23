
import React, { useState, useEffect } from 'react';
import { MapPin, Search, Plus, Menu, X, Navigation, LogIn, UserPlus } from 'lucide-react';
import { Link, useNavigate, useSearchParams, useLocation as useRouterLocation } from 'react-router-dom';
import { useLocation } from '../contexts/LocationContext';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './auth/AuthModal';
import UserMenu from './UserMenu';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState('City');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [cityInputValue, setCityInputValue] = useState('City');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const routerLocation = useRouterLocation();
  const { country, isDetecting: isDetectingLocation } = useLocation();
  const { user } = useAuth();
  
  const usCities = [
    'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose',
    'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'Charlotte', 'San Francisco', 'Indianapolis', 'Seattle', 'Denver', 'Washington DC',
    'Boston', 'Nashville', 'Baltimore', 'Oklahoma City', 'Louisville', 'Portland', 'Las Vegas', 'Memphis', 'Detroit', 'Milwaukee',
    'Albuquerque', 'Tucson', 'Fresno', 'Sacramento', 'Mesa', 'Kansas City', 'Atlanta', 'Long Beach', 'Colorado Springs', 'Raleigh',
    'Miami', 'Virginia Beach', 'Omaha', 'Oakland', 'Minneapolis', 'Tulsa', 'Arlington', 'Tampa', 'New Orleans', 'Wichita'
  ];

  const indianCities = [
    // Major cities first
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow',
    // Uttar Pradesh
    'Kanpur', 'Ghaziabad', 'Agra', 'Meerut', 'Varanasi', 'Allahabad', 'Bareilly', 'Aligarh', 'Moradabad', 'Mathura',
    // Maharashtra
    'Nagpur', 'Nashik', 'Aurangabad', 'Solapur', 'Amravati', 'Kolhapur', 'Sangli', 'Malegaon',
    // Karnataka
    'Mysore', 'Hubli', 'Mangalore', 'Belgaum', 'Gulbarga', 'Davanagere', 'Bellary', 'Bijapur', 'Shimoga',
    // Gujarat
    'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Gandhinagar', 'Anand', 'Nadiad', 'Morbi',
    // Rajasthan
    'Jodhpur', 'Kota', 'Bikaner', 'Ajmer', 'Udaipur', 'Bhilwara', 'Alwar', 'Bharatpur', 'Sikar',
    // Tamil Nadu
    'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Tirupur', 'Vellore', 'Erode', 'Thoothukudi',
    // Andhra Pradesh & Telangana
    'Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Warangal', 'Nizamabad', 'Khammam', 'Karimnagar', 'Tirupati',
    // West Bengal
    'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Malda', 'Bardhaman', 'Kharagpur', 'Haldia', 'Krishnanagar',
    // Kerala
    'Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam', 'Palakkad', 'Alappuzha', 'Malappuram', 'Kannur', 'Kasaragod',
    // Punjab & Haryana
    'Chandigarh', 'Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Faridabad', 'Gurgaon', 'Panipat', 'Ambala',
    // Madhya Pradesh
    'Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Dewas', 'Satna', 'Ratlam', 'Rewa',
    // Odisha
    'Bhubaneswar', 'Cuttack', 'Rourkela', 'Brahmapur', 'Sambalpur', 'Puri', 'Balasore', 'Bhadrak', 'Baripada', 'Jharsuguda',
    // Other states
    'Patna', 'Gaya', 'Ranchi', 'Jamshedpur', 'Dhanbad', 'Raipur', 'Bhilai', 'Noida', 'Greater Noida', 'Shimla', 'Dehradun'
  ];

  // Get relevant cities based on detected country
  const getRelevantCities = () => {
    if (country === 'United States' || country === 'United States of America') {
      return usCities;
    }
    return indianCities;
  };

  // Sync selectedCity with URL parameter
  useEffect(() => {
    const cityFromUrl = searchParams.get('city');
    if (cityFromUrl) {
      const decodedCity = decodeURIComponent(cityFromUrl);
      setSelectedCity(decodedCity);
      setCityInputValue(decodedCity);
    } else {
      // Reset to "City" if no city in URL
      setSelectedCity('City');
      setCityInputValue('City');
    }
  }, [searchParams, routerLocation.pathname]);

  const relevantCities = getRelevantCities();
  const filteredCities = relevantCities.filter(city =>
    city.toLowerCase().includes(citySearch.toLowerCase())
  ).slice(0, 10);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to category page with search query
      navigate(`/category/all?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    setCityInputValue(city);
    setCitySearch('');
    setShowCityDropdown(false);
    // Navigate to jobs page filtered by city
    navigate(`/category/all?city=${encodeURIComponent(city)}`);
  };

  const handleCityInputFocus = () => {
    setCitySearch(cityInputValue === 'City' ? '' : cityInputValue);
    setShowCityDropdown(true);
  };

  return (
    <header className="bg-white shadow-sm border-b border-orange-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-lg font-bold text-xl">
              L
            </div>
            <span className="text-2xl font-bold text-gray-800">localjobzz</span>
          </Link>

          {/* City Selector - Desktop */}
          <div className="hidden md:flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-2 relative">
            <MapPin className="h-4 w-4 text-orange-500" />
            <div className="relative">
              <input
                type="text"
                value={showCityDropdown ? citySearch : cityInputValue}
                onChange={(e) => setCitySearch(e.target.value)}
                onFocus={handleCityInputFocus}
                onBlur={() => setTimeout(() => setShowCityDropdown(false), 200)}
                placeholder="Select city..."
                className="bg-transparent text-sm font-medium focus:outline-none w-32"
              />
              {showCityDropdown && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50 mt-1">
                  {filteredCities.map((city, index) => (
                    <div
                      key={index}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                      onClick={() => handleCitySelect(city)}
                    >
                      {city}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-6">
            <form onSubmit={handleSearch} className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for jobs..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </form>
          </div>

          {/* Auth/User Section */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <UserMenu />
            ) : (
              <>
                <button
                  onClick={() => {
                    setAuthMode('login');
                    setShowAuthModal(true);
                  }}
                  className="flex items-center space-x-2 text-gray-600 hover:text-orange-500 px-3 py-2 rounded-lg hover:bg-orange-50 transition-colors"
                >
                  <LogIn className="h-4 w-4" />
                  <span className="font-medium">Sign In</span>
                </button>
                
                <button
                  onClick={() => {
                    setAuthMode('register');
                    setShowAuthModal(true);
                  }}
                  className="flex items-center space-x-2 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors"
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
            className="hidden md:flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 transform hover:scale-105"
          >
            <Plus className="h-4 w-4" />
            <span className="font-medium">Post Free Ad</span>
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
              <div className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-2 relative">
                <MapPin className="h-4 w-4 text-orange-500" />
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={showCityDropdown ? citySearch : cityInputValue}
                    onChange={(e) => setCitySearch(e.target.value)}
                    onFocus={handleCityInputFocus}
                    onBlur={() => setTimeout(() => setShowCityDropdown(false), 200)}
                    placeholder="Select city..."
                    className="bg-transparent text-sm font-medium focus:outline-none w-full"
                  />
                  {showCityDropdown && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50 mt-1">
                      {filteredCities.map((city, index) => (
                        <div
                          key={index}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                          onClick={() => handleCitySelect(city)}
                        >
                          {city}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
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
