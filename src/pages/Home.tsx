
import React, { useState, useMemo } from 'react';
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  Users,
  TrendingUp,
  Shield,
  Plus,
  Bot,
  Flame,
  LayoutGrid,
  List
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ListingCard from '../components/ListingCard';
import SEOHead from '../components/SEOHead';
import { createOrganizationSchema, createWebsiteSchema, createJobPostingSchema, createSiteNavigationSchema } from '../components/StructuredData';
import { useJobCategories } from '../hooks/useJobCategories';
import { useJobs } from '../contexts/JobContext';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { timeAgo } from '../utils/timeHelpers';

const HomePage = () => {
  const { categories: jobCategories } = useJobCategories();
  const { jobs, isLoading } = useJobs();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAllJobs, setShowAllJobs] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Sort jobs by created_at (newest first)
  const sortedJobs = useMemo(() => {
    return [...jobs].sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [jobs]);

  // Filter by category
  const filteredJobs = useMemo(() => {
    if (selectedCategory === 'all') {
      return sortedJobs;
    }
    return sortedJobs.filter(job => job.category === selectedCategory);
  }, [sortedJobs, selectedCategory]);

  const displayedJobs = showAllJobs ? filteredJobs : filteredJobs.slice(0, 12);

  const categories = [
    { id: 'all', label: 'All Jobs' },
    { id: 'household', label: 'Household' },
    { id: 'construction', label: 'Construction' },
    { id: 'retail', label: 'Retail' }
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
  const jobPostingsSchema = sortedJobs.slice(0, 4).map(job => createJobPostingSchema({
    title: job.title,
    location: job.location,
    salary: job.daily_salary,
    datePosted: job.created_at,
    employmentType: 'FULL_TIME'
  }));

  const combinedStructuredData = {
    "@context": "https://schema.org",
    "@graph": [organizationSchema, websiteSchema, createSiteNavigationSchema(), ...jobPostingsSchema]
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
      <section className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-white mb-4 sm:mb-6 leading-tight drop-shadow-lg">
            <span className="inline-block relative">
              Find Work Today
              <span className="absolute bottom-0 left-0 w-full h-1 bg-yellow-300 transform -rotate-1"></span>
            </span>
            <span className="block text-yellow-300 mt-1">Get Paid Today</span>
          </h1>
          <p className="text-lg sm:text-xl text-white/90 mb-8 sm:mb-12 max-w-2xl mx-auto">
            The fastest job platform for daily work. Find work in 3 clicks, post jobs in 2 steps.
          </p>
          
          {/* Main Action Tiles */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-8 mb-12 md:mb-16 max-w-5xl mx-auto">
            {/* Look for Job Tile */}
            <Link 
              to="/jobs/all"
              className="group transform hover:scale-105 transition-all duration-300 h-full"
            >
              <div className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 border-4 border-transparent hover:border-yellow-300 h-full flex flex-col">
                <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-full w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 flex items-center justify-center mx-auto mb-2 sm:mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Briefcase className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-white" />
                </div>
                <h3 className="text-base sm:text-xl md:text-2xl font-bold text-gray-800 mb-1 sm:mb-2.5">Look for a Job</h3>
                <p className="text-xs sm:text-base text-gray-600 mb-2 sm:mb-3 flex-grow">Browse 1,200+ jobs. Find work that starts today.</p>
                <div className="bg-blue-50 text-blue-700 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold text-center">
                  3 Easy Steps
                </div>
              </div>
            </Link>

            {/* Post Job Tile */}
            <Link 
              to="/post"
              className="group transform hover:scale-105 transition-all duration-300 h-full"
            >
              <div className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 border-4 border-transparent hover:border-yellow-300 h-full flex flex-col">
                <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-full w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 flex items-center justify-center mx-auto mb-2 sm:mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Plus className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-white" />
                </div>
                <h3 className="text-base sm:text-xl md:text-2xl font-bold text-gray-800 mb-1 sm:mb-2.5">Post a Job</h3>
                <p className="text-xs sm:text-base text-gray-600 mb-2 sm:mb-3 flex-grow">Hire workers today. Get calls within hours.</p>
                <div className="bg-green-50 text-green-700 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold text-center">
                  100% FREE
                </div>
              </div>
            </Link>

            {/* AI Post Job Tile */}
            <div 
              onClick={() => navigate('/ai-assistant')}
              className="col-span-2 md:col-span-1 group transform hover:scale-105 transition-all duration-300 cursor-pointer"
            >
              <div className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 border-4 border-transparent hover:border-yellow-300">
                <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-full w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 flex items-center justify-center mx-auto mb-2 sm:mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Bot className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-white" />
                </div>
                <h3 className="text-base sm:text-xl md:text-2xl font-bold text-gray-800 mb-1 sm:mb-2.5">AI Job Assistant</h3>
                <p className="text-xs sm:text-base text-gray-600 mb-2 sm:mb-3">Chat with AI to post jobs or find work. Simple and fast!</p>
                <div className="bg-purple-50 text-purple-700 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold">
                  Try Now - FREE
                </div>
              </div>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4">
                <stat.icon className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-300 mx-auto mb-2" />
                <div className="text-xl sm:text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-white/80 text-xs sm:text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Job Categories Section */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-3 sm:mb-4 leading-tight">
              Popular Job Categories
            </h2>
            <p className="text-base sm:text-lg text-gray-600">
              Find work that matches your skills
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {jobCategories.map((category, index) => {
              const CategoryIcon = category.icon;
              return (
                <Link key={index} to={`/category/${category.id}`} className="group">
                  <div className={`relative overflow-hidden rounded-xl ${category.gradient} p-4 sm:p-6 transition-all duration-300 transform group-hover:scale-105 group-hover:shadow-lg`}>
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <CategoryIcon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                      <span className="text-white/80 text-xs sm:text-sm font-medium">{category.count}</span>
                    </div>
                    <h3 className="text-white text-lg sm:text-xl font-bold mb-1">{category.title}</h3>
                    <p className="text-white/80 text-xs sm:text-sm">{category.subtitle}</p>
                    
                    {/* Decorative element */}
                    <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-white/10"></div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Today's Jobs */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Live Counter */}
          <div className="flex items-center justify-center gap-2 mb-4 animate-pulse">
            <Flame className="h-5 w-5 text-orange-500" />
            <span className="text-orange-600 font-semibold text-sm">
              18 new jobs posted in last hour
            </span>
          </div>

          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-3 sm:mb-4 leading-tight">
              Jobs Posted Today
            </h2>
            <p className="text-base sm:text-lg text-gray-600">
              Fresh opportunities updated every hour
            </p>
          </div>

          {/* Category Filters and View Toggle */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <div className="flex flex-wrap items-center justify-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedCategory === cat.id
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* View Mode Toggle */}
            <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as 'grid' | 'list')}>
              <ToggleGroupItem value="grid" aria-label="Grid view">
                <LayoutGrid className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="list" aria-label="List view">
                <List className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
              <p className="mt-4 text-gray-600">Loading jobs...</p>
            </div>
          ) : displayedJobs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No jobs found. Be the first to post!</p>
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6" 
              : "space-y-4"
            }>
              {displayedJobs.map((job) => (
                <ListingCard 
                  key={job.id}
                  jobId={job.id}
                  title={job.title}
                  price={job.daily_salary}
                  location={job.location}
                  timePosted={timeAgo(job.created_at)}
                  images={job.images || []}
                  featured={job.featured}
                  urgent={job.urgency === 'urgent' || job.urgency === 'immediate'}
                />
              ))}
            </div>
          )}
          
          <div className="text-center mt-8 space-y-4">
            {!showAllJobs && filteredJobs.length > 12 && (
              <button 
                onClick={() => setShowAllJobs(true)}
                className="bg-gray-100 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-all duration-200 transform hover:scale-105 mr-4"
              >
                Load 12 More Jobs
              </button>
            )}
            <Link 
              to="/jobs/all"
              className="inline-block bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-200 transform hover:scale-105"
            >
              View All Today's Jobs
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 md:py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-3 sm:mb-4 leading-tight">
              How It Works
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-12">
            {/* For Job Seekers */}
            <div className="bg-white rounded-lg p-6 sm:p-8 shadow-sm">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 text-center">Find Work in 3 Steps</h3>
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
            <div className="bg-white rounded-lg p-6 sm:p-8 shadow-sm">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 text-center">Hire in 2 Steps</h3>
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
      <section className="py-12 md:py-16 bg-gradient-to-r from-gray-800 to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6 leading-tight">
            Start Today, Earn Today
          </h2>
          <p className="text-lg sm:text-xl text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto">
            Join thousands of people finding daily work and earning money on localjobzz
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link 
              to="/jobs/all"
              className="bg-white text-gray-800 px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-semibold hover:bg-gray-100 transition-all duration-200 transform hover:scale-105"
            >
              Find Work Now
            </Link>
            <Link 
              to="/post"
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-200 transform hover:scale-105"
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
