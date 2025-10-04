
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
    // Major Metros
    'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad',
    
    // Tier 1 Cities
    'Surat', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal', 
    'Visakhapatnam', 'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik', 
    'Faridabad', 'Meerut', 'Rajkot', 'Varanasi', 'Srinagar', 'Aurangabad', 'Dhanbad',
    'Amritsar', 'Allahabad', 'Ranchi', 'Howrah', 'Coimbatore', 'Jabalpur', 'Gwalior',
    'Vijayawada', 'Jodhpur', 'Madurai', 'Raipur', 'Kota', 'Chandigarh', 'Guwahati',
    
    // Tier 2 Cities
    'Hubli', 'Dharwad', 'Mysore', 'Mangalore', 'Belgaum', 'Gulbarga', 'Shimoga', 'Davangere',
    'Bellary', 'Bijapur', 'Tumkur', 'Raichur', 'Tirupati', 'Guntur', 'Nellore', 'Kakinada',
    'Rajahmundry', 'Warangal', 'Khammam', 'Karimnagar', 'Nizamabad', 'Anantapur', 'Kurnool',
    'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Erode', 'Vellore', 'Thoothukudi', 'Thanjavur',
    'Dindigul', 'Kanchipuram', 'Tiruppur', 'Cuddalore', 'Karur', 'Puducherry', 'Kochi',
    'Thiruvananthapuram', 'Kozhikode', 'Kollam', 'Thrissur', 'Palakkad', 'Alappuzha',
    'Malappuram', 'Kannur', 'Kottayam', 'Gurgaon', 'Noida', 'Greater Noida', 'Rohtak',
    'Panipat', 'Karnal', 'Sonipat', 'Hisar', 'Yamunanagar', 'Panchkula', 'Ambala', 'Kurukshetra',
    'Dehradun', 'Haridwar', 'Roorkee', 'Haldwani', 'Rudrapur', 'Rishikesh', 'Jammu', 
    'Udhampur', 'Kathua', 'Anantnag', 'Baramulla', 'Shimla', 'Dharamshala', 'Mandi', 'Solan',
    'Kullu', 'Hamirpur', 'Bilaspur', 'Ratlam', 'Ujjain', 'Dewas', 'Satna', 'Guna', 'Burhanpur',
    'Khandwa', 'Mandsaur', 'Bhind', 'Chhindwara', 'Guna', 'Shivpuri', 'Udaipur', 'Kota',
    'Bikaner', 'Ajmer', 'Alwar', 'Bharatpur', 'Bhilwara', 'Sri Ganganagar', 'Pali', 'Sikar',
    'Tonk', 'Kishangarh', 'Bhiwadi', 'Durgapur', 'Asansol', 'Siliguri', 'Bardhaman', 'Haldia',
    'Burdwan', 'Kharagpur', 'Malda', 'Jalpaiguri', 'Darjeeling', 'Purulia', 'Raiganj',
    'Muzaffarpur', 'Purnia', 'Darbhanga', 'Gaya', 'Bhagalpur', 'Arrah', 'Bihar Sharif',
    'Chapra', 'Sasaram', 'Motihari', 'Begusarai', 'Saharsa', 'Dehri', 'Bettiah', 'Cuttack',
    'Rourkela', 'Berhampur', 'Sambalpur', 'Balasore', 'Bhubaneswar', 'Puri', 'Brahmapur',
    'Jamshedpur', 'Bokaro', 'Giridih', 'Ramgarh', 'Medininagar', 'Hazaribagh', 'Phusro',
    'Jhansi', 'Aligarh', 'Moradabad', 'Saharanpur', 'Gorakhpur', 'Bareilly', 'Firozabad',
    'Jhansi', 'Muzaffarnagar', 'Mathura', 'Rampur', 'Shahjahanpur', 'Farrukhabad', 'Maunath Bhanjan',
    'Hapur', 'Ayodhya', 'Etawah', 'Mirzapur', 'Bulandshahr', 'Sambhal', 'Amroha', 'Hardoi',
    'Fatehpur', 'Raebareli', 'Orai', 'Bahraich', 'Unnao', 'Lakhimpur', 'Sitapur', 'Itarsi',
    'Sagar', 'Rewa', 'Katni', 'Singrauli', 'Morena', 'Vidisha', 'Seoni', 'Balaghat', 'Daman',
    'Silvassa', 'Vapi', 'Anand', 'Bharuch', 'Jamnagar', 'Junagadh', 'Gandhinagar', 'Gandhidham',
    'Bhavnagar', 'Mehsana', 'Morbi', 'Navsari', 'Porbandar', 'Surendranagar', 'Palanpur',
    'Veraval', 'Godhra', 'Bhuj', 'Dahod', 'Botad', 'Amreli'
  ];

  // Filter and sort cities based on input - prioritize matches at the start
  const filteredCities = cityInputValue.trim() 
    ? popularIndianCities
        .filter(city => city.toLowerCase().includes(cityInputValue.toLowerCase()))
        .sort((a, b) => {
          const aLower = a.toLowerCase();
          const bLower = b.toLowerCase();
          const searchLower = cityInputValue.toLowerCase();
          
          // Exact match comes first
          if (aLower === searchLower) return -1;
          if (bLower === searchLower) return 1;
          
          // Starts with search term comes next
          const aStarts = aLower.startsWith(searchLower);
          const bStarts = bLower.startsWith(searchLower);
          if (aStarts && !bStarts) return -1;
          if (!aStarts && bStarts) return 1;
          
          // Alphabetical order for the rest
          return a.localeCompare(b);
        })
        .slice(0, 15) // Show more results
    : [];
  

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
          <div className="hidden md:flex flex-1 max-w-3xl mx-4 space-x-2">
            {/* City Selector */}
            <div className="relative w-32" ref={cityDropdownRef}>
              <form onSubmit={handleCityFormSubmit}>
                <input
                  type="text"
                  value={cityInputValue}
                  onChange={handleCityInputChange}
                  onFocus={() => setShowCityDropdown(cityInputValue.length > 0)}
                  onBlur={() => setTimeout(() => setShowCityDropdown(false), 200)}
                  placeholder="City..."
                  className="w-full pl-9 pr-2 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent bg-background text-sm"
                />
              </form>
              <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              
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
                className="w-full pl-10 pr-4 py-2.5 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent bg-background shadow-sm"
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
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
                  className="flex items-center space-x-1.5 bg-brand text-brand-foreground px-3 py-1.5 rounded text-sm hover:bg-brand-light transition-colors"
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
                    className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-3 rounded-lg"
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
