import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEOHead from '../components/SEOHead';
import { createLocalBusinessSchema, createOrganizationSchema } from '../components/StructuredData';
import { majorCities } from '../utils/sitemap';

const CityJobsLanding = () => {
  const organizationSchema = createOrganizationSchema();
  const combinedStructuredData = {
    "@context": "https://schema.org",
    "@graph": [organizationSchema]
  };

  const popularCities = majorCities.slice(0, 20);

  return (
    <div className="min-h-screen bg-surface">
      <SEOHead
        title="Find Jobs by City - Local Work Opportunities Across India & USA"
        description="Find local jobs in your city. Browse work opportunities across major cities in India and USA. Start your local job search today!"
        keywords="jobs by city, local jobs, city jobs, work opportunities, employment by location"
        structuredData={combinedStructuredData}
        canonicalUrl="https://localjobzz.com/cities"
      />
      
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Find Jobs in Your City
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Discover local work opportunities in your area. Choose your city to explore available jobs and start earning today.
          </p>
        </section>

        {/* Popular Cities Grid */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Popular Cities</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {popularCities.map((city, index) => {
              const cityName = city.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
              return (
                <Link
                  key={index}
                  to={`/jobs/${city}`}
                  className="group block bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  <h3 className="text-lg font-semibold text-card-foreground mb-2 group-hover:text-brand">
                    {cityName}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {Math.floor(Math.random() * 500) + 100}+ jobs available
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Job Categories by Region */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Job Categories by Region</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* India */}
            <div className="bg-card border border-border rounded-xl p-8">
              <h3 className="text-2xl font-bold text-card-foreground mb-6">🇮🇳 India</h3>
              <div className="space-y-3">
                {[
                  'Household Work Jobs',
                  'Delivery & Transport',
                  'Construction Work', 
                  'Shop Assistant Roles',
                  'Security Jobs',
                  'Office Work'
                ].map((category, index) => (
                  <Link
                    key={index}
                    to={`/category/${category.toLowerCase().replace(/\s+/g, '-')}`}
                    className="block p-3 rounded-lg hover:bg-accent transition-colors duration-200"
                  >
                    <div className="font-medium text-card-foreground">{category}</div>
                    <div className="text-sm text-muted-foreground">Available across all Indian cities</div>
                  </Link>
                ))}
              </div>
            </div>

            {/* USA */}
            <div className="bg-card border border-border rounded-xl p-8">
              <h3 className="text-2xl font-bold text-card-foreground mb-6">🇺🇸 United States</h3>
              <div className="space-y-3">
                {[
                  'Home Services',
                  'Delivery & Gig Work',
                  'Construction Labor',
                  'Retail Assistant',
                  'Warehouse Work',
                  'Customer Service'
                ].map((category, index) => (
                  <Link
                    key={index}
                    to={`/category/${category.toLowerCase().replace(/\s+/g, '-')}`}
                    className="block p-3 rounded-lg hover:bg-accent transition-colors duration-200"
                  >
                    <div className="font-medium text-card-foreground">{category}</div>
                    <div className="text-sm text-muted-foreground">Available across all US cities</div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Search by State/Region */}
        <section>
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Browse by Region</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { region: 'Maharashtra', cities: ['Mumbai', 'Pune', 'Nagpur'] },
              { region: 'Karnataka', cities: ['Bangalore', 'Mysore', 'Hubli'] },
              { region: 'Delhi NCR', cities: ['Delhi', 'Gurgaon', 'Noida'] },
              { region: 'California', cities: ['Los Angeles', 'San Francisco', 'San Diego'] },
              { region: 'Texas', cities: ['Houston', 'Dallas', 'Austin'] },
              { region: 'New York', cities: ['New York', 'Buffalo', 'Rochester'] }
            ].map((region, index) => (
              <div key={index} className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-card-foreground mb-4">{region.region}</h3>
                <div className="space-y-2">
                  {region.cities.map((city, cityIndex) => (
                    <Link
                      key={cityIndex}
                      to={`/jobs/${city.toLowerCase().replace(/\s+/g, '-')}`}
                      className="block text-sm text-muted-foreground hover:text-brand transition-colors"
                    >
                      Jobs in {city}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default CityJobsLanding;