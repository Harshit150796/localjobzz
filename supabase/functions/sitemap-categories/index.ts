import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { corsHeaders, getCacheHeaders, generateSitemapXML, getTodayDate, SitemapUrl } from '../_shared/sitemap-utils.ts';

const BASE_URL = 'https://localjobzz.com';

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Generating categories sitemap...');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const today = getTodayDate();
    const categoryUrls: SitemapUrl[] = [];

    // Query distinct categories with active jobs
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('jobs')
      .select('category')
      .eq('status', 'active')
      .not('category', 'is', null);

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError);
      throw new Error(`Database error: ${categoriesError.message}`);
    }

    // Extract unique categories (normalize to lowercase with hyphens)
    const activeCategories = [...new Set(
      (categoriesData || [])
        .map(job => job.category?.toLowerCase().trim().replace(/\s+/g, '-'))
        .filter(category => category && category.length > 0)
    )];

    console.log(`Found ${activeCategories.length} categories with active jobs`);

    // Add main category pages (only categories with jobs)
    activeCategories.forEach(category => {
      categoryUrls.push({
        loc: `${BASE_URL}/category/${category}`,
        lastmod: today,
        changefreq: 'hourly',
        priority: 0.9
      });
    });

    // Query category + city combinations with active jobs
    const { data: categoryCity, error: ccError } = await supabase
      .from('jobs')
      .select('category, location')
      .eq('status', 'active')
      .not('category', 'is', null);

    if (ccError) {
      console.error('Error fetching category-cities:', ccError);
    } else {
      // Create unique category-city combinations
      const combinations = new Set(
        (categoryCity || [])
          .map(job => {
            const category = job.category?.toLowerCase().trim().replace(/\s+/g, '-');
            const city = job.location.toLowerCase().trim().replace(/\s+/g, '-');
            return category ? `${category}|${city}` : null;
          })
          .filter(Boolean)
      );

      combinations.forEach(combo => {
        const [category, city] = combo!.split('|');
        categoryUrls.push({
          loc: `${BASE_URL}/jobs/${city}/${category}`,
          lastmod: today,
          changefreq: 'hourly',
          priority: 0.85
        });
      });
    }

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
