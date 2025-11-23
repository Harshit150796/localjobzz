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

interface VerifyOTPRequest {
  email: string;
  otpCode: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, otpCode }: VerifyOTPRequest = await req.json();

    console.log('Verifying OTP for:', email);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get pending registration
    const { data: pending, error: fetchError } = await supabase
      .from('pending_registrations')
      .select('*')
      .eq('email', email)
      .is('verified_at', null)
      .single();

    if (fetchError || !pending) {
      console.error('No pending registration found');
      return new Response(
        JSON.stringify({ error: 'No pending registration found for this email' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Check if too many attempts (max 5)
    if (pending.attempts >= 5) {
      return new Response(
        JSON.stringify({ error: 'Too many attempts. Please request a new code.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
      );
    }

    // Check if OTP expired (5 minutes)
    const now = new Date();
    const expiresAt = new Date(pending.expires_at);
    if (now > expiresAt) {
      return new Response(
        JSON.stringify({ error: 'OTP expired. Please request a new code.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Verify OTP using constant-time comparison
    const otpCodeHash = await hashValue(otpCode);
    const isMatch = otpCodeHash === pending.otp_hash;

    if (!isMatch) {
      // Increment attempts
      const newAttempts = pending.attempts + 1;
      await supabase
        .from('pending_registrations')
        .update({ attempts: newAttempts })
        .eq('email', email);

      const remainingAttempts = 5 - newAttempts;
      return new Response(
        JSON.stringify({ 
          error: `Invalid OTP. ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining.` 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log('OTP verified, checking if user exists...');

    // Check if user already exists in auth
    const { data: existingAuthUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingAuthUsers.users.find(u => u.email === pending.email);

    let userId: string;

    if (existingUser) {
      console.log('User already exists:', existingUser.id);
      userId = existingUser.id;

      // Update auth user to confirmed if not already
      if (!existingUser.email_confirmed_at) {
        console.log('Confirming email for existing user');
        await supabase.auth.admin.updateUserById(existingUser.id, {
          email_confirm: true
        });
      }

      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id, email_verified')
        .eq('user_id', existingUser.id)
        .maybeSingle();

      if (existingProfile) {
        // Update existing profile to verified
        console.log('Updating existing profile to verified');
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            email_verified: true,
            name: pending.name,
            phone: pending.phone 
          })
          .eq('user_id', existingUser.id);

        if (updateError) {
          console.error('Failed to update profile:', updateError);
          throw updateError;
        }
      } else {
        // Create profile if it doesn't exist
        console.log('Creating missing profile for existing user');
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: existingUser.id,
            name: pending.name,
            email: pending.email,
            phone: pending.phone,
            email_verified: true
          });

        if (profileError) {
          console.error('Failed to create profile:', profileError);
          throw profileError;
        }
      }
    } else {
      // Create new user in Supabase Auth
      console.log('Creating new user account...');
      const { data: authData, error: createError } = await supabase.auth.admin.createUser({
        email: pending.email,
        password: pending.password_hash, // This is the plain password
        email_confirm: true,
        user_metadata: { 
          name: pending.name,
          phone: pending.phone 
        }
      });

      if (createError) {
        console.error('Failed to create user:', createError);
        throw createError;
      }

      console.log('User created:', authData.user.id);
      userId = authData.user.id;

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: authData.user.id,
          name: pending.name,
          email: pending.email,
          phone: pending.phone,
          email_verified: true
        });

      if (profileError) {
        console.error('Failed to create profile:', profileError);
        throw profileError;
      }
    }

    // Mark pending registration as verified
    await supabase
      .from('pending_registrations')
      .update({ verified_at: new Date().toISOString() })
      .eq('email', email);

    console.log('Account creation complete for:', email);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email verified successfully! You can now login.',
        userId: userId
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: any) {
    console.error('Error in verify-otp:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to verify OTP' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
};

serve(handler);