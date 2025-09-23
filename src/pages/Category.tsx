import React, { useState, useEffect } from 'react';
import { Filter, Grid, List, SlidersHorizontal, Clock, MapPin, Phone } from 'lucide-react';
import { useParams, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useJobs } from '../contexts/JobContext';

const Category = () => {
  const { categoryName } = useParams();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const cityFilter = searchParams.get('city') || '';
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [sortBy, setSortBy] = useState('newest');
  const { jobs } = useJobs();

  // Mock job listings data - will be combined with real jobs
  const mockJobListings = [
    {
      id: 'mock-mathura-1',
      title: 'Temple Cleaning - Krishna Janmabhoomi',
      salary: '₹500/day',
      location: 'Mathura, Uttar Pradesh',
      timePosted: '2h ago',
      jobType: 'Household Work',
      description: 'Need person to clean temple premises daily. Morning shift work. Devotional environment.',
      phone: '+91 98765 11111',
      requirements: 'Respectful attitude, early morning availability',
      timing: '5 AM - 9 AM',
      featured: false
    },
    {
      id: 'mock-mathura-2',
      title: 'Sweet Shop Helper - Mathura Peda Shop',
      salary: '₹600/day',
      location: 'Holi Gate, Mathura',
      timePosted: '4h ago',
      jobType: 'Retail',
      description: 'Help in famous peda sweet shop. Pack sweets, serve customers. Good for local people.',
      phone: '+91 98765 22222',
      requirements: 'Basic Hindi, sweet shop experience preferred',
      timing: '8 AM - 6 PM',
      featured: true
    },
    {
      id: 'mock-1',
      title: 'House Cleaning - Urgent Today',
      salary: '₹800/day',
      location: 'Bandra West, Mumbai',
      timePosted: '15 min ago',
      jobType: 'Household Work',
      description: 'Need someone to clean 2BHK apartment. Must start today. Work for 4-5 hours.',
      phone: '+91 98765 43210',
      requirements: 'Experience preferred, own cleaning supplies',
      timing: '10 AM - 3 PM',
      featured: true
    },
    {
      id: 2,
      title: 'Food Delivery - Swiggy Partner',
      salary: '₹600-1000/day',
      location: 'Koramangala, Bangalore',
      timePosted: '30 min ago',
      jobType: 'Delivery',
      description: 'Looking for delivery partner with own bike. Flexible hours, good earnings.',
      phone: '+91 87654 32109',
      requirements: 'Own vehicle, smartphone, driving license',
      timing: 'Flexible - 8 hours',
      featured: false
    },
    {
      id: 3,
      title: 'Construction Helper - Building Site',
      salary: '₹700/day',
      location: 'Sector 14, Gurgaon',
      timePosted: '45 min ago',
      jobType: 'Construction',
      description: 'Need 3 helpers for construction work. Daily payment guaranteed.',
      phone: '+91 76543 21098',
      requirements: 'Physical fitness required, no experience needed',
      timing: '8 AM - 5 PM',
      featured: true
    },
    {
      id: 4,
      title: 'Shop Assistant - Grocery Store',
      salary: '₹500/day',
      location: 'Hitech City, Hyderabad',
      timePosted: '1h ago',
      jobType: 'Retail',
      description: 'Part-time help needed in grocery store. Good for students.',
      phone: '+91 65432 10987',
      requirements: 'Basic math, customer handling',
      timing: '2 PM - 8 PM',
      featured: false
    },
    {
      id: 5,
      title: 'Cook for Small Family',
      salary: '₹600/day',
      location: 'Andheri East, Mumbai',
      timePosted: '1h ago',
      jobType: 'Household Work',
      description: 'Cook lunch and dinner for family of 3. Simple home food.',
      phone: '+91 54321 09876',
      requirements: 'Know basic cooking, vegetarian food',
      timing: '11 AM - 2 PM, 6 PM - 8 PM',
      featured: false
    },
    {
      id: 6,
      title: 'Painter Helper - Apartment Painting',
      salary: '₹650/day',
      location: 'Whitefield, Bangalore',
      timePosted: '2h ago',
      jobType: 'Construction',
      description: 'Help main painter in 3BHK apartment painting. 2-3 days work.',
      phone: '+91 43210 98765',
      requirements: 'No experience needed, will teach',
      timing: '9 AM - 6 PM',
      featured: false
    },
    {
      id: 'hyderabad-1',
      title: 'Office Cleaning - IT Park',
      salary: '₹750/day',
      location: 'Madhapur, Hyderabad',
      timePosted: '3h ago',
      jobType: 'Household Work',
      description: 'Clean IT office premises. Night shift work. Good pay.',
      phone: '+91 98765 55555',
      requirements: 'Night shift availability, basic cleaning experience',
      timing: '10 PM - 6 AM',
      featured: true
    },
    {
      id: 'hyderabad-2',
      title: 'Delivery Boy - Food App',
      salary: '₹800/day',
      location: 'Jubilee Hills, Hyderabad',
      timePosted: '1h ago',
      jobType: 'Delivery',
      description: 'Food delivery in Jubilee Hills area. Own bike required.',
      phone: '+91 98765 66666',
      requirements: 'Own vehicle, smartphone, local area knowledge',
      timing: '11 AM - 11 PM',
      featured: false
    }
  ];

  // Combine real jobs with mock jobs  
  const allJobs = [
    ...jobs.map(job => ({
      id: job.id,
      title: job.title,
      salary: `₹${job.daily_salary}/day`,
      location: job.location,
      timePosted: new Date(job.created_at).toLocaleDateString(),
      jobType: job.job_type,
      description: job.description,
      phone: job.phone,
      requirements: 'As discussed',
      timing: 'Flexible',
      featured: job.featured
    })),
    ...mockJobListings
  ];

  // Helper function to calculate city proximity score
  const getCityProximityScore = (jobLocation: string, targetCity: string) => {
    const jobLocationLower = jobLocation.toLowerCase();
    const targetCityLower = targetCity.toLowerCase();
    
    // Exact city match gets highest score
    if (jobLocationLower.includes(targetCityLower)) {
      return 100;
    }
    
    // State/region proximity for Indian cities
    const stateProximity: { [key: string]: string[] } = {
      'uttar pradesh': ['mathura', 'agra', 'lucknow', 'kanpur', 'varanasi', 'allahabad', 'meerut', 'ghaziabad', 'noida'],
      'maharashtra': ['mumbai', 'pune', 'nagpur', 'nashik', 'aurangabad', 'solapur'],
      'karnataka': ['bangalore', 'mysore', 'hubli', 'mangalore', 'belgaum'],
      'tamil nadu': ['chennai', 'coimbatore', 'madurai', 'salem', 'tirunelveli'],
      'delhi ncr': ['delhi', 'gurgaon', 'faridabad', 'ghaziabad', 'noida', 'greater noida'],
      'gujarat': ['ahmedabad', 'surat', 'vadodara', 'rajkot', 'bhavnagar'],
      'rajasthan': ['jaipur', 'jodhpur', 'udaipur', 'kota', 'ajmer', 'bikaner'],
      'telangana': ['hyderabad', 'warangal', 'nizamabad', 'khammam', 'karimnagar'],
      'andhra pradesh': ['visakhapatnam', 'vijayawada', 'guntur', 'nellore', 'kurnool', 'tirupati'],
      'west bengal': ['kolkata', 'howrah', 'durgapur', 'asansol', 'siliguri'],
      'kerala': ['thiruvananthapuram', 'kochi', 'kozhikode', 'thrissur', 'kollam'],
      'punjab': ['chandigarh', 'ludhiana', 'amritsar', 'jalandhar', 'patiala'],
      'haryana': ['faridabad', 'gurgaon', 'panipat', 'ambala'],
      'madhya pradesh': ['bhopal', 'indore', 'jabalpur', 'gwalior', 'ujjain'],
      'odisha': ['bhubaneswar', 'cuttack', 'rourkela', 'brahmapur']
    };
    
    // Find which state/region the target city belongs to
    let targetState = '';
    for (const [state, cities] of Object.entries(stateProximity)) {
      if (cities.some(city => targetCityLower.includes(city))) {
        targetState = state;
        break;
      }
    }
    
    // Check if job location is in same state/region
    if (targetState) {
      const samStateCities = stateProximity[targetState];
      if (samStateCities.some(city => jobLocationLower.includes(city))) {
        return 50; // Same state gets medium priority
      }
    }
    
    return 10; // Other locations get low priority
  };

  // Filter and sort jobs based on search query and city
  const filteredJobs = allJobs.filter(job => {
    // City filter
    if (cityFilter) {
      const jobLocation = job.location.toLowerCase();
      const selectedCity = cityFilter.toLowerCase();
      if (!jobLocation.includes(selectedCity)) {
        return false;
      }
    }

    // Search filter
    if (searchQuery) {
      const searchWords = searchQuery.toLowerCase().split(' ').filter(word => word.length > 2);
      return searchWords.some(word => 
        job.title.toLowerCase().includes(word) ||
        job.description.toLowerCase().includes(word) ||
        job.location.toLowerCase().includes(word) ||
        job.jobType.toLowerCase().includes(word)
      );
    }

    return true;
  }).sort((a, b) => {
    // If city filter is applied, sort by proximity to that city
    if (cityFilter) {
      const scoreA = getCityProximityScore(a.location, cityFilter);
      const scoreB = getCityProximityScore(b.location, cityFilter);
      
      if (scoreA !== scoreB) {
        return scoreB - scoreA; // Higher score first
      }
    }
    
    // Secondary sort by featured status
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    
    // Tertiary sort by time posted (newest first for "Just now", then others)
    if (a.timePosted === 'Just now' && b.timePosted !== 'Just now') return -1;
    if (a.timePosted !== 'Just now' && b.timePosted === 'Just now') return 1;
    
    return 0;
  });

  const filters = {
    jobTypes: ['Household Work', 'Delivery', 'Construction', 'Retail', 'Security', 'Gardening'],
    salaryRanges: [
      { label: 'Under ₹500/day', min: 0, max: 500 },
      { label: '₹500 - ₹700/day', min: 500, max: 700 },
      { label: '₹700 - ₹1000/day', min: 700, max: 1000 },
      { label: 'Above ₹1000/day', min: 1000, max: Infinity }
    ],
    timing: ['Morning Shift', 'Evening Shift', 'Full Day', 'Flexible Hours']
  };

  const JobCard = ({ job }: { job: any }) => (
    <div className={`bg-white rounded-lg shadow-sm border ${job.featured ? 'border-orange-200 ring-1 ring-orange-100' : 'border-gray-200'} hover:shadow-md transition-all duration-200 p-6`}>
      {job.featured && (
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-medium px-2 py-1 rounded mb-4 inline-block">
          Urgent Job
        </div>
      )}
      
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1">
          <h3 className="font-bold text-xl text-gray-800 mb-2">{job.title}</h3>
          <div className="text-2xl font-bold text-green-600 mb-2">{job.salary}</div>
          
          <div className="flex flex-wrap items-center text-gray-600 text-sm space-x-4 mb-3">
            <div className="flex items-center space-x-1">
              <MapPin className="h-4 w-4" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{job.timePosted}</span>
            </div>
          </div>
          
          <div className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded inline-block mb-3">
            {job.jobType}
          </div>
          
          <p className="text-gray-700 mb-3">{job.description}</p>
          
          <div className="space-y-2 text-sm text-gray-600">
            <div><strong>Timing:</strong> {job.timing}</div>
            <div><strong>Requirements:</strong> {job.requirements}</div>
          </div>
        </div>
        
        <div className="mt-4 lg:mt-0 lg:ml-6">
          <a 
            href={`tel:${job.phone}`}
            className="w-full lg:w-auto bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-200 flex items-center justify-center space-x-2 no-underline"
          >
            <Phone className="h-4 w-4" />
            <span>Call Now</span>
          </a>
          <div className="text-center text-sm text-gray-600 mt-2">{job.phone}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {cityFilter 
              ? `Jobs in ${cityFilter}`
              : searchQuery 
                ? `Search Results for "${searchQuery}"`
                : 'Jobs Available Today'
            }
          </h1>
          <p className="text-gray-600">
            {(searchQuery || cityFilter)
              ? `${filteredJobs.length} jobs found` 
              : `${allJobs.length} jobs posted today • Updated every hour`
            }
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-64 bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-fit">
            <div className="flex items-center space-x-2 mb-6">
              <SlidersHorizontal className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
            </div>

            {/* Job Type */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-700 mb-3">Job Type</h3>
              <div className="space-y-2">
                {filters.jobTypes.map((type, index) => (
                  <label key={index} className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" className="rounded text-orange-500 focus:ring-orange-500" />
                    <span className="text-sm text-gray-600">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Salary Range */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-700 mb-3">Daily Salary</h3>
              <div className="space-y-2">
                {filters.salaryRanges.map((range, index) => (
                  <label key={index} className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" className="rounded text-orange-500 focus:ring-orange-500" />
                    <span className="text-sm text-gray-600">{range.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Timing */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-700 mb-3">Work Timing</h3>
              <div className="space-y-2">
                {filters.timing.map((time, index) => (
                  <label key={index} className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" className="rounded text-orange-500 focus:ring-orange-500" />
                    <span className="text-sm text-gray-600">{time}</span>
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
                    <option value="newest">Newest Jobs First</option>
                    <option value="salaryHigh">Highest Salary First</option>
                    <option value="salaryLow">Lowest Salary First</option>
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

            {/* Job Listings */}
            <div className="space-y-6">
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No jobs found matching your search.</p>
                  <p className="text-gray-400 text-sm mt-2">Try adjusting your search terms or filters.</p>
                </div>
              )}
            </div>

            {/* Load More */}
            <div className="mt-8 text-center">
              <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-200">
                Load More Jobs
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Category;
