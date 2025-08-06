
import React, { createContext, useContext, useState, useEffect } from 'react';

interface Job {
  id: string;
  title: string;
  jobType: string;
  dailySalary: string;
  location: string;
  description: string;
  phone: string;
  urgency: 'normal' | 'urgent' | 'immediate';
  timePosted: string;
  featured: boolean;
}

interface JobContextType {
  jobs: Job[];
  addJob: (jobData: Omit<Job, 'id' | 'timePosted' | 'featured'>) => void;
}

const JobContext = createContext<JobContextType | undefined>(undefined);

export const JobProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [jobs, setJobs] = useState<Job[]>([]);

  // Load jobs from localStorage on mount
  useEffect(() => {
    const savedJobs = localStorage.getItem('localjobcart-jobs');
    if (savedJobs) {
      setJobs(JSON.parse(savedJobs));
    }
  }, []);

  // Save jobs to localStorage whenever jobs change
  useEffect(() => {
    localStorage.setItem('localjobcart-jobs', JSON.stringify(jobs));
  }, [jobs]);

  const addJob = (jobData: Omit<Job, 'id' | 'timePosted' | 'featured'>) => {
    const newJob: Job = {
      ...jobData,
      id: Date.now().toString(),
      timePosted: 'Just now',
      featured: jobData.urgency === 'urgent' || jobData.urgency === 'immediate'
    };
    setJobs(prevJobs => [newJob, ...prevJobs]);
  };

  return (
    <JobContext.Provider value={{ jobs, addJob }}>
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
