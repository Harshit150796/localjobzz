
import React from 'react';
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  Users,
  TrendingUp,
  Shield,
  Plus,
  Bot
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ListingCard from '../components/ListingCard';
import SEOHead from '../components/SEOHead';
import { createOrganizationSchema, createWebsiteSchema, createJobPostingSchema } from '../components/StructuredData';
import { useJobCategories } from '../hooks/useJobCategories';

const HomePage = () => {
  const { categories: jobCategories } = useJobCategories();
  const navigate = useNavigate();

  const todaysJobs = [
    {
      title: 'House Cleaning - Urgent Need',
      price: '800/day',
      location: 'Bandra, Mumbai',
      timePosted: '30 min ago',
      image: 'photo-1581578731548-c64695cc6952',
      featured: true
    },
    {
      title: 'Food Delivery Partner',
      price: '600-1000/day',
      location: 'Koramangala, Bangalore',
      timePosted: '1h ago',
      image: 'photo-1556909114-f6e7ad7d3136'
    },
    {
      title: 'Construction Helper Required',
      price: '700/day',
      location: 'Gurgaon, Delhi',
      timePosted: '1h ago',
      image: 'photo-1504307651254-35680f356dfd',
      featured: true
    },
    {
      title: 'Shop Assistant - Part Time',
      price: '500/day',
      location: 'Hitech City, Hyderabad',
      timePosted: '2h ago',
      image: 'photo-1556742049-0cfed4f6a45d'
    }
  ];

  const stats = [
    { icon: Briefcase, label: 'Jobs Posted Today', value: '1,200+' },
    { icon: Users, label: 'People Got Jobs', value: '800+' },
    { icon: Clock, label: 'Avg Job Fill Time', value: '< 4hrs' },
    { icon: Shield, label: 'Verified Employers', value: '2K+' }
  ];

  // Structured Data for Homepage
  const organizationSchema = createOrganizationSchema();
  const websiteSchema = createWebsiteSchema();
  
  // Job postings structured data
  const jobPostingsSchema = todaysJobs.map(job => createJobPostingSchema({
    title: job.title,
    location: job.location,
    salary: job.price,
    datePosted: new Date().toISOString(),
    employmentType: 'FULL_TIME'
  }));

  const combinedStructuredData = {
    "@context": "https://schema.org",
    "@graph": [organizationSchema, websiteSchema, ...jobPostingsSchema]
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead
        title="localjobzz - Find Daily Work & Hire Workers Instantly"
        description="Find daily work opportunities or hire workers instantly. Join thousands of people making smart employment decisions on localjobzz.com - the fastest job platform."
        keywords="local jobs, daily work, hire workers, job platform, employment, part time jobs, full time jobs, gig work, household work, delivery jobs, construction work"
        structuredData={combinedStructuredData}
        canonicalUrl="https://localjobzz.com/"
      />
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Find Work Today
            <span className="block text-yellow-300">Get Paid Today</span>
          </h1>
          <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto">
            The fastest job platform for daily work. Find work in 3 clicks, post jobs in 2 steps.
          </p>
          
          {/* Main Action Tiles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 max-w-5xl mx-auto">
            {/* Look for Job Tile */}
            <Link 
              to="/jobs/all"
              className="group transform hover:scale-105 transition-all duration-300"
            >
              <div className="bg-white rounded-2xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 border-4 border-transparent hover:border-yellow-300">
                <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Briefcase className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Look for a Job</h3>
                <p className="text-gray-600 mb-4">Browse 1,200+ jobs posted today. Find work that starts immediately.</p>
                <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-semibold">
                  3 Easy Steps
                </div>
              </div>
            </Link>

            {/* Post Job Tile */}
            <Link 
              to="/post"
              className="group transform hover:scale-105 transition-all duration-300"
            >
              <div className="bg-white rounded-2xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 border-4 border-transparent hover:border-yellow-300">
                <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Plus className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Post a Job</h3>
                <p className="text-gray-600 mb-4">Hire workers today. Get applications within hours.</p>
                <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg text-sm font-semibold">
                  100% FREE
                </div>
              </div>
            </Link>

            {/* AI Post Job Tile */}
            <div 
              onClick={() => navigate('/ai-assistant')}
              className="group transform hover:scale-105 transition-all duration-300 cursor-pointer"
            >
              <div className="bg-white rounded-2xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 border-4 border-transparent hover:border-yellow-300">
                <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Bot className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">AI Job Assistant</h3>
                <p className="text-gray-600 mb-4">Chat with AI to post jobs or find work. Simple and fast!</p>
                <div className="bg-purple-50 text-purple-700 px-4 py-2 rounded-lg text-sm font-semibold">
                  Try Now - FREE
                </div>
              </div>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
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

      {/* Job Categories Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Popular Job Categories
            </h2>
            <p className="text-lg text-gray-600">
              Find work that matches your skills
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {jobCategories.map((category, index) => (
              <Link key={index} to={`/category/${category.id}`} className="group">
                <div className={`relative overflow-hidden rounded-xl ${category.gradient} p-6 transition-all duration-300 transform group-hover:scale-105 group-hover:shadow-lg`}>
                  <div className="flex items-center justify-between mb-4">
                    <Briefcase className="h-8 w-8 text-white" />
                    <span className="text-white/80 text-sm font-medium">{category.count}</span>
                  </div>
                  <h3 className="text-white text-xl font-bold mb-1">{category.title}</h3>
                  <p className="text-white/80 text-sm">{category.subtitle}</p>
                  
                  {/* Decorative element */}
                  <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-white/10"></div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Today's Jobs */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Jobs Posted Today
            </h2>
            <p className="text-lg text-gray-600">
              Fresh opportunities updated every hour
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {todaysJobs.map((job, index) => (
              <ListingCard key={index} {...job} />
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Link 
              to="/jobs/all"
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-200 transform hover:scale-105"
            >
              View All Today's Jobs
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              How It Works
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* For Job Seekers */}
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Find Work in 3 Steps</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">1</div>
                  <div>
                    <h4 className="font-semibold">Browse Jobs</h4>
                    <p className="text-gray-600 text-sm">See all jobs posted today in your area</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">2</div>
                  <div>
                    <h4 className="font-semibold">Contact Employer</h4>
                    <p className="text-gray-600 text-sm">Call directly or send message</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">3</div>
                  <div>
                    <h4 className="font-semibold">Start Working</h4>
                    <p className="text-gray-600 text-sm">Get hired and earn money today</p>
                  </div>
                </div>
              </div>
            </div>

            {/* For Employers */}
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Hire in 2 Steps</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">1</div>
                  <div>
                    <h4 className="font-semibold">Post Your Job</h4>
                    <p className="text-gray-600 text-sm">Write what work you need done and when</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">2</div>
                  <div>
                    <h4 className="font-semibold">Choose Worker</h4>
                    <p className="text-gray-600 text-sm">Pick from people who contact you</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-gray-800 to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Start Today, Earn Today
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of people finding daily work and earning money on localjobzz
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/jobs/all"
              className="bg-white text-gray-800 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all duration-200 transform hover:scale-105"
            >
              Find Work Now
            </Link>
            <Link 
              to="/post"
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-200 transform hover:scale-105"
            >
              Post a Job - FREE!
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
