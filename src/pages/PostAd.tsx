
import React, { useState } from 'react';
import { MapPin, Phone, Briefcase } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const PostAd = () => {
  const [formData, setFormData] = useState({
    jobTitle: '',
    jobType: '',
    dailySalary: '',
    location: '',
    description: '',
    phone: '',
    urgency: 'normal'
  });

  const jobTypes = [
    'Household Work', 'Delivery & Transport', 'Construction', 'Shop Assistant', 
    'Security Guard', 'Cooking', 'Cleaning', 'Gardening', 'Painting', 'Other'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Job posted:', formData);
    alert('Job posted successfully! People will start contacting you soon.');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 p-6">
            <h1 className="text-3xl font-bold text-white">Post a Job</h1>
            <p className="text-white/90 mt-2">Find workers in 2 simple steps - It's completely FREE!</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Job Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What work do you need done? *
              </label>
              <input
                type="text"
                value={formData.jobTitle}
                onChange={(e) => setFormData({...formData, jobTitle: e.target.value})}
                placeholder="e.g., House cleaning, Food delivery, Construction helper"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            {/* Job Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Category *
              </label>
              <select
                value={formData.jobType}
                onChange={(e) => setFormData({...formData, jobType: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="">Select job type</option>
                {jobTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Salary and Location Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Daily Payment (₹) *
                </label>
                <input
                  type="number"
                  value={formData.dailySalary}
                  onChange={(e) => setFormData({...formData, dailySalary: e.target.value})}
                  placeholder="e.g., 500, 800, 1000"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="Area, City"
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Job Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Describe the work in detail. What exactly needs to be done?"
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Phone Number *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="Workers will call you directly"
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
            </div>

            {/* Urgency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How urgent is this job?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="flex items-center space-x-2 cursor-pointer border rounded-lg p-3 hover:bg-gray-50">
                  <input
                    type="radio"
                    name="urgency"
                    value="normal"
                    checked={formData.urgency === 'normal'}
                    onChange={(e) => setFormData({...formData, urgency: e.target.value})}
                    className="text-green-500 focus:ring-green-500"
                  />
                  <div>
                    <div className="font-medium">Normal</div>
                    <div className="text-sm text-gray-500">Within a week</div>
                  </div>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer border rounded-lg p-3 hover:bg-gray-50">
                  <input
                    type="radio"
                    name="urgency"
                    value="urgent"
                    checked={formData.urgency === 'urgent'}
                    onChange={(e) => setFormData({...formData, urgency: e.target.value})}
                    className="text-orange-500 focus:ring-orange-500"
                  />
                  <div>
                    <div className="font-medium">Urgent</div>
                    <div className="text-sm text-gray-500">Within 2-3 days</div>
                  </div>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer border rounded-lg p-3 hover:bg-gray-50">
                  <input
                    type="radio"
                    name="urgency"
                    value="immediate"
                    checked={formData.urgency === 'immediate'}
                    onChange={(e) => setFormData({...formData, urgency: e.target.value})}
                    className="text-red-500 focus:ring-red-500"
                  />
                  <div>
                    <div className="font-medium">Immediate</div>
                    <div className="text-sm text-gray-500">Today or tomorrow</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 px-6 rounded-lg text-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center space-x-2"
              >
                <Briefcase className="h-5 w-5" />
                <span>Post Job - Completely FREE</span>
              </button>
              <p className="text-center text-sm text-gray-500 mt-3">
                Your job will be visible to thousands of workers immediately
              </p>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PostAd;
