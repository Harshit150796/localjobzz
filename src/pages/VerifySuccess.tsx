import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";

const VerifySuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setStatus("error");
        setMessage("No verification token provided");
        return;
      }

      try {
        console.log('Verifying token...');
        
        const { data, error } = await supabase.functions.invoke('verify-magic-token', {
          body: { token }
        });

        if (error) throw error;

        if (data.success) {
          setStatus("success");
          setMessage(data.alreadyVerified 
            ? "Your email was already verified!" 
            : "Your email has been successfully verified!");

          // Start countdown for redirect
          let count = 3;
          const countdownInterval = setInterval(() => {
            count--;
            setCountdown(count);
            
            if (count <= 0) {
              clearInterval(countdownInterval);
              navigate("/");
            }
          }, 1000);

          return () => clearInterval(countdownInterval);
        } else {
          throw new Error(data.error || "Verification failed");
        }
      } catch (error: any) {
        console.error('Verification error:', error);
        setStatus("error");
        setMessage(error.message || "Failed to verify email. The link may have expired.");
      }
    };

    verifyToken();
  }, [token, navigate]);

  return (
    <>
      <SEOHead
        title="Email Verification - LocalJobzz"
        description="Verifying your email address"
      />
      
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-20 h-20 rounded-full flex items-center justify-center">
              {status === "loading" && (
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
              )}
              {status === "success" && (
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-12 h-12 text-green-500" />
                </div>
              )}
              {status === "error" && (
                <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center">
                  <XCircle className="w-12 h-12 text-destructive" />
                </div>
              )}
            </div>
            
            <CardTitle className="text-2xl">
              {status === "loading" && "Verifying Your Email..."}
              {status === "success" && "Email Verified! ✅"}
              {status === "error" && "Verification Failed"}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6 text-center">
            <p className="text-muted-foreground">
              {message}
            </p>

            {status === "success" && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Redirecting to dashboard in <span className="font-mono font-semibold text-primary">{countdown}</span> seconds...
                </p>
                <Button 
                  onClick={() => navigate("/")}
                  className="w-full"
                >
                  Go to Dashboard Now
                </Button>
              </div>
            )}

            {status === "error" && (
              <div className="space-y-3">
                <Button 
                  onClick={() => navigate("/signup")}
                  className="w-full"
                >
                  Sign Up Again
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => navigate("/")}
                  className="w-full"
                >
                  Back to Home
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default VerifySuccess;