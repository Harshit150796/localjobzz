import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, ArrowLeft, AlertCircle, Phone } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import SEOHead from '../components/SEOHead';

// Official Google "G" logo
const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const Signup = () => {
  const { toast } = useToast();
  const { signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [duplicateEmailError, setDuplicateEmailError] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });
  
  const from = (location.state as any)?.from || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({ 
        title: "Invalid email", 
        description: "Please enter a valid email address",
        variant: "destructive" 
      });
      return;
    }
    
    // Validate password strength (min 8 characters)
    if (formData.password.length < 8) {
      toast({ 
        title: "Password too short", 
        description: "Password must be at least 8 characters long",
        variant: "destructive" 
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-pending-registration', {
        body: {
          email: formData.email,
          name: formData.name,
          password: formData.password,
          phone: formData.phone || undefined
        }
      });
      
      // Debug logging
      console.log('Registration response:', { data, error });
      
      // Check for duplicate email FIRST (before any error throwing)
      if (data && data.success === false && data.error === 'EMAIL_ALREADY_EXISTS') {
        console.log('Duplicate email detected, showing alert');
        setDuplicateEmailError(true);
        setIsSubmitting(false);
        return;
      }

      // Also check canLogin flag as backup
      if (data && data.canLogin === true) {
        console.log('canLogin flag detected, showing alert');
        setDuplicateEmailError(true);
        setIsSubmitting(false);
        return;
      }

      // Handle general errors
      if (error) {
        throw new Error(error.message);
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to create account');
      }
      
      // Store email and password for verification page
      sessionStorage.setItem('verify_email', formData.email);
      sessionStorage.setItem('verify_password', formData.password);
      
      toast({
        title: "OTP Sent! 📧",
        description: "Check your email for the 6-digit verification code. Valid for 5 minutes."
      });
      
      navigate(`/verify-otp?email=${encodeURIComponent(formData.email)}`);
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: "Signup failed",
        description: error.message || 'Failed to create account',
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Clear duplicate email error when user changes the email
    if (e.target.name === 'email') {
      setDuplicateEmailError(false);
    }
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (error: any) {
      console.error('Google signup error:', error);
      toast({
        title: "Google Sign Up Failed",
        description: error.message || "Failed to sign up with Google. Please try again.",
        variant: "destructive"
      });
      setIsGoogleLoading(false);
    }
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
              <h1 className="text-3xl font-bold mb-2">
                {from === '/post-ad' ? 'Sign Up to Post Jobs' : 'Join LocalJobzz'}
              </h1>
              <p className="text-orange-100">
                {from === '/post-ad'
                  ? '✅ Enable messaging • Manage your jobs • Get more responses'
                  : 'Create your account to get started'}
              </p>
            </div>

            {/* Content */}
            <div className="p-8">
              {/* Duplicate Email Alert */}
              {duplicateEmailError && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-orange-800">Account Already Exists</h3>
                      <p className="text-sm text-orange-700 mt-1">
                        You've already created an account with <strong>{formData.email}</strong>.
                      </p>
                      <Link 
                        to={`/login?email=${encodeURIComponent(formData.email)}`}
                        className="inline-flex items-center gap-1 mt-2 text-orange-600 font-semibold hover:text-orange-700 transition-colors"
                      >
                        Sign In Instead →
                      </Link>
                    </div>
                  </div>
                </div>
              )}

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
                      minLength={2}
                      maxLength={100}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email address"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                      maxLength={255}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    We'll send you a verification code to this email
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter your phone number"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      maxLength={15}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    You can add or update this later in your profile
                  </p>
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
                      placeholder="Create a strong password (min 8 characters)"
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                      minLength={8}
                      maxLength={100}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Use at least 8 characters
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or sign up with</span>
                </div>
              </div>

              {/* Google OAuth Button */}
              <button
                type="button"
                onClick={handleGoogleSignup}
                disabled={isGoogleLoading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <GoogleIcon />
                <span className="font-medium text-gray-700">
                  {isGoogleLoading ? 'Connecting...' : 'Continue with Google'}
                </span>
              </button>

              {/* Login Link */}
              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Already have an account?{' '}
                  <Link to="/login" className="text-orange-500 font-semibold hover:text-orange-600">
                    Sign In
                  </Link>
                </p>
              </div>

              {/* Privacy Notice */}
              <div className="mt-6 text-xs text-gray-500 text-center">
                By signing up, you agree to receive verification emails from LocalJobzz
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Signup;
