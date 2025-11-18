import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { corsHeaders, getCacheHeaders, generateSitemapXML, formatDate, SitemapUrl } from '../_shared/sitemap-utils.ts';

const BASE_URL = 'https://localjobzz.com';

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Generating jobs sitemap...');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Query active jobs from database (limit to 50,000 per Google's sitemap guidelines)
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('id, created_at, updated_at')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(50000);

    if (error) {
      console.error('Error fetching jobs:', error);
      throw new Error(`Database error: ${error.message}`);
    }

    console.log(`Found ${jobs?.length || 0} active jobs`);

    const jobUrls: SitemapUrl[] = (jobs || []).map(job => ({
      loc: `${BASE_URL}/job/${job.id}`,
      lastmod: formatDate(job.updated_at || job.created_at),
      changefreq: 'daily',
      priority: 0.7
    }));

    const xml = generateSitemapXML(jobUrls);
    
    console.log(`Generated jobs sitemap with ${jobUrls.length} URLs`);

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        ...getCacheHeaders(900), // Cache for 15 minutes
      },
    });
  } catch (error) {
    console.error('Error generating jobs sitemap:', error);
    return new Response(
      `Error generating sitemap: ${error.message}`,
      { 
        status: 500,
        headers: corsHeaders
      }
    );
  }
});
