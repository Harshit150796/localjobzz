import React, { createContext, useContext, useState, useEffect } from 'react';

interface LocationContextType {
  country: string | null;
  currency: string;
  currencySymbol: string;
  isDetecting: boolean;
  detectLocation: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [country, setCountry] = useState<string | null>(null);
  const [currency, setCurrency] = useState('INR');
  const [currencySymbol, setCurrencySymbol] = useState('₹');
  const [isDetecting, setIsDetecting] = useState(false);

  const detectLocation = () => {
    if (navigator.geolocation) {
      setIsDetecting(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          reverseGeocode(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.log('Location access denied or failed:', error);
          setIsDetecting(false);
          // Default to India if location detection fails
          setCountry('India');
          setCurrency('INR');
          setCurrencySymbol('₹');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 600000 // 10 minutes
        }
      );
    }
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );
      const data = await response.json();
      
      if (data && data.address) {
        const detectedCountry = data.address.country;
        setCountry(detectedCountry);
        
        // Set currency based on country
        if (detectedCountry === 'United States' || detectedCountry === 'United States of America') {
          setCurrency('USD');
          setCurrencySymbol('$');
        } else if (detectedCountry === 'India') {
          setCurrency('INR');
          setCurrencySymbol('₹');
        } else {
          // Default to USD for other countries
          setCurrency('USD');
          setCurrencySymbol('$');
        }
      }
    } catch (error) {
      console.log('Geocoding failed:', error);
      // Default to India if geocoding fails
      setCountry('India');
      setCurrency('INR');
      setCurrencySymbol('₹');
    } finally {
      setIsDetecting(false);
    }
  };

  // Auto-detect location on mount
  useEffect(() => {
    detectLocation();
  }, []);

  return (
    <LocationContext.Provider value={{ 
      country, 
      currency, 
      currencySymbol, 
      isDetecting, 
      detectLocation 
    }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};