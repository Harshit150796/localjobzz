
import React from 'react';
import { MapPin, Clock, Heart, Star, ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLocation } from '../contexts/LocationContext';
import { Badge } from './ui/badge';

interface ListingCardProps {
  jobId: string;
  title: string;
  price: string;
  location: string;
  timePosted: string;
  image?: string;
  featured?: boolean;
  urgent?: boolean;
  peopleViewing?: number;
  category?: string;
  images?: string[];
}

const ListingCard: React.FC<ListingCardProps> = ({ 
  jobId,
  title, 
  price, 
  location, 
  timePosted, 
  image, 
  featured = false,
  urgent = false,
  peopleViewing,
  category,
  images
}) => {
  const { currencySymbol } = useLocation();
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  
  // Only show uploaded images, otherwise show "No Image" placeholder
  const hasUploadedImages = images && images.length > 0;
  const displayImages = hasUploadedImages ? images : [];
  const currentImage = displayImages[currentImageIndex];
  
  return (
    <Link to={`/job/${jobId}`} className="block">
      <div className={`bg-white rounded-lg shadow-sm border ${featured ? 'border-orange-200 ring-2 ring-orange-200' : 'border-gray-200'} hover:shadow-md transition-all duration-200 transform hover:-translate-y-1 group relative overflow-hidden`}>
      {featured && (
        <div className="absolute top-0 right-0 z-10">
          <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-1.5 flex items-center gap-1 shadow-md" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}>
            <Star className="h-3 w-3 fill-white" />
            Featured
          </div>
        </div>
      )}
      {urgent && !featured && (
        <div className="absolute top-2 left-2 z-10">
          <Badge className="bg-red-500 text-white text-xs font-bold px-2 py-1">
            URGENT
          </Badge>
        </div>
      )}
      
      <div className="relative overflow-hidden">
        {hasUploadedImages ? (
          <img 
            src={currentImage}
            alt={title}
            className="w-full h-32 sm:h-40 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-32 sm:h-40 bg-gray-200 flex items-center justify-center">
            <div className="text-center">
              <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-1" />
              <p className="text-xs text-gray-500">No Image</p>
            </div>
          </div>
        )}
        
        {/* Image count badge - only show for uploaded images */}
        {hasUploadedImages && displayImages.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <ImageIcon className="h-3 w-3" />
            {displayImages.length}
          </div>
        )}
        
        {/* Image navigation dots - only show for uploaded images */}
        {hasUploadedImages && displayImages.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {displayImages.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setCurrentImageIndex(index);
                }}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  index === currentImageIndex ? 'bg-white w-3' : 'bg-white/60'
                }`}
              />
            ))}
          </div>
        )}
        
        <button className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full hover:bg-white transition-colors">
          <Heart className="h-3 w-3 text-gray-600 hover:text-red-500" />
        </button>
        
        {/* View Details button on hover */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <button className="bg-white text-gray-900 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-sm">
            View Details
          </button>
        </div>
      </div>
      
      <div className="p-2 sm:p-3">
        <h3 className="font-bold text-sm sm:text-base text-gray-900 mb-1.5 line-clamp-2 group-hover:text-orange-600 transition-colors">
          {title}
        </h3>
        
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-lg sm:text-xl font-bold text-green-600">{currencySymbol}{price}</span>
          {peopleViewing && (
            <span className="text-xs text-orange-600 font-medium flex items-center gap-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
              {peopleViewing} viewing
            </span>
          )}
        </div>
        
        <div className="flex items-center text-gray-500 text-xs space-x-2 sm:space-x-3">
          <div className="flex items-center space-x-1">
            <MapPin className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{location}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-3 w-3 flex-shrink-0" />
            <span>{timePosted}</span>
          </div>
        </div>
      </div>
    </div>
    </Link>
  );
};

export default ListingCard;
