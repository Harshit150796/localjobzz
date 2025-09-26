import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ListingCard from '../components/ListingCard';
import SEOHead from '../components/SEOHead';
import BreadcrumbNavigation from '../components/Breadcrumb';
import { createLocalBusinessSchema, createBreadcrumbSchema, createOrganizationSchema } from '../components/StructuredData';
import { useJobs } from '../contexts/JobContext';
import { Plus } from 'lucide-react';

const CityJobs = () => {
  const { city } = useParams<{ city: string }>();
  const cityName = city?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown City';
  const { jobs, isLoading } = useJobs();

  // Filter jobs by the selected city with improved matching
  const cityJobs = useMemo(() => {
    const cityKeywords = cityName.toLowerCase().split(' ');
    return jobs.filter(job => {
      const jobLocation = job.location.toLowerCase();
      // Check if any part of the city name matches the job location
      return cityKeywords.some(keyword => 
        jobLocation.includes(keyword) || 
        keyword.includes(jobLocation.split(',')[0].trim())
      );
    });
  }, [jobs, cityName]);

  // Structured Data
  const localBusinessSchema = createLocalBusinessSchema(cityName);
  const organizationSchema = createOrganizationSchema();
  const breadcrumbSchema = createBreadcrumbSchema([
    { name: 'Home', url: 'https://localjobzz.com/' },
    { name: 'Jobs', url: 'https://localjobzz.com/category/all' },
    { name: `Jobs in ${cityName}`, url: `https://localjobzz.com/jobs/${city}` }
  ]);

  const combinedStructuredData = {
    "@context": "https://schema.org",
    "@graph": [organizationSchema, localBusinessSchema, breadcrumbSchema]
  };

  const breadcrumbItems = [
    { name: 'Jobs', url: '/category/all' },
    { name: `${cityName}` }
  ];

  return (
    <div className="min-h-screen bg-surface">
      <SEOHead
        title={`Jobs in ${cityName} - Find Local Work Today`}
        description={`Find local jobs in ${cityName}. Browse hundreds of daily work opportunities including household work, delivery, construction, and more. Start earning today!`}
        keywords={`jobs in ${cityName}, ${cityName} employment, ${cityName} work opportunities, daily jobs ${cityName}, local work ${cityName}`}
        city={cityName}
        structuredData={combinedStructuredData}
        canonicalUrl={`https://localjobzz.com/jobs/${city}`}
      />
      
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BreadcrumbNavigation items={breadcrumbItems} />

        {/* Hero Section */}
        <section className="mb-12">
          <div className="bg-gradient-to-r from-brand to-brand-secondary rounded-2xl p-8 text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Jobs in {cityName}
            </h1>
            <p className="text-xl mb-6 opacity-90">
              Find local work opportunities in your area. {cityJobs.length > 0 ? `${cityJobs.length} jobs available today!` : 'Be the first to post a job in this city!'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold">{cityJobs.length}</div>
                <div className="text-sm opacity-80">Active Jobs</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold">₹500-₹1000</div>
                <div className="text-sm opacity-80">Daily Earnings</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold">&lt; 2hrs</div>
                <div className="text-sm opacity-80">Avg Response Time</div>
              </div>
            </div>
          </div>
        </section>

        {/* Job Categories for this city */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-8">Popular Job Categories in {cityName}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Household Work', count: '150+ jobs', link: `/jobs/${city}/household-work` },
              { name: 'Delivery & Transport', count: '120+ jobs', link: `/jobs/${city}/delivery-transport` },
              { name: 'Construction', count: '80+ jobs', link: `/jobs/${city}/construction` },
              { name: 'Shop Assistant', count: '60+ jobs', link: `/jobs/${city}/shop-assistant` }
            ].map((category, index) => (
              <a 
                key={index} 
                href={category.link}
                className="block bg-card rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 border border-border"
              >
                <h3 className="text-lg font-semibold text-card-foreground mb-2">{category.name}</h3>
                <p className="text-muted-foreground text-sm">{category.count}</p>
              </a>
            ))}
          </div>
        </section>

        {/* Available Jobs */}
        <section>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-foreground">Available Jobs</h2>
            <div className="text-muted-foreground">
              {cityJobs.length > 0 ? `Showing ${cityJobs.length} jobs` : 'No jobs found'}
            </div>
          </div>
          
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
              <p className="mt-4 text-muted-foreground">Loading jobs...</p>
            </div>
          ) : cityJobs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {cityJobs.map((job) => (
                <ListingCard 
                  key={job.id} 
                  title={job.title}
                  price={job.daily_salary}
                  location={job.location}
                  timePosted={new Date(job.created_at).toLocaleDateString()}
                  featured={job.featured}
                  image="photo-1556740749-887f6717d7e4"
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="mb-6">
                  <div className="w-24 h-24 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                    <Plus className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-2xl font-semibold text-foreground mb-3">No Jobs Available Currently</h3>
                  <p className="text-muted-foreground mb-8">
                    Be the first to post a job in {cityName}! Help local workers find opportunities in your area.
                  </p>
                </div>
                <Link 
                  to="/post" 
                  className="inline-flex items-center space-x-2 bg-brand hover:bg-brand-light text-brand-foreground px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
                >
                  <Plus className="h-5 w-5" />
                  <span>Post a Job</span>
                </Link>
              </div>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default CityJobs;