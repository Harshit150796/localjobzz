import { corsHeaders, getCacheHeaders, generateSitemapXML, getTodayDate, SitemapUrl, jobCategories, majorCities } from '../_shared/sitemap-utils.ts';

const BASE_URL = 'https://localjobzz.com';

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Generating cities sitemap...');

    const today = getTodayDate();
    const cityUrls: SitemapUrl[] = [];

    // Add main city pages
    majorCities.forEach(city => {
      cityUrls.push({
        loc: `${BASE_URL}/jobs/${city}`,
        lastmod: today,
        changefreq: 'hourly',
        priority: 0.9
      });
    });

    // Add city + category combinations for top 15 cities
    const topCities = majorCities.slice(0, 15);
    topCities.forEach(city => {
      jobCategories.forEach(category => {
        cityUrls.push({
          loc: `${BASE_URL}/jobs/${city}/${category}`,
          lastmod: today,
          changefreq: 'hourly',
          priority: 0.8
        });
      });
    });

    const xml = generateSitemapXML(cityUrls);
    
    console.log(`Generated cities sitemap with ${cityUrls.length} URLs`);

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        ...getCacheHeaders(3600), // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Error generating cities sitemap:', error);
    return new Response(
      `Error generating sitemap: ${error.message}`,
      { 
        status: 500,
        headers: corsHeaders
      }
    );
  }
});
