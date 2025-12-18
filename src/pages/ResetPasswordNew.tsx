import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { KeyRound, Lock, Eye, EyeOff, ArrowLeft, Check, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import SEOHead from '@/components/SEOHead';
import { Button } from '@/components/ui/button';

const ResetPasswordNew = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');

  useEffect(() => {
    const emailParam = searchParams.get('email') || sessionStorage.getItem('reset_email');
    const token = sessionStorage.getItem('reset_token');
    
    if (!emailParam || !token) {
      toast({
        title: "Invalid session",
        description: "Please start the password reset process again",
        variant: "destructive"
      });
      navigate('/forgot-password');
      return;
    }
    
    setEmail(emailParam);
    setResetToken(token);
  }, [searchParams, navigate, toast]);

  // Password validation
  const passwordValidation = {
    minLength: password.length >= 8,
    match: password === confirmPassword && confirmPassword.length > 0
  };

  const isFormValid = passwordValidation.minLength && passwordValidation.match;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid) {
      toast({
        title: "Invalid password",
        description: "Please ensure your password meets all requirements",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('reset-password', {
        body: { 
          email, 
          resetToken, 
          newPassword: password 
        }
      });

      if (error || !data?.success) {
        throw new Error(data?.error || error?.message || 'Failed to reset password');
      }

      // Clear session storage
      sessionStorage.removeItem('reset_email');
      sessionStorage.removeItem('reset_token');

      toast({
        title: "Password reset successful! 🎉",
        description: "You can now login with your new password"
      });

      // Redirect to login with email pre-filled
      navigate(`/login?email=${encodeURIComponent(email)}`);

    } catch (error: any) {
      console.error('Password reset error:', error);
      toast({
        title: "Reset failed",
        description: error.message || "Failed to reset password. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEOHead 
        title="Set New Password - LocalJobzz"
        description="Create your new password for LocalJobzz"
      />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Back Button */}
          <Link 
            to="/forgot-password" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Start Over</span>
          </Link>

          {/* Reset Password Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-8 text-white text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-white/20 p-4 rounded-full">
                  <KeyRound className="h-8 w-8" />
                </div>
              </div>
              <h1 className="text-3xl font-bold mb-2">Set New Password</h1>
              <p className="text-orange-100">
                Create a strong password for your account
              </p>
            </div>

            {/* Content */}
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Password Requirements */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <p className="text-sm font-medium text-gray-700 mb-2">Password requirements:</p>
                  <div className="flex items-center gap-2">
                    {passwordValidation.minLength ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <X className="h-4 w-4 text-gray-300" />
                    )}
                    <span className={`text-sm ${passwordValidation.minLength ? 'text-green-600' : 'text-gray-500'}`}>
                      At least 8 characters
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {passwordValidation.match ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <X className="h-4 w-4 text-gray-300" />
                    )}
                    <span className={`text-sm ${passwordValidation.match ? 'text-green-600' : 'text-gray-500'}`}>
                      Passwords match
                    </span>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting || !isFormValid}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-200 disabled:opacity-50"
                  size="lg"
                >
                  {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
                </Button>
              </form>

              {/* Security Notice */}
              <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-sm text-orange-800 text-center">
                  🔒 Your password will be securely encrypted
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResetPasswordNew;
