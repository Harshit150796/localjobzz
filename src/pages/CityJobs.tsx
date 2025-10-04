import React, { useState, useMemo } from 'react';
import { Filter, Grid, List, SlidersHorizontal, Clock, MapPin, Phone } from 'lucide-react';
import { useParams, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEOHead from '../components/SEOHead';
import BreadcrumbNavigation from '../components/Breadcrumb';
import { createLocalBusinessSchema, createBreadcrumbSchema, createOrganizationSchema } from '../components/StructuredData';
import { useJobs } from '../contexts/JobContext';

const CityJobs = () => {
  const { city } = useParams<{ city: string }>();
  const isAllJobs = city === 'all';
  const cityName = isAllJobs ? 'All Cities' : (city?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown City');
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [sortBy, setSortBy] = useState('newest');
  const { jobs, isLoading } = useJobs();

  // Convert Supabase jobs to display format and filter by city (or show all if city is 'all')
  const cityJobs = useMemo(() => {
    console.log('Total jobs from context:', jobs.length);
    console.log('City param:', city);
    console.log('City name:', cityName);
    console.log('Is all jobs:', isAllJobs);
    
    const filteredJobs = isAllJobs ? jobs : jobs.filter(job => {
      const jobLocationLower = job.location.toLowerCase();
      const cityNameLower = cityName.toLowerCase();
      
      console.log(`Checking job: ${job.title} in ${job.location} against ${cityName}`);
      
      // Direct match - city name is in job location
      const directMatch = jobLocationLower.includes(cityNameLower);
      console.log(`Direct match result: ${directMatch}`);
      
      return directMatch;
    });
    
    console.log('Filtered jobs count:', filteredJobs.length);
    
    return filteredJobs.map(job => ({
      id: job.id,
      title: job.title,
      salary: job.daily_salary,
      location: job.location,
      timePosted: new Date(job.created_at).toLocaleDateString(),
      jobType: job.job_type,
      description: job.description,
      phone: job.phone,
      requirements: 'As per job requirements',
      timing: 'As per job details',
      featured: job.featured
    }));
  }, [jobs, cityName, isAllJobs]);

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

  // Filter and sort jobs based on search query
  const filteredJobs = cityJobs.filter(job => {
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
    // For "all" jobs, skip city proximity sorting
    if (!isAllJobs) {
      // Sort by proximity to city
      const scoreA = getCityProximityScore(a.location, cityName);
      const scoreB = getCityProximityScore(b.location, cityName);
      
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

  // Structured Data
  const localBusinessSchema = createLocalBusinessSchema(cityName);
  const organizationSchema = createOrganizationSchema();
  const breadcrumbSchema = createBreadcrumbSchema([
    { name: 'Home', url: 'https://localjobzz.com/' },
    { name: 'Jobs', url: 'https://localjobzz.com/jobs/all' },
    { name: isAllJobs ? 'All Jobs' : `Jobs in ${cityName}`, url: `https://localjobzz.com/jobs/${city}` }
  ]);

  const combinedStructuredData = {
    "@context": "https://schema.org",
    "@graph": [organizationSchema, localBusinessSchema, breadcrumbSchema]
  };

  const breadcrumbItems = [
    { name: 'Jobs', url: '/jobs/all' },
    { name: isAllJobs ? 'All Jobs' : `${cityName}` }
  ];

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
      <SEOHead
        title={isAllJobs ? 'All Jobs - Find Local Work Today' : `Jobs in ${cityName} - Find Local Work Today`}
        description={isAllJobs ? 'Find local jobs across all cities. Browse daily work opportunities including household work, delivery, construction, and more. Start earning today!' : `Find local jobs in ${cityName}. Browse daily work opportunities including household work, delivery, construction, and more. Start earning today!`}
        keywords={isAllJobs ? 'jobs, employment, work opportunities, daily jobs, local work, all cities' : `jobs in ${cityName}, ${cityName} employment, ${cityName} work opportunities, daily jobs ${cityName}, local work ${cityName}`}
        city={cityName}
        structuredData={combinedStructuredData}
        canonicalUrl={`https://localjobzz.com/jobs/${city}`}
      />
      
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BreadcrumbNavigation items={breadcrumbItems} />

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {isAllJobs ? 'All Jobs' : `Jobs in ${cityName}`}
          </h1>
          <p className="text-gray-600">
            {searchQuery
              ? `${filteredJobs.length} jobs found for "${searchQuery}"`
              : `${filteredJobs.length} jobs available${isAllJobs ? '' : ` in ${cityName}`}`
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
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                  <p className="mt-4 text-gray-600">Loading jobs...</p>
                </div>
              ) : filteredJobs.length > 0 ? (
                filteredJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No jobs found{isAllJobs ? '' : ` in ${cityName}`}.</p>
                  <p className="gray-400 text-sm mt-2">{isAllJobs ? 'Try adjusting your search or post a job to attract workers.' : 'Try searching in nearby cities or post a job to attract workers.'}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CityJobs;