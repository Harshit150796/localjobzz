import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ListingCard from '../components/ListingCard';
import SEOHead from '../components/SEOHead';
import BreadcrumbNavigation from '../components/Breadcrumb';
import { createJobPostingSchema, createLocalBusinessSchema, createBreadcrumbSchema, createOrganizationSchema } from '../components/StructuredData';

const CategoryCityJobs = () => {
  const { city, category } = useParams<{ city: string; category: string }>();
  const cityName = city?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown City';
  const categoryName = category?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Jobs';

  // Mock job data specific to category and city
  const jobsData = useMemo(() => {
    const baseJobs = [
      {
        title: `${categoryName} Professional Needed`,
        price: '800/day',
        location: cityName,
        timePosted: '30 min ago',
        image: 'photo-1581578731548-c64695cc6952',
        featured: true
      },
      {
        title: `Experienced ${categoryName} Worker`,
        price: '700-900/day',
        location: cityName, 
        timePosted: '1h ago',
        image: 'photo-1556909114-f6e7ad7d3136'
      },
      {
        title: `${categoryName} Assistant Required`,
        price: '600/day',
        location: cityName,
        timePosted: '2h ago',
        image: 'photo-1504307651254-35680f356dfd'
      },
      {
        title: `Part-time ${categoryName} Work`,
        price: '500/day',
        location: cityName,
        timePosted: '3h ago',
        image: 'photo-1556742049-0cfed4f6a45d',
        featured: true
      },
      {
        title: `Urgent ${categoryName} Position`,
        price: '900/day',
        location: cityName,
        timePosted: '4h ago',
        image: 'photo-1581578731548-c64695cc6952'
      }
    ];

    // Customize based on category
    if (category === 'household-work') {
      baseJobs[0].title = 'House Cleaning Specialist';
      baseJobs[1].title = 'Cooking & Kitchen Helper';
      baseJobs[2].title = 'Gardening & Maintenance';
    } else if (category === 'delivery-transport') {
      baseJobs[0].title = 'Food Delivery Partner';
      baseJobs[1].title = 'Package Delivery Driver';
      baseJobs[2].title = 'Bike Taxi Driver';
    } else if (category === 'construction') {
      baseJobs[0].title = 'Construction Helper';
      baseJobs[1].title = 'Painting Contractor';
      baseJobs[2].title = 'Plumbing Assistant';
    }

    return baseJobs;
  }, [categoryName, category, cityName]);

  // Structured Data
  const jobPostingsSchema = jobsData.map(job => createJobPostingSchema({
    title: job.title,
    location: job.location,
    salary: job.price,
    category: categoryName,
    datePosted: new Date().toISOString()
  }));

  const localBusinessSchema = createLocalBusinessSchema(cityName);
  const organizationSchema = createOrganizationSchema();
  const breadcrumbSchema = createBreadcrumbSchema([
    { name: 'Home', url: 'https://localjobzz.com/' },
    { name: 'Jobs', url: 'https://localjobzz.com/category/all' },
    { name: `Jobs in ${cityName}`, url: `https://localjobzz.com/jobs/${city}` },
    { name: categoryName, url: `https://localjobzz.com/jobs/${city}/${category}` }
  ]);

  const combinedStructuredData = {
    "@context": "https://schema.org",
    "@graph": [organizationSchema, localBusinessSchema, breadcrumbSchema, ...jobPostingsSchema]
  };

  const breadcrumbItems = [
    { name: 'Jobs', url: '/category/all' },
    { name: cityName, url: `/jobs/${city}` },
    { name: categoryName }
  ];

  return (
    <div className="min-h-screen bg-surface">
      <SEOHead
        title={`${categoryName} Jobs in ${cityName} - Find Local Work`}
        description={`Find ${categoryName.toLowerCase()} jobs in ${cityName}. Browse verified ${categoryName.toLowerCase()} opportunities with daily pay. Start working today!`}
        keywords={`${categoryName.toLowerCase()} jobs ${cityName}, ${cityName} ${categoryName.toLowerCase()}, ${categoryName.toLowerCase()} work ${cityName}, daily ${categoryName.toLowerCase()} jobs`}
        city={cityName}
        category={categoryName}
        structuredData={combinedStructuredData}
        canonicalUrl={`https://localjobzz.com/jobs/${city}/${category}`}
      />
      
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BreadcrumbNavigation items={breadcrumbItems} />

        {/* Hero Section */}
        <section className="mb-12">
          <div className="bg-gradient-to-r from-brand to-brand-secondary rounded-2xl p-8 text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {categoryName} Jobs in {cityName}
            </h1>
            <p className="text-xl mb-6 opacity-90">
              Find verified {categoryName.toLowerCase()} opportunities in {cityName}. Start earning today with daily payments!
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold">{jobsData.length * 10}+</div>
                <div className="text-sm opacity-80">Active Jobs</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold">₹500-₹1000</div>
                <div className="text-sm opacity-80">Daily Pay</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold">Same Day</div>
                <div className="text-sm opacity-80">Start Work</div>
              </div>
            </div>
          </div>
        </section>

        {/* Job Filters */}
        <section className="mb-8">
          <div className="flex flex-wrap gap-4 p-4 bg-card rounded-lg border border-border">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-card-foreground">Sort by:</label>
              <select className="border border-border rounded px-3 py-1 text-sm bg-background">
                <option>Latest First</option>
                <option>Highest Pay</option>
                <option>Nearest Location</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-card-foreground">Experience:</label>
              <select className="border border-border rounded px-3 py-1 text-sm bg-background">
                <option>All Levels</option>
                <option>Beginner</option>
                <option>Experienced</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-card-foreground">Pay Range:</label>
              <select className="border border-border rounded px-3 py-1 text-sm bg-background">
                <option>All Ranges</option>
                <option>₹500-₹700</option>
                <option>₹700-₹900</option>
                <option>₹900+</option>
              </select>
            </div>
          </div>
        </section>

        {/* Available Jobs */}
        <section>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-foreground">Available {categoryName} Jobs</h2>
            <div className="text-muted-foreground">
              Showing {jobsData.length} of {jobsData.length * 8}+ jobs
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
              Load More {categoryName} Jobs
            </button>
          </div>
        </section>

        {/* Related Categories */}
        <section className="mt-16">
          <h3 className="text-2xl font-bold text-foreground mb-6">Related Job Categories in {cityName}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'Household Work', link: `/jobs/${city}/household-work` },
              { name: 'Delivery & Transport', link: `/jobs/${city}/delivery-transport` },
              { name: 'Construction', link: `/jobs/${city}/construction` },
              { name: 'Shop Assistant', link: `/jobs/${city}/shop-assistant` }
            ].filter(cat => cat.name.toLowerCase().replace(/\s/g, '-') !== category).map((relatedCategory, index) => (
              <a
                key={index}
                href={relatedCategory.link}
                className="block bg-card border border-border rounded-lg p-4 hover:shadow-md transition-all duration-300 hover:scale-105"
              >
                <h4 className="font-semibold text-card-foreground">{relatedCategory.name}</h4>
                <p className="text-sm text-muted-foreground">View jobs</p>
              </a>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default CategoryCityJobs;