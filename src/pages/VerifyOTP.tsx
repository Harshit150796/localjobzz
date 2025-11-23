import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, ArrowLeft, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import SEOHead from '@/components/SEOHead';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { Button } from '@/components/ui/button';

const VerifyOTP = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [email, setEmail] = useState('');
  const [countdown, setCountdown] = useState(300); // 5 minutes = 300 seconds
  const [resendCountdown, setResendCountdown] = useState(0);
  const [canResend, setCanResend] = useState(true);
  const [remainingAttempts, setRemainingAttempts] = useState(5);
  const [remainingResends, setRemainingResends] = useState(3);

  useEffect(() => {
    const emailParam = searchParams.get('email') || sessionStorage.getItem('verify_email');
    if (!emailParam) {
      toast({
        title: "No email provided",
        description: "Please sign up first",
        variant: "destructive"
      });
      navigate('/signup');
      return;
    }
    setEmail(emailParam);
  }, [searchParams, navigate, toast]);

  // OTP expiry countdown (5 minutes)
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Resend cooldown (30 seconds)
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendCountdown]);

  // Auto-submit when 6 digits entered
  useEffect(() => {
    if (otp.length === 6) {
      handleVerifyOTP();
    }
  }, [otp]);

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const digits = pastedData.replace(/\D/g, '').slice(0, 6);
    setOtp(digits);
  };

  const maskEmail = (email: string) => {
    if (!email) return '';
    const [local, domain] = email.split('@');
    if (!local || !domain) return email;
    return `${local[0]}${'*'.repeat(Math.max(local.length - 1, 3))}@${domain}`;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: { email, otpCode: otp }
      });

      if (error || !data?.success) {
        const errorMsg = data?.error || error?.message || 'Invalid or expired OTP';
        
        // Update remaining attempts if mentioned in error
        const attemptsMatch = errorMsg.match(/(\d+) attempt/);
        if (attemptsMatch) {
          setRemainingAttempts(parseInt(attemptsMatch[1]));
        }
        
        toast({
          title: 'Verification failed',
          description: errorMsg,
          variant: 'destructive',
        });
        setOtp('');
        return;
      }

      // Account created! Now auto-login
      const password = sessionStorage.getItem('verify_password');
      
      if (password) {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (loginError) {
          console.error('Auto-login failed:', loginError);
          toast({
            title: 'Account created! 🎉',
            description: 'Please login to continue',
          });
          
          sessionStorage.removeItem('verify_email');
          sessionStorage.removeItem('verify_password');
          
          navigate('/login');
          return;
        }
      }

      sessionStorage.removeItem('verify_email');
      sessionStorage.removeItem('verify_password');

      toast({
        title: '✅ Email Verified Successfully!',
        description: 'Welcome to LocalJobzz! Redirecting...',
      });

      setTimeout(() => navigate('/'), 1500);

    } catch (error: any) {
      console.error('Verification error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Verification failed',
        variant: 'destructive',
      });
      setOtp('');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);

    try {
      const { data, error } = await supabase.functions.invoke('resend-otp', {
        body: { email }
      });

      if (error || !data?.success) {
        throw new Error(data?.error || error?.message || 'Failed to resend code');
      }

      if (data.remainingResends !== undefined) {
        setRemainingResends(data.remainingResends);
      }

      toast({
        title: 'Code sent! 📧',
        description: 'A new verification code has been sent to your email. Valid for 5 minutes.',
      });
      
      setCountdown(300); // Reset to 5 minutes
      setResendCountdown(30); // 30 second cooldown
      setCanResend(false);
      setOtp('');
      setRemainingAttempts(5); // Reset attempts with new OTP
    } catch (error: any) {
      console.error('Resend error:', error);
      toast({
        title: 'Failed to resend',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <>
      <SEOHead
        title="Verify Your Email - LocalJobzz"
        description="Enter your verification code to complete registration"
      />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <button
            onClick={() => navigate('/signup')}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Signup
          </button>

          <div className="bg-card rounded-2xl shadow-xl overflow-hidden border">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-8 text-white text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-white/20 p-4 rounded-full">
                  <Mail className="h-8 w-8" />
                </div>
              </div>
              <h1 className="text-3xl font-bold mb-2">Enter Verification Code</h1>
              <p className="text-orange-100">
                We sent a 6-digit code to
              </p>
              {email && (
                <p className="text-white font-semibold mt-1">{maskEmail(email)}</p>
              )}
            </div>

            {/* Content */}
            <div className="p-8">
              <div className="text-center mb-6">
                {/* Countdown Timer */}
                <div className="flex items-center justify-center gap-2 mb-4 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>
                    {countdown > 0 
                      ? `Expires in ${formatTime(countdown)}` 
                      : 'Code expired - please resend'
                    }
                  </span>
                </div>

                <p className="text-muted-foreground mb-6">
                  Enter the 6-digit code from your email
                </p>

                {/* OTP Input */}
                <div className="flex justify-center mb-4" onPaste={handlePaste}>
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={(value) => setOtp(value)}
                    disabled={isVerifying}
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

                {/* Remaining Attempts */}
                {remainingAttempts < 5 && (
                  <p className="text-sm text-orange-600 mb-4">
                    {remainingAttempts} {remainingAttempts === 1 ? 'attempt' : 'attempts'} remaining
                  </p>
                )}

                {/* Verify Button */}
                <Button
                  onClick={handleVerifyOTP}
                  disabled={isVerifying || otp.length !== 6 || countdown === 0}
                  className="w-full mb-4"
                  size="lg"
                >
                  {isVerifying ? 'Verifying...' : 'Verify & Create Account'}
                </Button>

                {/* Resend */}
                <div className="text-center">
                  <p className="text-muted-foreground text-sm mb-2">
                    Didn't receive the code?
                  </p>
                  <Button
                    variant="link"
                    onClick={handleResendOTP}
                    disabled={isResending || !canResend || resendCountdown > 0 || remainingResends === 0}
                    className="text-orange-500 hover:text-orange-600"
                  >
                    {isResending 
                      ? 'Sending...' 
                      : resendCountdown > 0
                        ? `Resend in ${resendCountdown}s`
                        : remainingResends === 0
                          ? 'Resend limit reached'
                          : `Resend Code (${remainingResends} left)`
                    }
                  </Button>
                </div>
              </div>

              {/* Help */}
              <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <p className="text-sm text-muted-foreground text-center">
                  <strong>Note:</strong> Check your spam folder if you don't see the email. Code expires in 5 minutes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default VerifyOTP;
