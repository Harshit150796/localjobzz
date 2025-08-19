import React, { useState } from 'react';
import { MapPin, Phone, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useJobs } from '../contexts/JobContext';
import JobSuccessModal from '../components/JobSuccessModal';

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
  
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [citySearchTerm, setCitySearchTerm] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const jobTypes = [
    'Household Work', 'Delivery & Transport', 'Construction', 'Shop Assistant', 
    'Security Guard', 'Cooking', 'Cleaning', 'Gardening', 'Painting', 'Other'
  ];

  const citiesByState = {
    'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Rajahmundry', 'Kadapa', 'Kakinada', 'Anantapur', 'Vizianagaram', 'Eluru', 'Ongole', 'Nandyal', 'Machilipatnam', 'Adoni', 'Tenali', 'Chittoor', 'Hindupur', 'Proddatur', 'Bhimavaram'],
    'Arunachal Pradesh': ['Itanagar', 'Naharlagun', 'Pasighat', 'Aalo', 'Bomdila', 'Tawang', 'Ziro', 'Basar', 'Khonsa', 'Tezu'],
    'Assam': ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tinsukia', 'Tezpur', 'Bongaigaon', 'Dhubri', 'Karimganj', 'North Lakhimpur', 'Sivasagar', 'Goalpara', 'Barpeta', 'Mangaldoi'],
    'Bihar': ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Darbhanga', 'Bihar Sharif', 'Arrah', 'Begusarai', 'Katihar', 'Munger', 'Chhapra', 'Danapur', 'Saharsa', 'Hajipur', 'Sasaram', 'Dehri', 'Siwan', 'Motihari', 'Nawada'],
    'Chhattisgarh': ['Raipur', 'Bhilai', 'Korba', 'Bilaspur', 'Durg', 'Rajnandgaon', 'Jagdalpur', 'Raigarh', 'Ambikapur', 'Mahasamund', 'Chirmiri', 'Dhamtari', 'Kanker', 'Kawardha'],
    'Goa': ['Panaji', 'Vasco da Gama', 'Margao', 'Mapusa', 'Ponda', 'Bicholim', 'Curchorem', 'Sanquelim'],
    'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Junagadh', 'Gandhidham', 'Anand', 'Navsari', 'Morbi', 'Nadiad', 'Surendranagar', 'Bharuch', 'Mehsana', 'Bhuj', 'Porbandar', 'Palanpur', 'Valsad', 'Vapi', 'Gondal', 'Veraval', 'Godhra', 'Patan', 'Kalol'],
    'Haryana': ['Faridabad', 'Gurgaon', 'Panipat', 'Ambala', 'Yamunanagar', 'Rohtak', 'Hisar', 'Karnal', 'Sonipat', 'Panchkula', 'Bhiwani', 'Sirsa', 'Bahadurgarh', 'Jind', 'Thanesar', 'Kaithal', 'Rewari', 'Narnaul'],
    'Himachal Pradesh': ['Shimla', 'Mandi', 'Solan', 'Nahan', 'Bilaspur', 'Kullu', 'Hamirpur', 'Una', 'Kangra', 'Dharamshala', 'Palampur', 'Baddi', 'Parwanoo', 'Manali'],
    'Jharkhand': ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Deoghar', 'Phusro', 'Hazaribagh', 'Giridih', 'Ramgarh', 'Medininagar', 'Chirkunda'],
    'Karnataka': ['Bangalore', 'Mysore', 'Hubli-Dharwad', 'Mangalore', 'Belgaum', 'Gulbarga', 'Davanagere', 'Bellary', 'Bijapur', 'Shivamogga', 'Tumkur', 'Raichur', 'Bidar', 'Hospet', 'Gadag-Betageri', 'Udupi', 'Robertsonpet', 'Hassan', 'Bhadravati', 'Chitradurga', 'Kolar', 'Mandya', 'Chikmagalur', 'Gangavati', 'Bagalkot'],
    'Kerala': ['Kochi', 'Thiruvananthapuram', 'Kozhikode', 'Kollam', 'Thrissur', 'Alappuzha', 'Palakkad', 'Manjeri', 'Thalassery', 'Ponnani', 'Vatakara', 'Kanhangad', 'Payyanur', 'Koyilandy', 'Parappanangadi', 'Kalamassery', 'Neyyattinkara', 'Kayamkulam', 'Nedumangad', 'Kannur', 'Tirur', 'Kottayam', 'Kasaragod', 'Kunnamkulam', 'Ottappalam', 'Thiruvalla', 'Thodupuzha', 'Chalakudy', 'Changanassery', 'Punalur'],
    'Madhya Pradesh': ['Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Dewas', 'Satna', 'Ratlam', 'Rewa', 'Murwara', 'Singrauli', 'Burhanpur', 'Khandwa', 'Bhind', 'Chhindwara', 'Guna', 'Shivpuri', 'Vidisha', 'Chhatarpur', 'Damoh', 'Mandsaur', 'Khargone', 'Neemuch', 'Pithampur', 'Narmadapuram', 'Itarsi', 'Sehore', 'Morena', 'Betul', 'Seoni', 'Datia', 'Nagda'],
    'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Aurangabad', 'Solapur', 'Amravati', 'Navi Mumbai', 'Kolhapur', 'Akola', 'Latur', 'Dhule', 'Ahmednagar', 'Chandrapur', 'Parbhani', 'Jalgaon', 'Bhiwandi', 'Nanded', 'Malegaon', 'Sangli', 'Jalna', 'Ulhasnagar', 'Satara', 'Ichalkaranji', 'Ambernath', 'Bhusawal', 'Panvel', 'Badlapur', 'Beed', 'Gondia', 'Wardha', 'Yavatmal', 'Achalpur', 'Osmanabad', 'Nandurbar', 'Washim', 'Hinganghat', 'Gadchiroli', 'Aurangabad'],
    'Manipur': ['Imphal', 'Thoubal', 'Lilong', 'Mayang Imphal'],
    'Meghalaya': ['Shillong', 'Tura', 'Nongstoin', 'Jowai'],
    'Mizoram': ['Aizawl', 'Lunglei', 'Saiha'],
    'Nagaland': ['Kohima', 'Dimapur', 'Mokokchung', 'Tuensang', 'Wokha', 'Zunheboto'],
    'Odisha': ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur', 'Puri', 'Balasore', 'Bhadrak', 'Baripada', 'Jharsuguda', 'Jeypore', 'Barbil', 'Khordha', 'Balangir', 'Rayagada', 'Bhawanipatna', 'Dhenkanal', 'Paradip', 'Kendujhar'],
    'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali', 'Firozpur', 'Batala', 'Pathankot', 'Moga', 'Abohar', 'Malerkotla', 'Khanna', 'Phagwara', 'Muktsar', 'Barnala', 'Rajpura', 'Hoshiarpur', 'Kapurthala', 'Faridkot', 'Sunam'],
    'Rajasthan': ['Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Ajmer', 'Udaipur', 'Bhilwara', 'Alwar', 'Bharatpur', 'Sikar', 'Pali', 'Tonk', 'Kishangarh', 'Beawar', 'Hanumangarh', 'Sri Ganganagar', 'Sawai Madhopur', 'Jhunjhunu', 'Bharatpur', 'Banswara', 'Dhaulpur', 'Gangapur City', 'Chittorgarh', 'Makrana', 'Sujangarh', 'Sardarshahar'],
    'Sikkim': ['Gangtok', 'Namchi', 'Gyalshing', 'Mangan'],
    'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Tiruppur', 'Erode', 'Vellore', 'Thoothukudi', 'Thanjavur', 'Nagercoil', 'Kanchipuram', 'Kumarakonam', 'Karur', 'Udhagamandalam', 'Hosur', 'Tambaram', 'Avadi', 'Tiruvottiyur', 'Ambattur', 'Anna Nagar', 'Velachery', 'Pallavaram', 'Chrompet', 'Madipakkam', 'Adyar', 'Manali', 'Valasaravakkam', 'Alandur', 'Nanganallur', 'Meenambakkam', 'Gerugambakkam', 'Mudichur', 'Vandalur', 'Minjur', 'Sholinghur', 'Gummidipoondi'],
    'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Khammam', 'Karimnagar', 'Ramagundam', 'Mahbubnagar', 'Nalgonda', 'Adilabad', 'Suryapet', 'Miryalaguda', 'Jagtial', 'Mancherial', 'Nirmal', 'Kothagudem', 'Bodhan', 'Sangareddy', 'Metpally', 'Zahirabad', 'Medak', 'Kamareddy', 'Vikarabad'],
    'Tripura': ['Agartala', 'Dharmanagar', 'Udaipur', 'Kailasahar', 'Belonia', 'Khowai'],
    'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Ghaziabad', 'Agra', 'Meerut', 'Varanasi', 'Allahabad', 'Bareilly', 'Aligarh', 'Moradabad', 'Saharanpur', 'Gorakhpur', 'Noida', 'Firozabad', 'Loni', 'Jhansi', 'Muzaffarnagar', 'Mathura', 'Shahjahanpur', 'Rampur', 'Mau', 'Farrukhabad', 'Hapur', 'Etawah', 'Mirzapur', 'Bulandshahr', 'Sambhal', 'Amroha', 'Hardoi', 'Fatehpur', 'Raebareli', 'Orai', 'Sitapur', 'Bahraich', 'Modinagar', 'Unnao', 'Jaunpur', 'Lakhimpur', 'Hathras', 'Banda', 'Pilibhit', 'Barabanki', 'Khurja', 'Gonda', 'Mainpuri', 'Lalitpur', 'Etah', 'Deoria', 'Ujhani', 'Ghazipur', 'Sultanpur', 'Azamgarh', 'Bijnor', 'Sahaswan', 'Basti', 'Chandausi', 'Akbarpur', 'Ballia', 'Tanda', 'Greater Noida', 'Shikohabad', 'Shamli', 'Awagarh', 'Kasganj'],
    'Uttarakhand': ['Dehradun', 'Haridwar', 'Roorkee', 'Haldwani-cum-Kathgodam', 'Rudrapur', 'Kashipur', 'Rishikesh', 'Kotdwara', 'Ramnagar', 'Pithoragarh', 'Jaspur', 'Kichha'],
    'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Maheshtala', 'Rajpur Sonarpur', 'South Dumdum', 'Bhatpara', 'Panihati', 'Kamarhati', 'Bardhaman', 'Kulti', 'Baranagar', 'North Dumdum', 'Bally', 'Serampore', 'Naihati', 'Englishbazar', 'Raiganj', 'Kharagpur', 'Haldia', 'Ranaghat', 'Shimoga', 'Alipurduar', 'Purulia', 'Jangipur', 'Bolpur', 'Basirhat', 'Bankura', 'Tamluk', 'Midnapore', 'Cooch Behar'],
    'Delhi': ['New Delhi', 'Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi', 'Central Delhi', 'North East Delhi', 'North West Delhi', 'South East Delhi', 'South West Delhi'],
    'Jammu and Kashmir': ['Srinagar', 'Jammu', 'Baramulla', 'Anantnag', 'Sopore', 'KathuaUdhampur', 'Punch', 'Rajauri'],
    'Ladakh': ['Leh', 'Kargil'],
    'Puducherry': ['Puducherry', 'Oulgaret', 'Karaikal', 'Mahe', 'Yanam'],
    'Chandigarh': ['Chandigarh'],
    'Dadra and Nagar Haveli': ['Silvassa'],
    'Daman and Diu': ['Daman', 'Diu'],
    'Lakshadweep': ['Kavaratti'],
    'Andaman and Nicobar Islands': ['Port Blair']
  };

  // Flatten all cities for easy mapping
  const allCities = Object.entries(citiesByState).flatMap(([state, cities]) => 
    cities.map(city => `${city}, ${state}`)
  );

  // Filter cities based on search term - use current input value if searching, otherwise show all
  const searchTerm = citySearchTerm || formData.location;
  const filteredCities = allCities.filter(city =>
    city.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 10); // Limit to 10 results for performance

  const handleCityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCitySearchTerm(value);
    setFormData({...formData, location: value});
    setShowCityDropdown(value.length > 0);
  };

  const handleCitySelect = (city: string) => {
    setFormData({...formData, location: city});
    setCitySearchTerm('');
    setShowCityDropdown(false);
  };

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
    
    // Show success modal
    setShowSuccessModal(true);
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
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
  };

  const handleViewJob = () => {
    setShowSuccessModal(false);
    navigate('/category/jobs');
  };

  const handlePostAnother = () => {
    setShowSuccessModal(false);
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
                  <input
                    type="text"
                    value={formData.location}
                    onChange={handleCityInputChange}
                    onFocus={() => setShowCityDropdown(true)}
                    onBlur={() => setTimeout(() => setShowCityDropdown(false), 200)}
                    placeholder="Type or select your city"
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                  
                   {/* Dropdown List */}
                   {showCityDropdown && filteredCities.length > 0 && (
                     <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                       {filteredCities.map((city, index) => (
                         <div
                           key={index}
                           onMouseDown={(e) => {
                             e.preventDefault(); // Prevent blur event
                             handleCitySelect(city);
                           }}
                           className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                         >
                           {city}
                         </div>
                       ))}
                     </div>
                   )}
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
      
      {/* Success Modal */}
      <JobSuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
        onViewJob={handleViewJob}
        onPostAnother={handlePostAnother}
      />
    </div>
  );
};

export default PostAd;
