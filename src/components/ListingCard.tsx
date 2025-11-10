
import React from 'react';
import { MapPin, Clock, Heart } from 'lucide-react';
import { useLocation } from '../contexts/LocationContext';

interface ListingCardProps {
  title: string;
  price: string;
  location: string;
  timePosted: string;
  image: string;
  featured?: boolean;
}

const ListingCard: React.FC<ListingCardProps> = ({ 
  title, 
  price, 
  location, 
  timePosted, 
  image, 
  featured = false 
}) => {
  const { currencySymbol } = useLocation();
  return (
    <div className={`bg-white rounded-lg shadow-sm border ${featured ? 'border-orange-200 ring-1 ring-orange-100' : 'border-gray-200'} hover:shadow-md transition-all duration-200 transform hover:-translate-y-1 group`}>
      {featured && (
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-medium px-2 py-1 rounded-t-lg">
          Featured
        </div>
      )}
      
      <div className="relative overflow-hidden">
        <img 
          src={`https://images.unsplash.com/${image}?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200`}
          alt={title}
          className="w-full h-40 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <button className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-colors">
          <Heart className="h-4 w-4 text-gray-600 hover:text-red-500" />
        </button>
      </div>
      
      <div className="p-3 sm:p-4">
        <h3 className="font-semibold text-sm sm:text-base text-gray-800 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
          {title}
        </h3>
        
        <div className="flex items-center justify-between mb-2">
          <span className="text-xl sm:text-2xl font-bold text-green-600">{currencySymbol}{price}</span>
        </div>
        
        <div className="flex items-center text-gray-500 text-xs sm:text-sm space-x-3 sm:space-x-4">
          <div className="flex items-center space-x-1">
            <MapPin className="h-3 w-3" />
            <span>{location}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>{timePosted}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingCard;
