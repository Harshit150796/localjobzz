// Sitemap generation utilities
export interface SitemapUrl {
  url: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export const jobCategories = [
  'household-work',
  'delivery-transport', 
  'construction',
  'shop-assistant',
  'security',
  'cooking',
  'cleaning',
  'gardening',
  'electrical',
  'plumbing',
  'painting',
  'driving',
  'warehouse',
  'data-entry',
  'customer-service'
];

export const majorCities = [
  // India
  'mumbai', 'delhi', 'bangalore', 'hyderabad', 'ahmedabad', 'chennai', 'kolkata', 'pune', 'jaipur', 'lucknow',
  'kanpur', 'nagpur', 'indore', 'thane', 'bhopal', 'visakhapatnam', 'pimpri-chinchwad', 'patna', 'vadodara', 'ghaziabad',
  'ludhiana', 'agra', 'nashik', 'faridabad', 'meerut', 'rajkot', 'kalyan-dombivali', 'vasai-virar', 'varanasi', 'srinagar',
  
  // USA
  'new-york', 'los-angeles', 'chicago', 'houston', 'phoenix', 'philadelphia', 'san-antonio', 'san-diego', 'dallas', 'san-jose',
  'austin', 'jacksonville', 'fort-worth', 'columbus', 'charlotte', 'san-francisco', 'indianapolis', 'seattle', 'denver', 'washington',
  'boston', 'el-paso', 'detroit', 'nashville', 'portland', 'memphis', 'oklahoma-city', 'las-vegas', 'louisville', 'baltimore'
];

export const generateSitemapUrls = (baseUrl: string = 'https://localjobzz.com'): SitemapUrl[] => {
  const urls: SitemapUrl[] = [];
  const today = new Date().toISOString().split('T')[0];

  // Homepage
  urls.push({
    url: `${baseUrl}/`,
    lastmod: today,
    changefreq: 'daily',
    priority: 1.0
  });

  // Static pages
  const staticPages = [
    { path: '/about', priority: 0.8 },
    { path: '/how-it-works', priority: 0.9 },
    { path: '/pricing', priority: 0.7 },
    { path: '/safety', priority: 0.6 },
    { path: '/help', priority: 0.6 },
    { path: '/contact', priority: 0.7 },
    { path: '/privacy', priority: 0.5 },
    { path: '/terms', priority: 0.5 },
    { path: '/post', priority: 0.9 }
  ];

  staticPages.forEach(page => {
    urls.push({
      url: `${baseUrl}${page.path}`,
      lastmod: today,
      changefreq: 'weekly',
      priority: page.priority
    });
  });

  // Job category pages
  jobCategories.forEach(category => {
    urls.push({
      url: `${baseUrl}/category/${category}`,
      lastmod: today,
      changefreq: 'hourly',
      priority: 0.9
    });

    // Category + city combinations (high-value pages)
    majorCities.slice(0, 10).forEach(city => {
      urls.push({
        url: `${baseUrl}/category/${category}?city=${encodeURIComponent(city.replace(/-/g, ' '))}`,
        lastmod: today,
        changefreq: 'hourly',
        priority: 0.8
      });
    });
  });

  // City-specific job pages
  majorCities.forEach(city => {
    urls.push({
      url: `${baseUrl}/jobs/${city}`,
      lastmod: today,
      changefreq: 'hourly',
      priority: 0.9
    });
  });

  // Jobs in city by category
  majorCities.slice(0, 15).forEach(city => {
    jobCategories.slice(0, 8).forEach(category => {
      urls.push({
        url: `${baseUrl}/jobs/${city}/${category}`,
        lastmod: today,
        changefreq: 'hourly', 
        priority: 0.8
      });
    });
  });

  return urls;
};

export const generateXMLSitemap = (urls: SitemapUrl[]): string => {
  const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
  const urlsetOpen = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
  const urlsetClose = '</urlset>';

  const urlElements = urls.map(urlData => {
    let urlElement = `  <url>\n    <loc>${urlData.url}</loc>`;
    
    if (urlData.lastmod) {
      urlElement += `\n    <lastmod>${urlData.lastmod}</lastmod>`;
    }
    
    if (urlData.changefreq) {
      urlElement += `\n    <changefreq>${urlData.changefreq}</changefreq>`;
    }
    
    if (urlData.priority !== undefined) {
      urlElement += `\n    <priority>${urlData.priority}</priority>`;
    }
    
    urlElement += '\n  </url>';
    return urlElement;
  }).join('\n');

  return `${xmlHeader}\n${urlsetOpen}\n${urlElements}\n${urlsetClose}`;
};