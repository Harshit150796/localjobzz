import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import SEOHead from '@/components/SEOHead';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { session, user } = useAuth();
  const { toast } = useToast();
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [email, setEmail] = useState('');
  const [resendCountdown, setResendCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Get email from URL params or session
  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    } else if (session?.user?.email) {
      setEmail(session.user.email);
    } else {
      // No email found, redirect to signup
      toast({
        title: "Email required",
        description: "Please sign up first to verify your email.",
        variant: "destructive"
      });
      navigate('/signup');
      return;
    }

    // If user is already verified, redirect to home
    if (session?.user?.email_confirmed_at) {
      toast({
        title: "Already verified",
        description: "Your email is already verified!",
      });
      navigate('/');
    }
  }, [searchParams, session, navigate, toast]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendCountdown]);

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast({
        title: 'Invalid code',
        description: 'Please enter a 6-digit verification code',
        variant: 'destructive',
      });
      return;
    }

    setIsVerifying(true);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email,
        token: otp,
        type: 'signup',
      });

      if (error) {
        toast({
          title: 'Verification failed',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Email verified!',
        description: 'Your account has been verified successfully.',
      });

      // Redirect to home
      navigate('/');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email) {
      toast({
        title: 'Email required',
        description: 'Please enter your email address',
        variant: 'destructive',
      });
      return;
    }

    setIsResending(true);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/verify-email`,
        },
      });

      if (error) {
        toast({
          title: 'Failed to resend',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Code sent!',
        description: 'A new verification code has been sent to your email.',
      });
      
      // Reset countdown
      setResendCountdown(60);
      setCanResend(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to resend verification code',
        variant: 'destructive',
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <>
      <SEOHead
        title="Verify Email - LocalJobzz"
        description="Verify your email address to complete your LocalJobzz account setup."
      />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Back Button */}
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Login</span>
          </Link>

          {/* Verification Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-8 text-white text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-white/20 p-4 rounded-full">
                  <Mail className="h-8 w-8" />
                </div>
              </div>
              <h1 className="text-3xl font-bold mb-2">Verify Your Email</h1>
              <p className="text-orange-100">
                We've sent a 6-digit code to
              </p>
              {email && (
                <p className="text-white font-semibold mt-1">{email}</p>
              )}
            </div>

            {/* Content */}
            <div className="p-8">
              <div className="text-center mb-6">
                <p className="text-gray-600 mb-4">
                  Enter the verification code from your email
                </p>

                {/* OTP Input */}
                <div className="flex justify-center mb-6">
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={(value) => setOtp(value)}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                {/* Verify Button */}
                <button
                  onClick={handleVerifyOTP}
                  disabled={isVerifying || otp.length !== 6}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                >
                  {isVerifying ? 'Verifying...' : 'Verify Email'}
                </button>

                {/* Resend Code */}
                <div className="text-center">
                  <p className="text-gray-600 text-sm mb-2">
                    Didn't receive the code?
                  </p>
                  <button
                    onClick={handleResendOTP}
                    disabled={isResending || !canResend}
                    className="text-orange-500 font-semibold hover:text-orange-600 text-sm disabled:opacity-50"
                  >
                    {isResending 
                      ? 'Sending...' 
                      : canResend 
                        ? 'Resend Code' 
                        : `Resend in ${resendCountdown}s`
                    }
                  </button>
                </div>
              </div>

              {/* Help Text */}
              <div className="mt-6 p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600 text-center">
                  <strong>Note:</strong> Check your spam folder if you don't see the email.
                  The code expires in 60 minutes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default VerifyEmail;
