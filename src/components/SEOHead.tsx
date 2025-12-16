import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: string;
  structuredData?: any;
  city?: string;
  category?: string;
}

const SEOHead = ({
  title = 'localjobzz - Find Daily Work & Hire Workers Instantly',
  description = 'Find daily work opportunities or hire workers instantly. Join thousands of people making smart employment decisions on localjobzz.com - the fastest job platform.',
  keywords = 'local jobs, daily work, hire workers, job platform, employment, part time jobs, full time jobs, gig work',
  canonicalUrl,
  ogImage = 'https://www.localjobzz.com/og-image.png',
  ogType = 'website',
  structuredData,
  city,
  category
}: SEOHeadProps) => {
  // Enhanced title and description for location-specific pages
  const finalTitle = city ? 
    `Jobs in ${city} - ${title}` : 
    category ? 
    `${category} Jobs - ${title}` : 
    title;

  const finalDescription = city ? 
    `Find ${category || 'local'} jobs in ${city}. ${description}` :
    description;

  const finalKeywords = city ? 
    `${keywords}, jobs in ${city}, ${city} employment, ${city} work` :
    category ? 
    `${keywords}, ${category} jobs, ${category} work, ${category} employment` :
    keywords;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords} />
      <meta name="author" content="localjobzz" />
      <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      
      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Open Graph */}
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:url" content={canonicalUrl || window.location.href} />
      <meta property="og:site_name" content="localjobzz" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@localjobzz" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
      
      {/* Additional SEO Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="language" content="English" />
      <meta name="geo.region" content="IN" />
      <meta name="geo.placename" content="India" />
      
      {city && (
        <>
          <meta name="geo.position" content="28.7041;77.1025" />
          <meta name="ICBM" content="28.7041, 77.1025" />
        </>
      )}
    </Helmet>
  );
};

export default SEOHead;