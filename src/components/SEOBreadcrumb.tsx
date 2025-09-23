import React from 'react';
import BreadcrumbNavigation from './Breadcrumb';
import SEOHead from './SEOHead';
import { createBreadcrumbSchema } from './StructuredData';

interface SEOBreadcrumbProps {
  items: Array<{ name: string; url?: string }>;
  title?: string;
  description?: string;
  keywords?: string;
  city?: string;
  category?: string;
  className?: string;
}

const SEOBreadcrumb = ({ 
  items, 
  title, 
  description, 
  keywords, 
  city, 
  category, 
  className 
}: SEOBreadcrumbProps) => {
  // Create breadcrumb structured data
  const breadcrumbItems = [
    { name: 'Home', url: 'https://localjobzz.com/' },
    ...items.map(item => ({
      name: item.name,
      url: item.url ? `https://localjobzz.com${item.url}` : `https://localjobzz.com${window.location.pathname}`
    }))
  ];

  const breadcrumbSchema = createBreadcrumbSchema(breadcrumbItems);

  return (
    <>
      {title && (
        <SEOHead
          title={title}
          description={description}
          keywords={keywords}
          city={city}
          category={category}
          structuredData={breadcrumbSchema}
        />
      )}
      <BreadcrumbNavigation items={items} className={className} />
    </>
  );
};

export default SEOBreadcrumb;