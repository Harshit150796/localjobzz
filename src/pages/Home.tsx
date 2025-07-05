
import React from 'react';
import { 
  Car, 
  Home, 
  Briefcase, 
  Smartphone, 
  ShirtIcon as Shirt, 
  Heart, 
  Wrench, 
  GraduationCap,
  TrendingUp,
  Shield,
  Clock,
  Users
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CategoryCard from '../components/CategoryCard';
import ListingCard from '../components/ListingCard';

const HomePage = () => {
  const categories = [
    {
      title: 'Vehicles',
      subtitle: 'Cars, Bikes & More',
      icon: Car,
      count: '25K+ ads',
      href: '/category/vehicles',
      gradient: 'bg-gradient-to-br from-blue-500 to-blue-700'
    },
    {
      title: 'Properties',
      subtitle: 'Buy, Rent & PG',
      icon: Home,
      count: '18K+ ads',
      href: '/category/properties',
      gradient: 'bg-gradient-to-br from-green-500 to-green-700'
    },
    {
      title: 'Jobs',
      subtitle: 'Find Your Dream Job',
      icon: Briefcase,
      count: '12K+ ads',
      href: '/category/jobs',
      gradient: 'bg-gradient-to-br from-purple-500 to-purple-700'
    },
    {
      title: 'Mobiles',
      subtitle: 'Phones & Tablets',
      icon: Smartphone,
      count: '30K+ ads',
      href: '/category/mobiles',
      gradient: 'bg-gradient-to-br from-orange-500 to-red-500'
    },
    {
      title: 'Fashion',
      subtitle: 'Clothes & Accessories',
      icon: Shirt,
      count: '8K+ ads',
      href: '/category/fashion',
      gradient: 'bg-gradient-to-br from-pink-500 to-purple-500'
    },
    {
      title: 'Matrimonial',
      subtitle: 'Find Your Partner',
      icon: Heart,
      count: '5K+ ads',
      href: '/category/matrimonial',
      gradient: 'bg-gradient-to-br from-red-500 to-pink-500'
    },
    {
      title: 'Services',
      subtitle: 'Home & Professional',
      icon: Wrench,
      count: '15K+ ads',
      href: '/category/services',
      gradient: 'bg-gradient-to-br from-indigo-500 to-blue-500'
    },
    {
      title: 'Education',
      subtitle: 'Courses & Tuitions',
      icon: GraduationCap,
      count: '7K+ ads',
      href: '/category/education',
      gradient: 'bg-gradient-to-br from-teal-500 to-green-500'
    }
  ];

  const featuredListings = [
    {
      title: 'iPhone 14 Pro Max - Like New Condition',
      price: '85,000',
      location: 'Bandra, Mumbai',
      timePosted: '2h ago',
      image: 'photo-1592750475338-74b7b21085ab',
      featured: true
    },
    {
      title: '2BHK Fully Furnished Apartment for Rent',
      price: '35,000/month',
      location: 'Koramangala, Bangalore',
      timePosted: '4h ago',
      image: 'photo-1564013799919-ab600027ffc6'
    },
    {
      title: 'Honda City 2020 - Excellent Condition',
      price: '12,50,000',
      location: 'Gurgaon, Delhi',
      timePosted: '1d ago',
      image: 'photo-1552519507-da3b142c6e3d',
      featured: true
    },
    {
      title: 'MacBook Air M2 - 8GB RAM, 256GB SSD',
      price: '95,000',
      location: 'Hitech City, Hyderabad',
      timePosted: '6h ago',
      image: 'photo-1517336714731-489689fd1ca8'
    }
  ];

  const stats = [
    { icon: TrendingUp, label: 'Active Ads', value: '1.2M+' },
    { icon: Users, label: 'Happy Users', value: '50L+' },
    { icon: Shield, label: 'Verified Sellers', value: '25K+' },
    { icon: Clock, label: 'Avg Response', value: '< 2hrs' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            India's Largest
            <span className="block text-yellow-300">Classifieds Platform</span>
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Buy, sell, rent, or find jobs across India. Join millions of Indians making smart deals every day.
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <stat.icon className="h-8 w-8 text-yellow-300 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-white/80 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Browse by Category
            </h2>
            <p className="text-lg text-gray-600">
              Find exactly what you're looking for in your city
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <CategoryCard key={index} {...category} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Featured Listings
            </h2>
            <p className="text-lg text-gray-600">
              Handpicked deals from verified sellers
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredListings.map((listing, index) => (
              <ListingCard key={index} {...listing} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-gray-800 to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Start Selling Today
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of sellers who trust kamtabai to reach millions of buyers across India
          </p>
          <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-200 transform hover:scale-105">
            Post Your First Ad - It's FREE!
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
