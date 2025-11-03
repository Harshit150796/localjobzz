import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Phone, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';
import SEOHead from '../components/SEOHead';
import { supabase } from '@/integrations/supabase/client';

// Social provider icons
const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg className="h-5 w-5" fill="#1877F2" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const TwitterIcon = () => (
  <svg className="h-5 w-5" fill="#000000" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const Signup = () => {
  const navigate = useNavigate();
  const { register, loginWithGoogle, loginWithFacebook, loginWithTwitter, user } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    emailOrPhone: '',
    password: ''
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const isEmail = (input: string) => {
    return input.includes('@');
  };

  const isPhone = (input: string) => {
    return /^[\d\s\-\+\(\)]+$/.test(input) && input.replace(/\D/g, '').length >= 10;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (!formData.name || !formData.emailOrPhone) {
        toast({ title: "Please fill all fields", variant: "destructive" });
        return;
      }
      
      let email = formData.emailOrPhone;
      let phone: string | undefined;
      
      if (isPhone(formData.emailOrPhone)) {
        const cleanPhone = formData.emailOrPhone.replace(/\D/g, '');
        email = `${cleanPhone}@phone.localjobzz`;
        phone = formData.emailOrPhone;
      } else if (!isEmail(formData.emailOrPhone)) {
        toast({ 
          title: "Invalid input", 
          description: "Please enter a valid email or phone number",
          variant: "destructive" 
        });
        return;
      }
      
      const result = await register({
        name: formData.name,
        email: email,
        phone: phone,
        password: formData.password
      });
      
      if (result.success) {
        // Store password temporarily for auto-login after verification
        sessionStorage.setItem('temp_password', formData.password);
        
        // Get current session to get user ID
        const { data: sessionData } = await supabase.auth.getSession();
        const userId = sessionData?.session?.user?.id;
        
        // Generate magic link with improved error handling and retry logic
        let magicSuccess = false;
        let retryCount = 0;
        const maxRetries = 2;
        
        while (!magicSuccess && retryCount <= maxRetries) {
          try {
            console.log(`[Attempt ${retryCount + 1}/${maxRetries + 1}] Generating magic link for:`, email);
            
            const { data: magicData, error: magicError } = await supabase.functions.invoke('generate-magic-link', {
              body: { 
                email, 
                userId: userId,
                name: formData.name
              }
            });

            if (magicError) {
              console.error(`[Attempt ${retryCount + 1}] Magic link error:`, magicError);
              
              if (retryCount < maxRetries) {
                // Wait 2 seconds before retrying
                console.log('Waiting 2 seconds before retry...');
                await new Promise(resolve => setTimeout(resolve, 2000));
                retryCount++;
                continue;
              } else {
                // All retries failed, fallback to OTP
                console.error('All magic link attempts failed, falling back to OTP');
                toast({ 
                  title: "Account created!", 
                  description: "Please check your email for a verification code.",
                  duration: 10000
                });
                setTimeout(() => {
                  navigate(`/verify-email?email=${encodeURIComponent(email)}`);
                }, 2000);
                break;
              }
            } else {
              // Success!
              console.log('Magic link generated successfully:', magicData);
              magicSuccess = true;
              
              toast({ 
                title: "Account created! 🎉", 
                description: "Check your email for a verification link with welcome guide.",
                duration: 5000
              });
              
              setTimeout(() => {
                navigate(`/waiting-verification?email=${encodeURIComponent(email)}`);
              }, 1000);
            }
          } catch (err) {
            console.error(`[Attempt ${retryCount + 1}] Exception in magic link generation:`, err);
            
            if (retryCount < maxRetries) {
              await new Promise(resolve => setTimeout(resolve, 2000));
              retryCount++;
            } else {
              // Network error after all retries - fallback to OTP
              toast({ 
                title: "Network issue", 
                description: "Falling back to manual verification. Check your email for a code.",
                variant: "default"
              });
              navigate(`/verify-email?email=${encodeURIComponent(email)}`);
              break;
            }
          }
        }
      } else {
        // Handle specific error cases
        if (result.message.includes('already registered') || result.message.includes('already exists')) {
          toast({ 
            title: "Email already exists", 
            description: "This email is already registered. Please login instead.",
            variant: "destructive" 
          });
        } else if (result.message.includes('timeout') || result.message.includes('timed out')) {
          toast({ 
            title: "Slow network", 
            description: "Signup is taking longer than expected. Please wait...",
            variant: "default" 
          });
        } else {
          toast({ 
            title: "Registration failed", 
            description: result.message, 
            variant: "destructive" 
          });
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'twitter') => {
    setIsSubmitting(true);
    try {
      let result;
      if (provider === 'google') {
        result = await loginWithGoogle();
      } else if (provider === 'facebook') {
        result = await loginWithFacebook();
      } else {
        result = await loginWithTwitter();
      }

      if (!result.success) {
        toast({ 
          title: "Login failed", 
          description: result.message, 
          variant: "destructive" 
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <>
      <SEOHead 
        title="Sign Up - LocalJobzz"
        description="Create your LocalJobzz account to post local jobs, find work opportunities, and connect with the community across India."
      />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Back Button */}
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>

          {/* Signup Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-8 text-white">
              <h1 className="text-3xl font-bold mb-2">Join LocalJobzz</h1>
              <p className="text-orange-100">Create your account in seconds</p>
            </div>

            {/* Content */}
            <div className="p-8">
              {/* Social Login Buttons */}
              <div className="space-y-3 mb-6">
                <button
                  type="button"
                  onClick={() => handleSocialLogin('google')}
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <GoogleIcon />
                  <span className="font-medium text-gray-700">Continue with Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSocialLogin('facebook')}
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FacebookIcon />
                  <span className="font-medium text-gray-700">Continue with Facebook</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSocialLogin('twitter')}
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <TwitterIcon />
                  <span className="font-medium text-gray-700">Continue with X</span>
                </button>
              </div>

              {/* Divider */}
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or sign up with email</span>
                </div>
              </div>

              {/* Signup Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email or Phone Number
                  </label>
                  <div className="relative">
                    {formData.emailOrPhone && isPhone(formData.emailOrPhone) ? (
                      <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    ) : (
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    )}
                    <input
                      type="text"
                      name="emailOrPhone"
                      value={formData.emailOrPhone}
                      onChange={handleInputChange}
                      placeholder="Enter your email or phone number"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Create a strong password"
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

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Creating account...' : 'Create Account'}
                </button>
              </form>

              {/* Login Link */}
              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Already have an account?{' '}
                  <Link to="/login" className="text-orange-500 font-semibold hover:text-orange-600">
                    Sign In
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Signup;
