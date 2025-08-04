import React, { useState } from 'react';
import { MapPin, Phone, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useJobs } from '../contexts/JobContext';

const PostAd = () => {
  const navigate = useNavigate();
  const { addJob } = useJobs();
  const [formData, setFormData] = useState({
    jobTitle: '',
    jobType: '',
    dailySalary: '',
    location: '',
    description: '',
    phone: '',
    urgency: 'normal' as 'normal' | 'urgent' | 'immediate'
  });

  const jobTypes = [
    'Household Work', 'Delivery & Transport', 'Construction', 'Shop Assistant', 
    'Security Guard', 'Cooking', 'Cleaning', 'Gardening', 'Painting', 'Other'
  ];

  const indianCities = [
    // Metropolitan Cities
    'Mumbai, Maharashtra', 'Delhi, Delhi', 'Bangalore, Karnataka', 'Hyderabad, Telangana',
    'Chennai, Tamil Nadu', 'Kolkata, West Bengal', 'Pune, Maharashtra', 'Ahmedabad, Gujarat',
    
    // Major Cities
    'Surat, Gujarat', 'Jaipur, Rajasthan', 'Lucknow, Uttar Pradesh', 'Kanpur, Uttar Pradesh',
    'Nagpur, Maharashtra', 'Indore, Madhya Pradesh', 'Thane, Maharashtra', 'Bhopal, Madhya Pradesh',
    'Visakhapatnam, Andhra Pradesh', 'Pimpri-Chinchwad, Maharashtra', 'Patna, Bihar', 'Vadodara, Gujarat',
    'Ghaziabad, Uttar Pradesh', 'Ludhiana, Punjab', 'Agra, Uttar Pradesh', 'Nashik, Maharashtra',
    'Faridabad, Haryana', 'Meerut, Uttar Pradesh', 'Rajkot, Gujarat', 'Kalyan-Dombivli, Maharashtra',
    'Vasai-Virar, Maharashtra', 'Varanasi, Uttar Pradesh', 'Srinagar, Jammu and Kashmir', 'Aurangabad, Maharashtra',
    'Dhanbad, Jharkhand', 'Amritsar, Punjab', 'Navi Mumbai, Maharashtra', 'Allahabad, Uttar Pradesh',
    'Ranchi, Jharkhand', 'Howrah, West Bengal', 'Coimbatore, Tamil Nadu', 'Jabalpur, Madhya Pradesh',
    'Gwalior, Madhya Pradesh', 'Vijayawada, Andhra Pradesh', 'Jodhpur, Rajasthan', 'Madurai, Tamil Nadu',
    'Raipur, Chhattisgarh', 'Kota, Rajasthan', 'Guwahati, Assam', 'Chandigarh, Chandigarh',
    'Solapur, Maharashtra', 'Hubli-Dharwad, Karnataka', 'Tiruchirappalli, Tamil Nadu', 'Bareilly, Uttar Pradesh',
    'Mysore, Karnataka', 'Tiruppur, Tamil Nadu', 'Gurgaon, Haryana', 'Aligarh, Uttar Pradesh',
    'Jalandhar, Punjab', 'Bhubaneswar, Odisha', 'Salem, Tamil Nadu', 'Warangal, Telangana',
    'Guntur, Andhra Pradesh', 'Bhiwandi, Maharashtra', 'Saharanpur, Uttar Pradesh', 'Gorakhpur, Uttar Pradesh',
    'Bikaner, Rajasthan', 'Amravati, Maharashtra', 'Noida, Uttar Pradesh', 'Jamshedpur, Jharkhand',
    'Bhilai, Chhattisgarh', 'Cuttack, Odisha', 'Firozabad, Uttar Pradesh', 'Kochi, Kerala',
    'Nellore, Andhra Pradesh', 'Bhavnagar, Gujarat', 'Dehradun, Uttarakhand', 'Durgapur, West Bengal',
    'Asansol, West Bengal', 'Rourkela, Odisha', 'Nanded, Maharashtra', 'Kolhapur, Maharashtra',
    'Ajmer, Rajasthan', 'Akola, Maharashtra', 'Gulbarga, Karnataka', 'Jamnagar, Gujarat',
    'Ujjain, Madhya Pradesh', 'Loni, Uttar Pradesh', 'Siliguri, West Bengal', 'Jhansi, Uttar Pradesh',
    'Ulhasnagar, Maharashtra', 'Jammu, Jammu and Kashmir', 'Sangli-Miraj & Kupwad, Maharashtra', 'Mangalore, Karnataka',
    'Erode, Tamil Nadu', 'Belgaum, Karnataka', 'Ambattur, Tamil Nadu', 'Tirunelveli, Tamil Nadu',
    'Malegaon, Maharashtra', 'Gaya, Bihar', 'Jalgaon, Maharashtra', 'Udaipur, Rajasthan',
    'Maheshtala, West Bengal', 'Davanagere, Karnataka', 'Kozhikode, Kerala', 'Kurnool, Andhra Pradesh',
    'Rajpur Sonarpur, West Bengal', 'Rajahmundry, Andhra Pradesh', 'Bokaro, Jharkhand', 'South Dumdum, West Bengal',
    'Bellary, Karnataka', 'Patiala, Punjab', 'Gopalpur, Odisha', 'Agartala, Tripura',
    'Bhagalpur, Bihar', 'Muzaffarnagar, Uttar Pradesh', 'Bhatpara, West Bengal', 'Panihati, West Bengal',
    'Latur, Maharashtra', 'Dhule, Maharashtra', 'Rohtak, Haryana', 'Korba, Chhattisgarh',
    'Bhilwara, Rajasthan', 'Berhampur, Odisha', 'Muzaffarpur, Bihar', 'Ahmednagar, Maharashtra',
    'Mathura, Uttar Pradesh', 'Kollam, Kerala', 'Avadi, Tamil Nadu', 'Kadapa, Andhra Pradesh',
    'Kamarhati, West Bengal', 'Sambalpur, Odisha', 'Bilaspur, Chhattisgarh', 'Shahjahanpur, Uttar Pradesh',
    'Satara, Maharashtra', 'Bijapur, Karnataka', 'Rampur, Uttar Pradesh', 'Shivamogga, Karnataka',
    'Chandrapur, Maharashtra', 'Junagadh, Gujarat', 'Thrissur, Kerala', 'Alwar, Rajasthan',
    'Bardhaman, West Bengal', 'Kulti, West Bengal', 'Kakinada, Andhra Pradesh', 'Nizamabad, Telangana',
    'Parbhani, Maharashtra', 'Tumkur, Karnataka', 'Khammam, Telangana', 'Ozhukarai, Puducherry',
    'Bihar Sharif, Bihar', 'Panipat, Haryana', 'Darbhanga, Bihar', 'Bally, West Bengal',
    'Aizawl, Mizoram', 'Dewas, Madhya Pradesh', 'Ichalkaranji, Maharashtra', 'Karnal, Haryana',
    'Bathinda, Punjab', 'Jalna, Maharashtra', 'Eluru, Andhra Pradesh', 'Kirari Suleman Nagar, Delhi',
    'Barabanki, Uttar Pradesh', 'Purnia, Bihar', 'Satna, Madhya Pradesh', 'Mau, Uttar Pradesh',
    'Sonipat, Haryana', 'Farrukhabad, Uttar Pradesh', 'Sagar, Madhya Pradesh', 'Rourkela, Odisha',
    'Durg, Chhattisgarh', 'Imphal, Manipur', 'Ratlam, Madhya Pradesh', 'Hapur, Uttar Pradesh',
    'Arrah, Bihar', 'Karimnagar, Telangana', 'Anantapur, Andhra Pradesh', 'Etawah, Uttar Pradesh',
    'Ambernath, Maharashtra', 'North Dumdum, West Bengal', 'Bharatpur, Rajasthan', 'Begusarai, Bihar',
    'New Delhi, Delhi', 'Gandhidham, Gujarat', 'Baranagar, West Bengal', 'Tiruvottiyur, Tamil Nadu',
    'Puducherry, Puducherry', 'Sikar, Rajasthan', 'Thoothukudi, Tamil Nadu', 'Rewa, Madhya Pradesh',
    'Mirzapur, Uttar Pradesh', 'Raichur, Karnataka', 'Pali, Rajasthan', 'Ramagundam, Telangana',
    'Silchar, Assam', 'Orai, Uttar Pradesh', 'Tonk, Rajasthan', 'Ramgarh, Jharkhand',
    'Vizianagaram, Andhra Pradesh', 'Katihar, Bihar', 'Kishangarh, Rajasthan', 'Serampore, West Bengal',
    'Kurnool, Andhra Pradesh', 'Ozhukarai, Puducherry', 'Sultanganj, Bihar'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Add job to context
    addJob({
      title: formData.jobTitle,
      jobType: formData.jobType,
      dailySalary: formData.dailySalary,
      location: formData.location,
      description: formData.description,
      phone: formData.phone,
      urgency: formData.urgency
    });

    console.log('Job posted:', formData);
    alert('Job posted successfully! You can now see it in the job listings.');
    
    // Reset form
    setFormData({
      jobTitle: '',
      jobType: '',
      dailySalary: '',
      location: '',
      description: '',
      phone: '',
      urgency: 'normal'
    });

    // Navigate to jobs page after 2 seconds
    setTimeout(() => {
      navigate('/category/jobs');
    }, 2000);
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
                  <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-gray-400 z-10" />
                  <select
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white appearance-none"
                    required
                  >
                    <option value="">Select your city</option>
                    {indianCities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
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
                    onChange={(e) => setFormData({...formData, urgency: e.target.value as 'normal' | 'urgent' | 'immediate'})}
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
                    onChange={(e) => setFormData({...formData, urgency: e.target.value as 'normal' | 'urgent' | 'immediate'})}
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
                    onChange={(e) => setFormData({...formData, urgency: e.target.value as 'normal' | 'urgent' | 'immediate'})}
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
