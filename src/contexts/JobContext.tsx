
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
  deleteJob: (jobId: string) => Promise<{ success: boolean; message: string }>;
  updateJob: (jobId: string, jobData: Partial<JobFormData>) => Promise<{ success: boolean; message: string }>;
  refreshJobs: () => Promise<void>;
}

const JobContext = createContext<JobContextType | undefined>(undefined);

export const JobProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

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
    
    if (!user?.id) {
      setIsLoading(false);
      return { success: false, message: 'You must be logged in to post a job' };
    }
    
    try {
      console.log('Posting job with user_id:', user.id);
      const { data, error } = await supabase
        .from('jobs')
        .insert({
          user_id: user.id,
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

  const deleteJob = async (jobId: string): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    
    if (!user?.id) {
      setIsLoading(false);
      return { success: false, message: 'You must be logged in' };
    }
    
    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId)
        .eq('user_id', user.id);

      if (error) {
        return { success: false, message: error.message };
      }

      await refreshJobs();
      return { success: true, message: 'Job deleted successfully!' };
    } catch (error) {
      return { success: false, message: 'Failed to delete job' };
    } finally {
      setIsLoading(false);
    }
  };

  const updateJob = async (jobId: string, jobData: Partial<JobFormData>): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    
    if (!user?.id) {
      setIsLoading(false);
      return { success: false, message: 'You must be logged in' };
    }
    
    try {
      const updateData: any = {
        updated_at: new Date().toISOString()
      };
      
      if (jobData.title !== undefined) updateData.title = jobData.title;
      if (jobData.job_type !== undefined) updateData.job_type = jobData.job_type;
      if (jobData.daily_salary !== undefined) updateData.daily_salary = jobData.daily_salary;
      if (jobData.location !== undefined) updateData.location = jobData.location;
      if (jobData.description !== undefined) updateData.description = jobData.description;
      if (jobData.phone !== undefined) updateData.phone = jobData.phone;
      if (jobData.urgency !== undefined) updateData.urgency = jobData.urgency;
      if (jobData.category !== undefined) updateData.category = jobData.category;
      if (jobData.images !== undefined) updateData.images = jobData.images;
      
      const { error } = await supabase
        .from('jobs')
        .update(updateData)
        .eq('id', jobId)
        .eq('user_id', user.id);

      if (error) {
        return { success: false, message: error.message };
      }

      await refreshJobs();
      return { success: true, message: 'Job updated successfully!' };
    } catch (error) {
      return { success: false, message: 'Failed to update job' };
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <JobContext.Provider value={{ jobs, isLoading, addJob, deleteJob, updateJob, refreshJobs }}>
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
