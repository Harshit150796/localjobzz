import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import JobCompletionModal from '@/components/JobCompletionModal';
import { MapPin, DollarSign, Trash2, Eye, Calendar, Pencil } from 'lucide-react';
import { useJobs } from '@/contexts/JobContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface Job {
  id: string;
  title: string;
  job_type: string;
  daily_salary: string;
  location: string;
  description: string;
  urgency: string;
  status: string;
  category?: string;
  images?: string[];
  created_at: string;
}

interface MyJobCardProps {
  job: Job;
  onJobDeleted: () => void;
}

const MyJobCard: React.FC<MyJobCardProps> = ({ job, onJobDeleted }) => {
  const navigate = useNavigate();
  const { deleteJob, updateJob } = useJobs();
  const { user } = useAuth();
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  const handleCompletionSuccess = async () => {
    // Mark job as completed instead of deleting
    const result = await updateJob(job.id, { status: 'completed' } as any);
    
    if (result.success) {
      toast({
        title: 'Success',
        description: 'Job marked as completed',
      });
      onJobDeleted(); // Refresh the list
    } else {
      toast({
        title: 'Error',
        description: result.message,
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = () => {
    const statusColors = {
      active: 'bg-green-500/10 text-green-700 dark:text-green-400 hover:bg-green-500/20',
      completed: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 hover:bg-blue-500/20',
      expired: 'bg-gray-500/10 text-gray-700 dark:text-gray-400 hover:bg-gray-500/20',
    };

    return (
      <Badge className={statusColors[job.status as keyof typeof statusColors] || statusColors.active}>
        {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
      </Badge>
    );
  };

  const getUrgencyBadge = () => {
    if (job.urgency === 'normal') return null;

    const urgencyColors = {
      urgent: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20',
      immediate: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
    };

    return (
      <Badge variant="outline" className={urgencyColors[job.urgency as keyof typeof urgencyColors]}>
        {job.urgency === 'urgent' ? '🔥 Urgent' : '⚡ Immediate'}
      </Badge>
    );
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-all duration-300 border-border">
        <CardContent className="p-4">
          {/* Header with Status and Urgency */}
          <div className="flex items-center justify-between mb-3">
            {getStatusBadge()}
            {getUrgencyBadge()}
          </div>

          {/* Job Image */}
          {job.images && job.images.length > 0 ? (
            <img
              src={job.images[0]}
              alt={job.title}
              className="w-full h-32 sm:h-40 object-cover rounded-lg mb-3"
            />
          ) : (
            <div className="w-full h-32 sm:h-40 bg-muted rounded-lg mb-3 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Eye className="h-8 w-8 mx-auto mb-1 opacity-50" />
                <p className="text-xs">No Image</p>
              </div>
            </div>
          )}

          {/* Job Title & Category */}
          <div className="mb-3">
            <h3 className="font-semibold text-lg text-foreground mb-1 line-clamp-2">
              {job.title}
            </h3>
            {job.category && (
              <p className="text-sm text-muted-foreground">{job.category}</p>
            )}
          </div>

          {/* Job Details */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">{job.location}</span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <DollarSign className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>₹{job.daily_salary}/day</span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>Posted {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => navigate(`/job/${job.id}`)}
            >
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/post-ad', { state: { editJob: job } })}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => setShowCompletionModal(true)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Job Completion Modal */}
      {user && (
        <JobCompletionModal
          open={showCompletionModal}
          onOpenChange={setShowCompletionModal}
          jobId={job.id}
          jobTitle={job.title}
          employerId={user.id}
          onSuccess={handleCompletionSuccess}
        />
      )}
    </>
  );
};

export default MyJobCard;
