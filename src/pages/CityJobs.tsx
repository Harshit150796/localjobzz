import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ListingCard from '../components/ListingCard';
import SEOHead from '../components/SEOHead';
import BreadcrumbNavigation from '../components/Breadcrumb';
import { createLocalBusinessSchema, createBreadcrumbSchema, createOrganizationSchema } from '../components/StructuredData';

const CityJobs = () => {
  const { city } = useParams<{ city: string }>();
  const cityName = city?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown City';

  // Mock job data for demonstration
  const jobsData = [
    {
      title: 'House Cleaning - Urgent Need',
      price: '800/day',
      location: `${cityName}`,
      timePosted: '30 min ago',
      image: 'photo-1581578731548-c64695cc6952',
      featured: true
    },
    {
      title: 'Food Delivery Partner',
      price: '600-1000/day', 
      location: `${cityName}`,
      timePosted: '1h ago',
      image: 'photo-1556909114-f6e7ad7d3136'
    },
    {
      title: 'Construction Helper Required',
      price: '700/day',
      location: `${cityName}`,
      timePosted: '1h ago',
      image: 'photo-1504307651254-35680f356dfd',
      featured: true
    },
    {
      title: 'Shop Assistant - Part Time',
      price: '500/day',
      location: `${cityName}`,
      timePosted: '2h ago',
      image: 'photo-1556742049-0cfed4f6a45d'
    },
    {
      title: 'Office Cleaning Staff',
      price: '750/day',
      location: `${cityName}`,
      timePosted: '3h ago',
      image: 'photo-1581578731548-c64695cc6952'
    },
    {
      title: 'Warehouse Worker',
      price: '900/day',
      location: `${cityName}`,
      timePosted: '4h ago',
      image: 'photo-1504307651254-35680f356dfd'
    }
  ];

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
              Find local work opportunities in your area. Over {jobsData.length * 50}+ jobs available today!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold">{jobsData.length * 50}+</div>
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
              Showing {jobsData.length} of {jobsData.length * 10}+ jobs
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {jobsData.map((job, index) => (
              <ListingCard key={index} {...job} />
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-12">
            <button className="bg-brand hover:bg-brand-light text-brand-foreground px-8 py-3 rounded-lg font-semibold transition-colors duration-200">
              Load More Jobs
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default CityJobs;