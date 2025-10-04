import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, Phone, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/use-toast';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    emailOrPhone: '',
    password: ''
  });

  const { login, register } = useAuth();
  const { toast } = useToast();

  // Sync mode with initialMode prop when modal opens or initialMode changes
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setFormData({ name: '', emailOrPhone: '', password: '' });
      setShowPassword(false);
      setIsSubmitting(false);
    }
  }, [isOpen, initialMode]);

  // Detect if input is email or phone
  const isEmail = (input: string) => {
    return input.includes('@');
  };

  const isPhone = (input: string) => {
    // Basic phone validation: contains mostly numbers and possibly +, -, (), spaces
    return /^[\d\s\-\+\(\)]+$/.test(input) && input.replace(/\D/g, '').length >= 10;
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (mode === 'login') {
        // For login, accept both email and phone
        let loginEmail = formData.emailOrPhone;
        
        // If it's a phone number, convert to synthetic email format
        if (isPhone(formData.emailOrPhone)) {
          const cleanPhone = formData.emailOrPhone.replace(/\D/g, '');
          loginEmail = `${cleanPhone}@phone.localjobzz`;
        }
        
        const result = await login(loginEmail, formData.password);
        if (result.success) {
          toast({ title: "Welcome back!", description: result.message });
          onClose();
          setFormData({ name: '', emailOrPhone: '', password: '' });
        } else {
          toast({ title: "Login failed", description: result.message, variant: "destructive" });
        }
      } else {
        if (!formData.name || !formData.emailOrPhone) {
          toast({ title: "Please fill all fields", variant: "destructive" });
          return;
        }
        
        // Determine if input is email or phone
        let email = formData.emailOrPhone;
        let phone: string | undefined;
        
        if (isPhone(formData.emailOrPhone)) {
          // User entered phone - create synthetic email
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
          toast({ title: "Account created!", description: result.message });
          onClose();
          setFormData({ name: '', emailOrPhone: '', password: '' });
        } else {
          toast({ title: "Registration failed", description: result.message, variant: "destructive" });
        }
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {mode === 'register' && (
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
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {mode === 'register' ? 'Email or Phone Number' : 'Email or Phone'}
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
                placeholder={mode === 'register' ? 'Enter your email or phone number' : 'Enter your email or phone'}
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
            {isSubmitting ? 'Please wait...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        {/* Switch Mode */}
        <div className="px-6 pb-6 text-center">
          <p className="text-gray-600">
            {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
            <button
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setFormData({ name: '', emailOrPhone: '', password: '' });
              }}
              className="ml-2 text-orange-500 font-semibold hover:text-orange-600"
            >
          {mode === 'login' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;