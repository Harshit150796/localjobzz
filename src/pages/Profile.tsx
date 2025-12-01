import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Save, ArrowLeft, LogOut, Star, Briefcase } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Header from '../components/Header';
import Footer from '../components/Footer';
import RatingStars from '../components/RatingStars';

const Profile: React.FC = () => {
  const { user, updateProfile, isLoading, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [ratingStats, setRatingStats] = useState<{
    averageWorkerRating: number | null;
    averageEmployerRating: number | null;
    totalWorkerReviews: number;
    totalEmployerReviews: number;
    totalJobsPosted: number;
    totalJobsCompleted: number;
  } | null>(null);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });

  useEffect(() => {
    if (user) {
      fetchRatingStats();
    }
  }, [user]);

  const fetchRatingStats = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('average_worker_rating, average_employer_rating, total_worker_reviews, total_employer_reviews, total_jobs_posted, total_jobs_completed')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      
      if (data) {
        setRatingStats({
          averageWorkerRating: data.average_worker_rating,
          averageEmployerRating: data.average_employer_rating,
          totalWorkerReviews: data.total_worker_reviews,
          totalEmployerReviews: data.total_employer_reviews,
          totalJobsPosted: data.total_jobs_posted,
          totalJobsCompleted: data.total_jobs_completed,
        });
      }
    } catch (error) {
      console.error('Error fetching rating stats:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await updateProfile(formData);
    if (result.success) {
      toast({ title: "Profile Updated", description: result.message });
    } else {
      toast({ title: "Update Failed", description: result.message, variant: "destructive" });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Please sign in to view your profile</h1>
          <Link to="/" className="text-orange-500 hover:text-orange-600">
            Go back to home
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link 
          to="/"
          className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>

        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-2xl">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{user.name}</h1>
              <p className="text-gray-600">Member since {new Date(user.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Rating Summary */}
        {ratingStats && (ratingStats.averageWorkerRating || ratingStats.averageEmployerRating) && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Your Reputation</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {ratingStats.averageWorkerRating && (
                <div className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Briefcase className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-1">As Worker</p>
                    <div className="flex items-center gap-2 mb-1">
                      <RatingStars value={ratingStats.averageWorkerRating} readonly size="sm" />
                      <span className="font-semibold text-lg">{ratingStats.averageWorkerRating.toFixed(1)}</span>
                    </div>
                    <p className="text-xs text-gray-500">{ratingStats.totalWorkerReviews} reviews • {ratingStats.totalJobsCompleted} jobs completed</p>
                  </div>
                </div>
              )}

              {ratingStats.averageEmployerRating && (
                <div className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="bg-green-100 p-3 rounded-full">
                    <Star className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-1">As Employer</p>
                    <div className="flex items-center gap-2 mb-1">
                      <RatingStars value={ratingStats.averageEmployerRating} readonly size="sm" />
                      <span className="font-semibold text-lg">{ratingStats.averageEmployerRating.toFixed(1)}</span>
                    </div>
                    <p className="text-xs text-gray-500">{ratingStats.totalEmployerReviews} reviews • {ratingStats.totalJobsPosted} jobs posted</p>
                  </div>
                </div>
              )}
            </div>

            <Link 
              to={`/user/${user.id}`}
              className="mt-4 text-sm text-orange-600 hover:text-orange-700 font-semibold inline-block"
            >
              View Public Profile →
            </Link>
          </div>
        )}

        {/* Profile Form */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Update Profile</h2>
          
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
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
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
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                'Updating...'
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </form>
        </div>

        {/* Account Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Account Actions</h2>
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="w-full bg-red-50 text-red-600 py-3 rounded-lg font-semibold hover:bg-red-100 transition-colors flex items-center justify-center border border-red-200"
          >
            <LogOut className="h-5 w-5 mr-2" />
            Sign Out
          </button>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Profile;