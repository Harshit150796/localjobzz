export const createOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "localjobzz",
  "url": "https://localjobzz.com",
  "logo": {
    "@type": "ImageObject",
    "url": "https://localjobzz.com/favicon-orange.png"
  },
  "description": "Premier job platform for finding daily work opportunities and hiring workers instantly",
  "foundingDate": "2024",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+91-XXX-XXX-XXXX",
    "contactType": "Customer Service",
    "availableLanguage": ["English", "Hindi"]
  },
  "sameAs": [
    "https://twitter.com/localjobzz",
    "https://facebook.com/localjobzz",
    "https://linkedin.com/company/localjobzz"
  ],
  "areaServed": [
    {
      "@type": "Country",
      "name": "India"
    },
    {
      "@type": "Country", 
      "name": "United States"
    }
  ],
  "serviceType": [
    "Job Board",
    "Employment Services",
    "Recruitment Platform"
  ]
});

export const createJobPostingSchema = (job: {
  title: string;
  description?: string;
  location: string;
  salary?: string;
  category?: string;
  datePosted?: string;
  employmentType?: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "JobPosting",
  "title": job.title,
  "description": job.description || `${job.title} position available in ${job.location}`,
  "identifier": {
    "@type": "PropertyValue",
    "name": "Job ID",
    "value": `job-${Date.now()}`
  },
  "datePosted": job.datePosted || new Date().toISOString(),
  "validThrough": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
  "employmentType": job.employmentType || "FULL_TIME",
  "hiringOrganization": {
    "@type": "Organization",
    "name": "localjobzz",
    "sameAs": "https://localjobzz.com",
    "logo": "https://localjobzz.com/favicon-orange.png"
  },
  "jobLocation": {
    "@type": "Place",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": job.location.split(',')[0],
      "addressRegion": job.location.split(',')[1]?.trim() || "India",
      "addressCountry": "IN"
    }
  },
  "baseSalary": job.salary ? {
    "@type": "MonetaryAmount",
    "currency": "INR",
    "value": {
      "@type": "QuantitativeValue",
      "value": parseFloat(job.salary.replace(/[^\d]/g, '')) || 500,
      "unitText": "DAY"
    }
  } : undefined,
  "industry": job.category || "General Labor",
  "occupationalCategory": job.category || "General Work"
});

export const createLocalBusinessSchema = (city?: string) => ({
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": `localjobzz ${city ? `- ${city}` : ''}`,
  "image": "https://localjobzz.com/favicon-orange.png",
  "url": `https://localjobzz.com${city ? `/city/${city.toLowerCase().replace(/\s+/g, '-')}` : ''}`,
  "telephone": "+91-XXX-XXX-XXXX",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Business District",
    "addressLocality": city || "Mumbai",
    "addressRegion": "Maharashtra", 
    "postalCode": "400001",
    "addressCountry": "IN"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "19.0760",
    "longitude": "72.8777"
  },
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": [
      "Monday",
      "Tuesday", 
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday"
    ],
    "opens": "00:00",
    "closes": "23:59"
  },
  "servesCuisine": ["Employment Services"],
  "priceRange": "Free"
});

export const createWebsiteSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "localjobzz",
  "url": "https://localjobzz.com",
  "description": "Find daily work opportunities and hire workers instantly",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://localjobzz.com/search?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
});

export const createBreadcrumbSchema = (items: Array<{name: string; url: string}>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": item.url
  }))
});

export const createFAQSchema = (faqs: Array<{question: string; answer: string}>) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
});

export const createSiteNavigationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "ItemList",
  "itemListElement": [
    {
      "@type": "SiteNavigationElement",
      "position": 1,
      "name": "About Us",
      "description": "Learn about localjobzz mission and team",
      "url": "https://localjobzz.com/about"
    },
    {
      "@type": "SiteNavigationElement",
      "position": 2,
      "name": "How It Works",
      "description": "Discover how to find jobs or hire workers on localjobzz",
      "url": "https://localjobzz.com/how-it-works"
    },
    {
      "@type": "SiteNavigationElement",
      "position": 3,
      "name": "Post a Job",
      "description": "Hire workers instantly for daily work",
      "url": "https://localjobzz.com/post-ad"
    },
    {
      "@type": "SiteNavigationElement",
      "position": 4,
      "name": "Find Jobs",
      "description": "Browse thousands of local job opportunities",
      "url": "https://localjobzz.com/"
    },
    {
      "@type": "SiteNavigationElement",
      "position": 5,
      "name": "Pricing",
      "description": "View pricing plans for featured job listings",
      "url": "https://localjobzz.com/pricing"
    },
    {
      "@type": "SiteNavigationElement",
      "position": 6,
      "name": "Help Center",
      "description": "Get help and answers to common questions",
      "url": "https://localjobzz.com/help"
    },
    {
      "@type": "SiteNavigationElement",
      "position": 7,
      "name": "Contact",
      "description": "Get in touch with the localjobzz team",
      "url": "https://localjobzz.com/contact"
    }
  ]
});