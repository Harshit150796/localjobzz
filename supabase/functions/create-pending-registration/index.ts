import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

// Helper function to hash using Web Crypto API
async function hashValue(value: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreatePendingRegistrationRequest {
  email: string;
  name: string;
  password: string;
  phone?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, password, phone }: CreatePendingRegistrationRequest = await req.json();

    console.log('Creating pending registration for:', email);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get IP address and User-Agent
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Check if email exists in Supabase Auth first
    const { data: existingAuthUsers } = await supabase.auth.admin.listUsers();
    const existingAuthUser = existingAuthUsers.users.find(u => u.email === email && u.email_confirmed_at);

    if (existingAuthUser) {
      console.log('Auth user found with email_confirmed_at:', email);
      
      // Check if profile is ALSO verified (both conditions must be true for fully verified account)
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('email_verified, user_id')
        .eq('user_id', existingAuthUser.id)
        .maybeSingle();

      if (existingProfile && existingProfile.email_verified === true) {
        // Account is FULLY verified - block signup
        console.log('Account is fully verified (auth + profile), blocking signup:', email);
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'EMAIL_ALREADY_EXISTS',
            message: 'An account with this email already exists. Please sign in instead.',
            canLogin: true
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      } else {
        // Account is INCOMPLETE (auth user exists but profile not verified) - clean up and allow retry
        console.log('INCOMPLETE ACCOUNT DETECTED - Auth confirmed but profile not verified, cleaning up:', email);
        
        try {
          // Step 1: Delete the incomplete auth user
          console.log('Deleting incomplete auth user:', existingAuthUser.id);
          const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(existingAuthUser.id);
          if (deleteAuthError) {
            console.error('Error deleting auth user:', deleteAuthError);
          } else {
            console.log('Successfully deleted incomplete auth user');
          }

          // Step 2: Delete the orphaned profile
          if (existingProfile) {
            console.log('Deleting orphaned profile for user_id:', existingAuthUser.id);
            const { error: deleteProfileError } = await supabase
              .from('profiles')
              .delete()
              .eq('user_id', existingAuthUser.id);
            if (deleteProfileError) {
              console.error('Error deleting profile:', deleteProfileError);
            } else {
              console.log('Successfully deleted orphaned profile');
            }
          }

          // Step 3: Delete all pending registrations for this email
          console.log('Deleting all pending registrations for email:', email);
          const { error: deletePendingError } = await supabase
            .from('pending_registrations')
            .delete()
            .eq('email', email);
          if (deletePendingError) {
            console.error('Error deleting pending registrations:', deletePendingError);
          } else {
            console.log('Successfully deleted pending registrations');
          }

          console.log('Cleanup complete, proceeding with fresh signup for:', email);
        } catch (cleanupError: any) {
          console.error('Error during cleanup:', cleanupError);
          // Continue with signup attempt even if cleanup fails
        }
      }
    } else {
      // No auth user with email_confirmed_at found
      // Check if there's an orphaned profile without auth user
      const { data: orphanedProfile } = await supabase
        .from('profiles')
        .select('email, email_verified, user_id')
        .eq('email', email)
        .maybeSingle();

      if (orphanedProfile && !orphanedProfile.email_verified) {
        console.log('Orphaned unverified profile found (no auth user), cleaning up:', email);
        
        // Delete the orphaned profile
        const { error: deleteProfileError } = await supabase
          .from('profiles')
          .delete()
          .eq('email', email)
          .eq('email_verified', false);
        
        if (deleteProfileError) {
          console.error('Error deleting orphaned profile:', deleteProfileError);
        } else {
          console.log('Successfully deleted orphaned profile');
        }
      } else if (orphanedProfile && orphanedProfile.email_verified) {
        // Profile is verified but no auth user - shouldn't happen, but block signup
        console.log('Verified profile exists without auth user (inconsistent state):', email);
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'EMAIL_ALREADY_EXISTS',
            message: 'An account with this email already exists. Please sign in instead.',
            canLogin: true
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }
    }

    // Delete ALL old pending registrations for this email (fresh start)
    const { error: cleanupError } = await supabase
      .from('pending_registrations')
      .delete()
      .eq('email', email);

    if (cleanupError) {
      console.log('Cleanup warning:', cleanupError);
      // Continue anyway - not critical
    }

    // Check 30-second cooldown only (prevent spam clicking)
    const { data: lastPending } = await supabase
      .from('pending_registrations')
      .select('created_at')
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastPending) {
      const timeSinceLastSend = Date.now() - new Date(lastPending.created_at).getTime();
      if (timeSinceLastSend < 30000) {
        const waitTime = Math.ceil((30000 - timeSinceLastSend) / 1000);
        return new Response(
          JSON.stringify({ error: `Please wait ${waitTime} seconds before requesting a new code.` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
        );
      }
    }

    // Check IP-based rate limit (10 per hour)
    const oneHourAgo = new Date(Date.now() - 3600000);
    const { count: ipCount } = await supabase
      .from('pending_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('ip_address', ipAddress)
      .gte('created_at', oneHourAgo.toISOString());

    if (ipCount && ipCount >= 10) {
      return new Response(
        JSON.stringify({ error: 'Too many requests from this IP. Please try again later.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
      );
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('Generated OTP for', email);

    // Hash only the OTP (store password as-is temporarily for registration)
    const otpHash = await hashValue(otpCode);

    // Set expiration (5 minutes)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    // Store pending registration (with plain password, only for 5 min)
    // Use INSERT since we cleaned up old records above
    const { error: insertError } = await supabase
      .from('pending_registrations')
      .insert({
        email,
        name,
        password_hash: password, // Store plain password temporarily for registration
        phone,
        otp_code: otpCode,
        otp_hash: otpHash,
        expires_at: expiresAt.toISOString(),
        attempts: 0,
        resend_count: 0,
        verified_at: null,
        ip_address: ipAddress,
        user_agent: userAgent
      });

    if (insertError) {
      console.error('Insert error:', insertError);
      throw insertError;
    }

    console.log('Pending registration created, sending OTP email...');

    // Send OTP email asynchronously
    supabase.functions.invoke('send-otp-email', {
      body: { email, name, otpCode }
    }).then(result => {
      console.log('OTP email sent:', result);
    }).catch(err => {
      console.error('Failed to send OTP email:', err);
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'OTP sent to your email. Valid for 5 minutes.',
        expiresAt: expiresAt.toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: any) {
    console.error('Error in create-pending-registration:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to create registration' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
};

serve(handler);
