import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { corsHeaders, getCacheHeaders, generateSitemapXML, getTodayDate, SitemapUrl } from '../_shared/sitemap-utils.ts';

const BASE_URL = 'https://localjobzz.com';

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Generating cities sitemap...');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const today = getTodayDate();
    const cityUrls: SitemapUrl[] = [];

    // Query distinct cities with active jobs
    const { data: citiesData, error: citiesError } = await supabase
      .from('jobs')
      .select('location')
      .eq('status', 'active');

    if (citiesError) {
      console.error('Error fetching cities:', citiesError);
      throw new Error(`Database error: ${citiesError.message}`);
    }

    // Extract unique cities (normalize to lowercase with hyphens)
    const activeCities = [...new Set(
      (citiesData || [])
        .map(job => job.location.toLowerCase().trim().replace(/\s+/g, '-'))
        .filter(city => city.length > 0)
    )];

    console.log(`Found ${activeCities.length} cities with active jobs`);

    // Add main city pages (only cities with jobs)
    activeCities.forEach(city => {
      cityUrls.push({
        loc: `${BASE_URL}/jobs/${city}`,
        lastmod: today,
        changefreq: 'hourly',
        priority: 0.9
      });
    });

    // Query city + category combinations with active jobs
    const { data: cityCategories, error: ccError } = await supabase
      .from('jobs')
      .select('location, category')
      .eq('status', 'active')
      .not('category', 'is', null);

    if (ccError) {
      console.error('Error fetching city-categories:', ccError);
    } else {
      // Create unique city-category combinations
      const combinations = new Set(
        (cityCategories || [])
          .map(job => {
            const city = job.location.toLowerCase().trim().replace(/\s+/g, '-');
            const category = job.category?.toLowerCase().trim().replace(/\s+/g, '-');
            return category ? `${city}|${category}` : null;
          })
          .filter(Boolean)
      );

      combinations.forEach(combo => {
        const [city, category] = combo!.split('|');
        cityUrls.push({
          loc: `${BASE_URL}/jobs/${city}/${category}`,
          lastmod: today,
          changefreq: 'hourly',
          priority: 0.8
        });
      });
    }

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
