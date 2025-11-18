export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml; charset=utf-8',
};

export const getCacheHeaders = (maxAge: number) => ({
  'Cache-Control': `public, max-age=${maxAge}, s-maxage=${maxAge}`,
});

export interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export const generateSitemapXML = (urls: SitemapUrl[]): string => {
  const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
  const urlsetOpen = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
  const urlsetClose = '</urlset>';
  
  const urlElements = urls.map(url => {
    let element = `  <url>\n    <loc>${escapeXml(url.loc)}</loc>`;
    if (url.lastmod) element += `\n    <lastmod>${url.lastmod}</lastmod>`;
    if (url.changefreq) element += `\n    <changefreq>${url.changefreq}</changefreq>`;
    if (url.priority !== undefined) element += `\n    <priority>${url.priority.toFixed(1)}</priority>`;
    element += '\n  </url>';
    return element;
  }).join('\n');
  
  return `${xmlHeader}\n${urlsetOpen}\n${urlElements}\n${urlsetClose}`;
};

const escapeXml = (str: string): string => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

export const getTodayDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const formatDate = (date: Date | string): string => {
  if (typeof date === 'string') {
    return new Date(date).toISOString().split('T')[0];
  }
  return date.toISOString().split('T')[0];
};

export const jobCategories = [
  'household-work',
  'delivery-transport',
  'construction',
  'shop-assistant',
  'security',
  'office-work',
  'food-service',
  'beauty-wellness',
  'tutoring-education',
  'event-staff',
  'customer-service',
  'maintenance-repair',
  'warehouse',
  'sales',
  'healthcare-support'
];

export const majorCities = [
  'mumbai',
  'delhi',
  'bangalore',
  'hyderabad',
  'ahmedabad',
  'chennai',
  'kolkata',
  'pune',
  'jaipur',
  'surat',
  'lucknow',
  'kanpur',
  'nagpur',
  'indore',
  'thane',
  'bhopal',
  'visakhapatnam',
  'pimpri-chinchwad',
  'patna',
  'vadodara',
  'ghaziabad',
  'ludhiana',
  'agra',
  'nashik',
  'faridabad',
  'meerut',
  'rajkot',
  'kalyan-dombivali',
  'vasai-virar',
  'varanasi',
  'srinagar',
  'aurangabad',
  'dhanbad',
  'amritsar',
  'navi-mumbai',
  'allahabad',
  'ranchi',
  'howrah',
  'coimbatore',
  'jabalpur',
  'gwalior',
  'vijayawada',
  'jodhpur',
  'madurai',
  'raipur',
  'kota',
  'chandigarh',
  'guwahati',
  'solapur',
  'hubli-dharwad',
  'bareilly',
  'moradabad',
  'mysore',
  'gurgaon',
  'aligarh',
  'jalandhar',
  'tiruchirappalli',
  'bhubaneswar',
  'salem',
  'warangal',
  'mira-bhayandar'
];
