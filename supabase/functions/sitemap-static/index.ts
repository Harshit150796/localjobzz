import { corsHeaders, getCacheHeaders, generateSitemapXML, getTodayDate, SitemapUrl } from '../_shared/sitemap-utils.ts';

const BASE_URL = 'https://localjobzz.com';

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Generating static sitemap...');

    const today = getTodayDate();
    
    const staticUrls: SitemapUrl[] = [
      {
        loc: `${BASE_URL}/`,
        lastmod: today,
        changefreq: 'daily',
        priority: 1.0
      },
      {
        loc: `${BASE_URL}/about`,
        lastmod: today,
        changefreq: 'weekly',
        priority: 0.8
      },
      {
        loc: `${BASE_URL}/how-it-works`,
        lastmod: today,
        changefreq: 'weekly',
        priority: 0.9
      },
      {
        loc: `${BASE_URL}/pricing`,
        lastmod: today,
        changefreq: 'weekly',
        priority: 0.7
      },
      {
        loc: `${BASE_URL}/post`,
        lastmod: today,
        changefreq: 'weekly',
        priority: 0.9
      },
      {
        loc: `${BASE_URL}/safety-tips`,
        lastmod: today,
        changefreq: 'monthly',
        priority: 0.6
      },
      {
        loc: `${BASE_URL}/help`,
        lastmod: today,
        changefreq: 'monthly',
        priority: 0.5
      },
      {
        loc: `${BASE_URL}/contact`,
        lastmod: today,
        changefreq: 'monthly',
        priority: 0.5
      },
      {
        loc: `${BASE_URL}/privacy`,
        lastmod: today,
        changefreq: 'yearly',
        priority: 0.3
      },
      {
        loc: `${BASE_URL}/terms`,
        lastmod: today,
        changefreq: 'yearly',
        priority: 0.3
      }
    ];

    const xml = generateSitemapXML(staticUrls);
    
    console.log(`Generated static sitemap with ${staticUrls.length} URLs`);

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        ...getCacheHeaders(86400), // Cache for 24 hours
      },
    });
  } catch (error) {
    console.error('Error generating static sitemap:', error);
    return new Response(
      `Error generating sitemap: ${error.message}`,
      { 
        status: 500,
        headers: corsHeaders
      }
    );
  }
});
