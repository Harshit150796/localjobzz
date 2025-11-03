import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Mail, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import SEOHead from "@/components/SEOHead";

const WaitingVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get("email");
  const [isPolling, setIsPolling] = useState(true);
  const [countdown, setCountdown] = useState(15 * 60); // 15 minutes in seconds
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (!email) {
      toast.error("No email provided");
      navigate("/signup");
      return;
    }

    // Countdown timer
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 0) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Polling for verification status
    let pollInterval: NodeJS.Timeout;
    
    const checkVerificationStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('magic_tokens')
          .select('verified_at, expires_at')
          .eq('email', email)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error('Error checking verification:', error);
          return;
        }

        if (data?.verified_at) {
          console.log('Email verified! Redirecting...');
          setIsPolling(false);
          clearInterval(pollInterval);
          
          toast.success("Email verified successfully!");
          
          // Sign in the user
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password: sessionStorage.getItem('temp_password') || '',
          });

          if (signInError) {
            console.error('Auto sign-in error:', signInError);
            navigate("/login");
          } else {
            sessionStorage.removeItem('temp_password');
            navigate("/");
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    };

    // Check immediately
    checkVerificationStatus();

    // Then poll every 3 seconds
    pollInterval = setInterval(checkVerificationStatus, 3000);

    return () => {
      clearInterval(pollInterval);
      clearInterval(countdownInterval);
    };
  }, [email, navigate]);

  const handleResend = async () => {
    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email || '',
      });

      if (error) throw error;

      toast.success("Verification email resent!");
      setCountdown(15 * 60); // Reset countdown
    } catch (error: any) {
      console.error('Error resending email:', error);
      toast.error(error.message || "Failed to resend email");
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <SEOHead
        title="Verify Your Email - LocalJobzz"
        description="Check your email and click the verification link to activate your account"
      />
      
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Check Your Email</CardTitle>
            <CardDescription className="text-base">
              We've sent a verification email to:
            </CardDescription>
            <p className="font-semibold text-foreground mt-2">{email}</p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Polling Status */}
            <div className="flex items-center justify-center space-x-2 text-muted-foreground">
              {isPolling && <Loader2 className="w-4 h-4 animate-spin" />}
              <p className="text-sm">
                {isPolling ? "Waiting for verification..." : "Redirecting..."}
              </p>
            </div>

            {/* Instructions */}
            <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium">What to do next:</p>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Open the email we sent you</li>
                <li>Click the "Verify Email" button</li>
                <li>You'll be automatically logged in</li>
              </ol>
            </div>

            {/* Countdown */}
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Link expires in: <span className="font-mono font-semibold">{formatTime(countdown)}</span>
              </p>
            </div>

            {/* Resend Button */}
            <Button
              variant="outline"
              className="w-full"
              onClick={handleResend}
              disabled={isResending}
            >
              {isResending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Resend Verification Email
                </>
              )}
            </Button>

            {/* Help Text */}
            <div className="text-center space-y-2">
              <p className="text-xs text-muted-foreground">
                Didn't receive the email? Check your spam folder or click resend above.
              </p>
              <Button
                variant="link"
                size="sm"
                onClick={() => navigate("/verify-email", { state: { email } })}
                className="text-xs"
              >
                Or enter verification code manually
              </Button>
            </div>

            <Button
              variant="ghost"
              className="w-full"
              onClick={() => navigate("/")}
            >
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default WaitingVerification;