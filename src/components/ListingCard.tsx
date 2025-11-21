
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
  
  // Premium category-specific image pools (8-10 images per category for maximum variety)
  const categoryImagePools: Record<string, string[]> = {
    'Security & Safety': [
      'photo-1550751827-4bd374c3f58b', // Security guard in uniform
      'photo-1560264280-88b68371db39', // Security at desk with monitors
      'photo-1582139329536-e7284fece509', // Security staff with walkie-talkie
      'photo-1504674900247-0877df9cc836', // Security person on duty outdoors
      'photo-1568602471122-7832951cc4c5', // Security officer professional
      'photo-1586864387634-61ba7f57d4c5', // Security at building entrance
      'photo-1519389950473-47ba0277781c', // Security monitoring equipment
      'photo-1566207474742-de921626ad0c'  // Security patrol
    ],
    'Hospitality & Service': [
      'photo-1414235077428-338989a2e8c0', // Busy restaurant interior
      'photo-1517248135467-4c7edcad34c4', // Waiter serving customers
      'photo-1556910103-1c02745aae4d', // Chef cooking in kitchen
      'photo-1581349485608-9469926a8e5e', // Restaurant service action
      'photo-1559339352-11d035aa65de', // Kitchen prep work
      'photo-1504674900247-0877df9cc836', // Food service professional
      'photo-1559329007-40df8a9345d8', // Restaurant staff at work
      'photo-1590846406792-0adc7f938f1d', // Kitchen cooking scene
      'photo-1544025162-d76694265947', // Restaurant environment
      'photo-1600565193348-f74bd3c7ccdf'  // Hotel/hospitality setting
    ],
    'Repair & Maintenance': [
      'photo-1621905251918-48416bd8575a', // Plumber with tools
      'photo-1621905252507-b35492cc74b4', // Electrical wiring work
      'photo-1589939705384-5185137a7f0f', // Painting walls
      'photo-1416879595882-3373a0480b5b', // AC repair/maintenance
      'photo-1581092160562-40aa08e78837', // Mechanic with tools
      'photo-1504917595217-d4dc5ebe6122', // Maintenance work
      'photo-1513467535987-fd81bc7d62f8', // Repair technician
      'photo-1607400201889-565b1ee75f8e', // HVAC technician
      'photo-1590642916589-592bca10dfbf', // Electrician at work
      'photo-1617401779395-f5c0b232deb6'  // Home repair
    ],
    'Warehouse & Packing': [
      'photo-1553413077-190dd305871c', // Large warehouse interior
      'photo-1586528116311-ad8dd3c8310d', // Worker packing boxes
      'photo-1566207474742-de921626ad0c', // Warehouse operations
      'photo-1590856029826-c7a73142bbf1', // Loading/unloading
      'photo-1586864387634-61ba7f57d4c5', // Warehouse worker with boxes
      'photo-1605902394069-ff2ae2430e62', // Inventory management
      'photo-1589939705384-5185137a7f0f', // Warehouse shelving
      'photo-1578662996442-48f60103fc96', // Logistics worker
      'photo-1605732562742-3023a888e56e', // Package handling
      'photo-1557804506-669a67965ba0'  // Industrial warehouse
    ],
    'Cleaning & Housekeeping': [
      'photo-1628177142898-93e36e4e3a50', // Cleaning supplies and work
      'photo-1581578731548-c64695cc6952', // Professional cleaning
      'photo-1585421514738-01798e348b17', // Home cleaning
      'photo-1563453392212-326f5e854473', // Office cleaning
      'photo-1527515637462-cff94eecc1ac', // Housekeeping work
      'photo-1600880292203-757bb62b4baf', // Cleaning professional
      'photo-1603893089671-64e7f2ec06b4', // Janitor at work
      'photo-1595435742656-5272d0b3a9e8', // Cleaning services
      'photo-1559827260-dc66d52bef19', // Gardening work
      'photo-1558904541-efa843a96f01'  // Garden maintenance
    ],
    'Construction & Labor': [
      'photo-1504307651254-35680f356dfd', // Construction worker with helmet
      'photo-1541888946425-d81bb19240f5', // Building/construction site
      'photo-1581858726788-75bc0f6a952d', // Carpentry work
      'photo-1503387762-592deb58ef4e', // Construction tools
      'photo-1590856029826-c7a73142bbf1', // Labor work in action
      'photo-1513467535987-fd81bc7d62f8', // Construction scene
      'photo-1572981119255-e5ab4097e795', // Welding work
      'photo-1589939705384-5185137a7f0f', // Masonry/bricklaying
      'photo-1597476667648-6e5c18f7b395', // Carpenter with wood
      'photo-1616401776730-d44e3ef2cc3e'  // Construction labor
    ],
    'Sales & Marketing': [
      'photo-1556742111-a301076d9d18', // Retail counter
      'photo-1441986300917-64674bd600d8', // Shop/store interior
      'photo-1556740758-90de374c12ad', // Retail floor
      'photo-1607082349566-187342175e2f', // Sales environment
      'photo-1486406146926-c627a92ad1ab', // Retail store
      'photo-1534452203293-494d7ddbf7e0', // Shop assistant helping customer
      'photo-1542744173-8e7e53415bb0', // Professional retail
      'photo-1555529669-e69e7aa0ba9a', // Store environment
      'photo-1601598851547-4302969d0614', // Sales floor
      'photo-1564078516393-cf04bd966897'  // Retail professional
    ],
    'Office & Admin': [
      'photo-1497366216548-37526070297c', // Modern office desk
      'photo-1531206715517-5c0ba140b2b8', // Office environment
      'photo-1454165804606-c3d57bc86b40', // Person working on laptop
      'photo-1553877522-43269d4ea984', // Office administrative work
      'photo-1486312338219-ce68d2c6f44d', // Professional office
      'photo-1542744173-8e7e53415bb0', // Office space
      'photo-1522071820081-009f0129c71c', // Office team environment
      'photo-1507679799987-c73779587ccf', // Receptionist desk
      'photo-1560264280-88b68371db39', // Office professional
      'photo-1587825140708-dfaf72ae4b04'  // Data entry work
    ],
    'Manufacturing & Production': [
      'photo-1581092160562-40aa08e78837', // Factory floor
      'photo-1581091226825-a6a2a5aee158', // Production line
      'photo-1565688534245-05d6b5be184a', // Manufacturing work
      'photo-1581092918056-0c4c3acd3789', // Factory worker
      'photo-1460925895917-afdab827c52f', // Industrial production
      'photo-1590856029826-c7a73142bbf1', // Manufacturing operations
      'photo-1567789884554-0b844b597180', // Factory assembly
      'photo-1595426274652-a4a67e1b0d9f'  // Industrial worker
    ],
    'Healthcare & Medical': [
      'photo-1576091160399-112ba8d25d1d', // Healthcare professional
      'photo-1631217868264-e5b90bb7e133', // Medical office
      'photo-1582719471384-894fbb16e074', // Healthcare worker
      'photo-1559757175-0eb30cd8c063', // Medical reception
      'photo-1538108149393-fbbd81895907', // Hospital environment
      'photo-1516841273335-e39b37888115', // Medical staff
      'photo-1579684385127-1ef15d508118', // Healthcare setting
      'photo-1530497610245-94d3c16cda28'  // Medical professional
    ],
    'Automobile & Transport': [
      'photo-1486262715619-67b85e0b08d3', // Car mechanic working
      'photo-1487754180451-c456f719a1fc', // Auto repair shop
      'photo-1625047509248-ec889cbff17f', // Bike mechanic
      'photo-1619642751034-765dfdf7c58e', // Mechanic with tools
      'photo-1492144534655-ae79c964c9d7', // Automobile repair
      'photo-1632823469850-1b02d352f98a', // Motorcycle mechanic
      'photo-1590642916589-592bca10dfbf', // Auto technician
      'photo-1606814893907-c2e42943c91f'  // Bike repair work
    ],
    'Delivery & Logistics': [
      'photo-1526367790999-0150786686a2', // Delivery person with package
      'photo-1603123853151-5f5dcd5b821f', // Bike delivery rider
      'photo-1566207474742-de921626ad0c', // Package delivery
      'photo-1601584115197-04ecc0da31d7', // Logistics work
      'photo-1557804506-669a67965ba0', // Delivery boxes
      'photo-1578663899664-27c8682c1710', // Driver/delivery
      'photo-1581858726788-75bc0f6a952d', // Transport work
      'photo-1605902394069-ff2ae2430e62'  // Delivery professional
    ],
    'Other Services': [
      'photo-1521737711867-e3b97375f902', // Professional services
      'photo-1556909114-f6e7ad7d3136', // Service professional
      'photo-1552664730-d307ca884978', // Various services
      'photo-1600880292203-757bb62b4baf', // Service work
      'photo-1507679799987-c73779587ccf', // Professional at work
      'photo-1617401779395-f5c0b232deb6', // Tailor/sewing work
      'photo-1558618666-fcd25c85cd64', // Craftsperson
      'photo-1542838132-92c53300491e'  // Service industry
    ]
  };
  
  // Hash function to consistently pick the same image for the same job
  const getImageForJob = (category: string | undefined, jobId: string): string => {
    const imagePool = category && categoryImagePools[category] 
      ? categoryImagePools[category]
      : categoryImagePools['Other Services'];
    
    let hash = 0;
    for (let i = 0; i < jobId.length; i++) {
      const char = jobId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    const index = Math.abs(hash) % imagePool.length;
    const photoId = imagePool[index];
    
    return `https://images.unsplash.com/${photoId}?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200`;
  };
  
  // Use uploaded images if available, otherwise use category-specific placeholder
  const hasUploadedImages = images && images.length > 0;
  const displayImages = hasUploadedImages 
    ? images 
    : [getImageForJob(category, jobId)];
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
        <img 
          src={currentImage}
          alt={title}
          className="w-full h-32 sm:h-40 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
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
