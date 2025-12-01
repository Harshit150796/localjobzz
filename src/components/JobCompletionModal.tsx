import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import RatingStars from './RatingStars';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface Worker {
  id: string;
  name: string;
}

interface JobCompletionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  jobTitle: string;
  employerId: string;
  onSuccess: () => void;
}

const JobCompletionModal: React.FC<JobCompletionModalProps> = ({
  open,
  onOpenChange,
  jobId,
  jobTitle,
  employerId,
  onSuccess,
}) => {
  const [step, setStep] = useState<'type' | 'rating' | 'loading'>('type');
  const [completionType, setCompletionType] = useState<string>('');
  const [selectedWorker, setSelectedWorker] = useState<string>('');
  const [externalSource, setExternalSource] = useState('');
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchWorkers();
    } else {
      // Reset state when modal closes
      setStep('type');
      setCompletionType('');
      setSelectedWorker('');
      setExternalSource('');
      setRating(0);
      setFeedback('');
    }
  }, [open, jobId]);

  const fetchWorkers = async () => {
    try {
      // Get all conversations for this job
      const { data: conversations, error } = await supabase
        .from('conversations')
        .select('worker_id')
        .eq('job_id', jobId);

      if (error) throw error;

      if (!conversations || conversations.length === 0) {
        setWorkers([]);
        return;
      }

      // Get unique worker IDs
      const workerIds = [...new Set(conversations.map(c => c.worker_id))];

      // Fetch worker profiles
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, name')
        .in('user_id', workerIds);

      if (profileError) throw profileError;

      setWorkers(profiles?.map(p => ({ id: p.user_id, name: p.name })) || []);
    } catch (error) {
      console.error('Error fetching workers:', error);
    }
  };

  const handleNext = () => {
    if (completionType === 'platform_worker') {
      if (workers.length === 0) {
        toast({
          title: 'No Workers Found',
          description: 'No one has messaged about this job yet. Try another completion option.',
          variant: 'destructive',
        });
        return;
      }
      setStep('rating');
    } else if (completionType === 'external') {
      if (!externalSource.trim()) {
        toast({
          title: 'Source Required',
          description: 'Please mention where you hired from',
          variant: 'destructive',
        });
        return;
      }
      handleSubmit();
    } else if (completionType === 'no_longer_needed') {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setStep('loading');

    try {
      // Create job completion record
      const { data: completion, error: completionError } = await supabase
        .from('job_completions')
        .insert({
          job_id: jobId,
          employer_id: employerId,
          completion_type: completionType,
          completed_by_user_id: completionType === 'platform_worker' ? selectedWorker : null,
          external_source: completionType === 'external' ? externalSource : null,
        })
        .select()
        .single();

      if (completionError) throw completionError;

      // If platform worker and rating provided, create rating
      if (completionType === 'platform_worker' && rating > 0 && selectedWorker) {
        const { error: ratingError } = await supabase
          .from('ratings')
          .insert({
            job_completion_id: completion.id,
            job_id: jobId,
            rater_id: employerId,
            rated_user_id: selectedWorker,
            rating_type: 'employer_to_worker',
            stars: rating,
            feedback: feedback.trim() || null,
          });

        if (ratingError) throw ratingError;
      }

      toast({
        title: 'Job Marked as Completed',
        description: completionType === 'platform_worker' 
          ? 'Worker will be notified to rate you'
          : 'Job completion recorded',
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error completing job:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark job as completed. Please try again.',
        variant: 'destructive',
      });
      setStep('type');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRatingSubmit = () => {
    if (!selectedWorker) {
      toast({
        title: 'Select Worker',
        description: 'Please select who completed the work',
        variant: 'destructive',
      });
      return;
    }

    if (rating === 0) {
      toast({
        title: 'Rating Required',
        description: 'Please provide a rating for the worker',
        variant: 'destructive',
      });
      return;
    }

    handleSubmit();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        {step === 'type' && (
          <>
            <DialogHeader>
              <DialogTitle>Mark Job as Completed</DialogTitle>
              <DialogDescription>
                How was "{jobTitle}" completed?
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4">
              <RadioGroup value={completionType} onValueChange={setCompletionType}>
                <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="platform_worker" id="platform" />
                  <Label htmlFor="platform" className="cursor-pointer flex-1">
                    <div className="font-semibold">Hired someone from localjobzz</div>
                    <div className="text-sm text-muted-foreground">
                      Select worker from messages and rate them
                    </div>
                  </Label>
                </div>

                <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="external" id="external" />
                  <Label htmlFor="external" className="cursor-pointer flex-1">
                    <div className="font-semibold">Hired from elsewhere</div>
                    <div className="text-sm text-muted-foreground">
                      Found worker through other means
                    </div>
                  </Label>
                </div>

                <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="no_longer_needed" id="not-needed" />
                  <Label htmlFor="not-needed" className="cursor-pointer flex-1">
                    <div className="font-semibold">Job no longer needed</div>
                    <div className="text-sm text-muted-foreground">
                      Decided not to hire anyone
                    </div>
                  </Label>
                </div>
              </RadioGroup>

              {completionType === 'external' && (
                <div className="pt-2">
                  <Label htmlFor="source">Where did you hire from? *</Label>
                  <Input
                    id="source"
                    placeholder="e.g., Local contractor, Friend referral, etc."
                    value={externalSource}
                    onChange={(e) => setExternalSource(e.target.value)}
                    className="mt-1"
                  />
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleNext} disabled={!completionType}>
                Next
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'rating' && (
          <>
            <DialogHeader>
              <DialogTitle>Rate Worker</DialogTitle>
              <DialogDescription>
                How was your experience with the worker?
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4">
              <div>
                <Label>Select Worker *</Label>
                <RadioGroup value={selectedWorker} onValueChange={setSelectedWorker} className="mt-2">
                  {workers.map((worker) => (
                    <div key={worker.id} className="flex items-center space-x-3 p-2 border rounded-lg">
                      <RadioGroupItem value={worker.id} id={worker.id} />
                      <Label htmlFor={worker.id} className="cursor-pointer">
                        {worker.name}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <Label>Rating *</Label>
                <div className="mt-2">
                  <RatingStars value={rating} onChange={setRating} size="lg" />
                </div>
              </div>

              <div>
                <Label htmlFor="feedback">Feedback (Optional)</Label>
                <Textarea
                  id="feedback"
                  placeholder="Share your experience working with them..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  maxLength={200}
                  rows={3}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {feedback.length}/200 characters
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setStep('type')}>
                Back
              </Button>
              <Button onClick={handleRatingSubmit}>
                Submit Rating
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'loading' && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Completing job...</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default JobCompletionModal;
