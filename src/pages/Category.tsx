
import React, { useState } from 'react';
import { Filter, Grid, List, SlidersHorizontal } from 'lucide-react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ListingCard from '../components/ListingCard';

const Category = () => {
  const { categoryName } = useParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState([0, 100000]);

  // Mock listings data
  const listings = [
    {
      title: 'iPhone 14 Pro Max - Excellent Condition',
      price: '85,000',
      location: 'Bandra, Mumbai',
      timePosted: '2h ago',
      image: 'photo-1592750475338-74b7b21085ab',
      featured: true
    },
    {
      title: 'Samsung Galaxy S23 Ultra',
      price: '75,000',
      location: 'Andheri, Mumbai',
      timePosted: '4h ago',
      image: 'photo-1610945415295-d9bbf067e59c'
    },
    {
      title: 'OnePlus 11 - Like New',
      price: '45,000',
      location: 'Powai, Mumbai',
      timePosted: '6h ago',
      image: 'photo-1511707171634-5f897ff02aa9'
    },
    {
      title: 'iPhone 13 - Good Condition',
      price: '55,000',
      location: 'Worli, Mumbai',
      timePosted: '8h ago',
      image: 'photo-1556656793-08538906a9f8',
      featured: true
    },
    {
      title: 'Google Pixel 7 Pro',
      price: '42,000',
      location: 'Malad, Mumbai',
      timePosted: '1d ago',
      image: 'photo-1598300042247-d088f8ab3a91'
    },
    {
      title: 'Xiaomi 13 Pro - Sealed Pack',
      price: '38,000',
      location: 'Thane, Mumbai',
      timePosted: '1d ago',
      image: 'photo-1567581935884-3349723552ca'
    }
  ];

  const filters = {
    priceRanges: [
      { label: 'Under ₹10,000', min: 0, max: 10000 },
      { label: '₹10,000 - ₹25,000', min: 10000, max: 25000 },
      { label: '₹25,000 - ₹50,000', min: 25000, max: 50000 },
      { label: '₹50,000 - ₹1,00,000', min: 50000, max: 100000 },
      { label: 'Above ₹1,00,000', min: 100000, max: Infinity }
    ],
    brands: ['Apple', 'Samsung', 'OnePlus', 'Google', 'Xiaomi', 'Oppo', 'Vivo'],
    condition: ['New', 'Like New', 'Good', 'Fair']
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 capitalize">
            {categoryName || 'Category'} in Mumbai
          </h1>
          <p className="text-gray-600">{listings.length} ads found</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-64 bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-fit">
            <div className="flex items-center space-x-2 mb-6">
              <SlidersHorizontal className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-700 mb-3">Price Range</h3>
              <div className="space-y-2">
                {filters.priceRanges.map((range, index) => (
                  <label key={index} className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" className="rounded text-orange-500 focus:ring-orange-500" />
                    <span className="text-sm text-gray-600">{range.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Brand */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-700 mb-3">Brand</h3>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {filters.brands.map((brand, index) => (
                  <label key={index} className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" className="rounded text-orange-500 focus:ring-orange-500" />
                    <span className="text-sm text-gray-600">{brand}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Condition */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-700 mb-3">Condition</h3>
              <div className="space-y-2">
                {filters.condition.map((condition, index) => (
                  <label key={index} className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" className="rounded text-orange-500 focus:ring-orange-500" />
                    <span className="text-sm text-gray-600">{condition}</span>
                  </label>
                ))}
              </div>
            </div>

            <button className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 px-4 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all">
              Apply Filters
            </button>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Sort and View Controls */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-4">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="priceLow">Price: Low to High</option>
                    <option value="priceHigh">Price: High to Low</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'}`}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'}`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Listings Grid */}
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
              {listings.map((listing, index) => (
                <ListingCard key={index} {...listing} />
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-8 flex justify-center">
              <div className="flex items-center space-x-2">
                <button className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                  Previous
                </button>
                <button className="px-3 py-2 text-sm bg-orange-500 text-white rounded-lg">1</button>
                <button className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50">2</button>
                <button className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50">3</button>
                <button className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Category;
