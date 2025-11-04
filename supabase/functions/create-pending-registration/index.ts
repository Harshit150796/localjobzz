import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

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

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check if email already exists in auth
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const emailExists = existingUsers?.users?.some(u => u.email === email);
    
    if (emailExists) {
      return new Response(
        JSON.stringify({ error: 'Email already registered. Please login instead.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('Generated OTP:', otpCode);

    // Hash password
    const passwordHash = await bcrypt.hash(password);

    // Set expiration (15 minutes)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    // Store pending registration
    const { data: pendingReg, error: insertError } = await supabase
      .from('pending_registrations')
      .upsert({
        email,
        name,
        password_hash: passwordHash,
        phone,
        otp_code: otpCode,
        expires_at: expiresAt.toISOString(),
        attempts: 0,
        verified_at: null
      }, {
        onConflict: 'email'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      throw insertError;
    }

    console.log('Pending registration created, sending OTP email...');

    // Send OTP email asynchronously (non-blocking)
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
        message: 'OTP sent to your email',
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
