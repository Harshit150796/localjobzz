import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MyJobCard from '@/components/MyJobCard';
import { Button } from '@/components/ui/button';
import { Briefcase, Plus } from 'lucide-react';
import SEOHead from '@/components/SEOHead';

interface Job {
  id: string;
  title: string;
  job_type: string;
  daily_salary: string;
  location: string;
  description: string;
  phone: string;
  urgency: string;
  status: string;
  category?: string;
  images?: string[];
  created_at: string;
}

const MyJobs: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login', { state: { from: '/my-jobs' } });
      return;
    }

    if (user) {
      fetchMyJobs();
    }
  }, [user, authLoading, navigate]);

  const fetchMyJobs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching jobs:', error);
        return;
      }

      setJobs(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJobDeleted = () => {
    fetchMyJobs();
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your jobs...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <SEOHead 
        title="My Posted Jobs - Manage Your Job Listings | LocalJobzz"
        description="View and manage all your posted job listings. Edit or delete your job posts easily."
      />
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Briefcase className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold text-foreground">My Posted Jobs</h1>
              </div>
              <Button onClick={() => navigate('/post-ad')} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Post New Job
              </Button>
            </div>
            <p className="text-muted-foreground">
              Manage all your job postings in one place
            </p>
          </div>

          {/* Jobs Grid */}
          {jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
              <Briefcase className="h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                No jobs posted yet
              </h2>
              <p className="text-muted-foreground mb-6 max-w-md">
                Start posting jobs to find the right candidates for your work
              </p>
              <Button onClick={() => navigate('/post-ad')} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Post Your First Job
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <MyJobCard key={job.id} job={job} onJobDeleted={handleJobDeleted} />
              ))}
            </div>
          )}
        </main>
        <Footer />
      </div>
    </>
  );
};

export default MyJobs;
