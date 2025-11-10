import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Phone, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';
import SEOHead from '../components/SEOHead';

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

const Login = () => {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    emailOrPhone: '',
    password: ''
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const isPhone = (input: string) => {
    return /^[\d\s\-\+\(\)]+$/.test(input) && input.replace(/\D/g, '').length >= 10;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      let loginEmail = formData.emailOrPhone;
      
      if (isPhone(formData.emailOrPhone)) {
        const cleanPhone = formData.emailOrPhone.replace(/\D/g, '');
        loginEmail = `${cleanPhone}@phone.localjobzz`;
      }
      
      const result = await login(loginEmail, formData.password);
      if (result.success) {
        toast({ title: "Welcome back!", description: result.message });
        navigate('/');
      } else {
        toast({ title: "Login failed", description: result.message, variant: "destructive" });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialLogin = async () => {
    toast({ 
      title: "Social Login Temporarily Unavailable", 
      description: "Social login is currently disabled. Please use email/password login.",
      variant: "destructive" 
    });
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
        title="Sign In - LocalJobzz"
        description="Sign in to your LocalJobzz account to post jobs, find work, and connect with local opportunities in India."
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

          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-8 text-white">
              <h1 className="text-3xl font-bold mb-2">Welcome Back!</h1>
              <p className="text-orange-100">Sign in to continue to LocalJobzz</p>
            </div>

            {/* Content */}
            <div className="p-8">
              {/* Social Login Buttons - Temporarily Disabled */}
              <div className="space-y-3 mb-6">
                <button
                  type="button"
                  onClick={handleSocialLogin}
                  disabled={true}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg transition-colors opacity-50 cursor-not-allowed"
                >
                  <GoogleIcon />
                  <span className="font-medium text-gray-700">Continue with Google</span>
                </button>

                <button
                  type="button"
                  onClick={handleSocialLogin}
                  disabled={true}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg transition-colors opacity-50 cursor-not-allowed"
                >
                  <FacebookIcon />
                  <span className="font-medium text-gray-700">Continue with Facebook</span>
                </button>

                <button
                  type="button"
                  onClick={handleSocialLogin}
                  disabled={true}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg transition-colors opacity-50 cursor-not-allowed"
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
                  <span className="px-2 bg-white text-gray-500">Or continue with email</span>
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email or Phone
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
                      placeholder="Enter your email or phone"
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
                      placeholder="Enter your password"
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
                  {isSubmitting ? 'Signing in...' : 'Sign In'}
                </button>
              </form>

              {/* Sign Up Link */}
              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Don't have an account?{' '}
                  <Link to="/signup" className="text-orange-500 font-semibold hover:text-orange-600">
                    Sign Up
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

export default Login;
