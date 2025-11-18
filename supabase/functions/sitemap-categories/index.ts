import { corsHeaders, getCacheHeaders, generateSitemapXML, getTodayDate, SitemapUrl, jobCategories, majorCities } from '../_shared/sitemap-utils.ts';

const BASE_URL = 'https://localjobzz.com';

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Generating categories sitemap...');

    const today = getTodayDate();
    const categoryUrls: SitemapUrl[] = [];

    // Add main category pages
    jobCategories.forEach(category => {
      categoryUrls.push({
        loc: `${BASE_URL}/category/${category}`,
        lastmod: today,
        changefreq: 'hourly',
        priority: 0.9
      });
    });

    // Add category + city combinations for top 10 cities
    const topCities = majorCities.slice(0, 10);
    jobCategories.forEach(category => {
      topCities.forEach(city => {
        categoryUrls.push({
          loc: `${BASE_URL}/jobs/${city}/${category}`,
          lastmod: today,
          changefreq: 'hourly',
          priority: 0.85
        });
      });
    });

    const xml = generateSitemapXML(categoryUrls);
    
    console.log(`Generated categories sitemap with ${categoryUrls.length} URLs`);

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        ...getCacheHeaders(3600), // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Error generating categories sitemap:', error);
    return new Response(
      `Error generating sitemap: ${error.message}`,
      { 
        status: 500,
        headers: corsHeaders
      }
    );
  }
});
