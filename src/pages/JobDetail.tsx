import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapPin, Clock, Phone, MessageCircle, AlertCircle, Star, ChevronLeft, ChevronRight, ImageIcon, Share2 } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEOHead from '../components/SEOHead';
import { Badge } from '../components/ui/badge';
import { useJobs } from '../contexts/JobContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';
import { createOrFindConversation } from '../utils/messageHelpers';
import { createJobPostingSchema, createBreadcrumbSchema } from '../components/StructuredData';
import { timeAgo } from '../utils/timeHelpers';
import ListingCard from '../components/ListingCard';

const JobDetail = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const { jobs } = useJobs();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const job = jobs.find(j => j.id === jobId);

  useEffect(() => {
    if (!job) {
      // Job not found, redirect to home after a brief delay
      const timer = setTimeout(() => navigate('/'), 3000);
      return () => clearTimeout(timer);
    }
  }, [job, navigate]);

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Job Not Found</h1>
          <p className="text-gray-600 mb-4">This job may have been filled or is no longer available.</p>
          <Link to="/" className="text-orange-600 hover:text-orange-700 font-semibold">
            ← Back to Home
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const displayImages = job.images && job.images.length > 0 ? job.images : [];

  const handleSendMessage = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to send messages",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }

    if (!job.user_id) {
      toast({ 
        title: "Error", 
        description: "Cannot contact job poster at this time",
        variant: "destructive" 
      });
      return;
    }

    if (user.id === job.user_id) {
      toast({ 
        title: "Notice", 
        description: "You cannot message your own job posting",
        variant: "default" 
      });
      return;
    }

    setIsCreatingConversation(true);
    
    try {
      const result = await createOrFindConversation(
        job.id,
        job.user_id,
        user.id
      );

      if (result.success && result.conversationId) {
        navigate(`/messages?conversation=${result.conversationId}`);
      } else {
        toast({ 
          title: "Error", 
          description: result.error || "Failed to start conversation",
          variant: "destructive" 
        });
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({ title: "Error", description: "Failed to start conversation", variant: "destructive" });
    } finally {
      setIsCreatingConversation(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/job/${job.id}`;
    const shareTitle = `${job.title} - ${job.location}`;
    const shareText = `Check out this job: ${job.title} in ${job.location}. Salary: ₹${job.daily_salary}/day`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        
        toast({
          title: "Shared successfully",
          description: "Job advertisement shared",
        });
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Error sharing:', error);
          copyToClipboard(shareUrl);
        }
      }
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Link copied!",
        description: "Job link copied to clipboard. You can now share it anywhere.",
      });
    } catch (error) {
      console.error('Failed to copy:', error);
      toast({
        title: "Error",
        description: "Failed to copy link. Please try again.",
        variant: "destructive",
      });
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % Math.max(displayImages.length, 3));
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + Math.max(displayImages.length, 3)) % Math.max(displayImages.length, 3));
  };


  // Get similar jobs (same category, exclude current)
  const similarJobs = jobs
    .filter(j => j.id !== job.id && j.category === job.category)
    .slice(0, 4);

  const breadcrumbSchema = createBreadcrumbSchema([
    { name: 'Home', url: 'https://localjobzz.com/' },
    { name: 'Jobs', url: 'https://localjobzz.com/jobs/all' },
    { name: job.title, url: `https://localjobzz.com/job/${job.id}` }
  ]);

  const jobPostingSchema = createJobPostingSchema({
    title: job.title,
    description: job.description,
    location: job.location,
    salary: job.daily_salary,
    category: job.category,
    datePosted: job.created_at,
    employmentType: job.job_type === 'full-time' ? 'FULL_TIME' : 'PART_TIME'
  });

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [breadcrumbSchema, jobPostingSchema]
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead
        title={`${job.title} - ${job.location} | localjobzz`}
        description={job.description}
        keywords={`${job.title}, ${job.location}, ${job.category}, daily job, local work`}
        structuredData={structuredData}
        canonicalUrl={`https://localjobzz.com/job/${job.id}`}
        ogImage={job.images?.[0]}
      />
      
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link to="/" className="text-gray-600 hover:text-orange-600 text-sm">Home</Link>
          <span className="text-gray-400 mx-2">/</span>
          <Link to="/jobs/all" className="text-gray-600 hover:text-orange-600 text-sm">Jobs</Link>
          <span className="text-gray-400 mx-2">/</span>
          <span className="text-gray-800 text-sm font-medium">{job.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{timeAgo(job.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{job.job_type}</Badge>
                    {job.category && <Badge variant="outline">{job.category}</Badge>}
                    {job.featured && (
                      <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                        <Star className="h-3 w-3 mr-1 fill-white" />
                        Featured
                      </Badge>
                    )}
                    {(job.urgency === 'urgent' || job.urgency === 'immediate') && (
                      <Badge variant="destructive">URGENT</Badge>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-green-600">₹{job.daily_salary}</div>
                  <div className="text-sm text-gray-500">per day</div>
                </div>
              </div>
            </div>

        {/* Images Section - Always show */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="relative flex justify-center items-center">
            {/* Main Image Display Area */}
            <div className="w-[80px] h-[80px] sm:w-[100px] sm:h-[100px]">
              {displayImages.length > 0 ? (
                // Show actual image
                <img 
                  src={displayImages[currentImageIndex]}
                  alt={`${job.title} - Photo ${currentImageIndex + 1}`}
                  className="h-full w-full object-cover rounded-full border-[3px] border-white shadow-xl ring-2 ring-gray-200 cursor-pointer hover:ring-orange-400 transition-all duration-200"
                  onClick={() => window.open(displayImages[currentImageIndex], '_blank')}
                />
              ) : (
                // Show empty placeholder for current slot
                <div className="h-full w-full border-2 border-dashed border-gray-300 rounded-full flex flex-col items-center justify-center bg-gray-50">
                  <ImageIcon className="h-8 w-8 sm:h-10 sm:w-10 text-gray-300 mb-1" />
                  <span className="text-xs text-gray-400">No photo</span>
                </div>
              )}
            </div>

            {/* Navigation Arrows */}
            {(displayImages.length > 1 || displayImages.length === 0) && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-[-12px] sm:left-[-16px] top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 sm:p-2 rounded-full transition-all duration-200 hover:scale-110 z-10"
                >
                  <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-[-12px] sm:right-[-16px] top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 sm:p-2 rounded-full transition-all duration-200 hover:scale-110 z-10"
                >
                  <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </>
            )}
          </div>

          {/* Dot Indicators */}
          <div className="flex justify-center items-center gap-2 mt-3">
            {Array.from({ length: displayImages.length > 0 ? displayImages.length : 3 }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`rounded-full transition-all duration-200 ${
                  index === currentImageIndex 
                    ? 'w-6 h-2 bg-orange-500' 
                    : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`View photo ${index + 1}`}
              />
            ))}
          </div>

          {/* Photo Counter */}
          <div className="text-center mt-2 text-sm text-gray-500">
            {displayImages.length > 0 ? (
              <span>{currentImageIndex + 1} of {displayImages.length} photos</span>
            ) : (
              <span>0 of 3 photos • No photos uploaded</span>
            )}
          </div>
        </div>

            {/* Description */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Job Description</h2>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{job.description}</p>
            </div>

            {/* Safety Tips */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-yellow-900 mb-1">Safety Tips</h3>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• Meet in a public place for the first time</li>
                    <li>• Never share sensitive personal information</li>
                    <li>• Trust your instincts - if something feels wrong, it probably is</li>
                  </ul>
                  <Link to="/safety" className="text-sm text-yellow-900 font-semibold hover:underline mt-2 inline-block">
                    Read all safety tips →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Employer</h3>
              
              <div className="space-y-3">
                <a
                  href={`tel:${job.phone}`}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Phone className="h-5 w-5" />
                  Call Now
                </a>
                
                <button
                  onClick={handleSendMessage}
                  disabled={isCreatingConversation}
                  className="w-full bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <MessageCircle className="h-5 w-5" />
                  {isCreatingConversation ? 'Loading...' : 'Send Message'}
                </button>

                <button
                  onClick={handleShare}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Share2 className="h-5 w-5" />
                  Share Job
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-2">Phone Number</p>
                <p className="text-lg font-semibold text-gray-900">{job.phone}</p>
              </div>

              <div className="mt-4">
                <Link to="/safety" className="text-sm text-orange-600 hover:text-orange-700 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  Report this job
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Jobs */}
        {similarJobs.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Similar Jobs</h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {similarJobs.map((similarJob) => (
                <ListingCard
                  key={similarJob.id}
                  jobId={similarJob.id}
                  title={similarJob.title}
                  price={similarJob.daily_salary}
                  location={similarJob.location}
                  timePosted={timeAgo(similarJob.created_at)}
                  images={similarJob.images || []}
                  featured={similarJob.featured}
                  urgent={similarJob.urgency === 'urgent' || similarJob.urgency === 'immediate'}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default JobDetail;
