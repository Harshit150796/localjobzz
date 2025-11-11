
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

interface Job {
  id: string;
  user_id: string;
  title: string;
  job_type: string;
  daily_salary: string;
  location: string;
  description: string;
  phone: string;
  urgency: 'normal' | 'urgent' | 'immediate';
  status: 'active' | 'completed' | 'expired';
  featured: boolean;
  category?: string;
  images?: string[];
  created_at: string;
  updated_at: string;
}

interface JobFormData {
  title: string;
  job_type: string;
  daily_salary: string;
  location: string;
  description: string;
  phone: string;
  urgency: 'normal' | 'urgent' | 'immediate';
  category?: string;
  images?: string[];
}

interface JobContextType {
  jobs: Job[];
  isLoading: boolean;
  addJob: (jobData: JobFormData) => Promise<{ success: boolean; message: string; jobId?: string }>;
  refreshJobs: () => Promise<void>;
}

const JobContext = createContext<JobContextType | undefined>(undefined);

export const JobProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { session } = useAuth();

  // Load jobs when component mounts
  useEffect(() => {
    refreshJobs();
  }, []);

  const refreshJobs = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching jobs from Supabase...');
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching jobs:', error);
        return;
      }

      console.log('Jobs fetched from Supabase:', data?.length || 0);
      console.log('Sample job:', data?.[0]);
      setJobs((data || []) as Job[]);
    } catch (error) {
      console.error('Error in refreshJobs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addJob = async (jobData: JobFormData): Promise<{ success: boolean; message: string; jobId?: string }> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('jobs')
        .insert({
          user_id: session?.user?.id || null,
          title: jobData.title,
          job_type: jobData.job_type,
          daily_salary: jobData.daily_salary,
          location: jobData.location,
          description: jobData.description,
          phone: jobData.phone,
          urgency: jobData.urgency,
          category: jobData.category,
          images: jobData.images || [],
          featured: jobData.urgency === 'urgent' || jobData.urgency === 'immediate'
        })
        .select()
        .single();

      if (error) {
        return { success: false, message: error.message };
      }

      // Refresh jobs list
      await refreshJobs();
      return { success: true, message: 'Job posted successfully!', jobId: data.id };
    } catch (error) {
      return { success: false, message: 'An unexpected error occurred' };
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <JobContext.Provider value={{ jobs, isLoading, addJob, refreshJobs }}>
      {children}
    </JobContext.Provider>
  );
};

export const useJobs = () => {
  const context = useContext(JobContext);
  if (context === undefined) {
    throw new Error('useJobs must be used within a JobProvider');
  }
  return context;
};
