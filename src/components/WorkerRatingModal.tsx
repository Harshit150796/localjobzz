import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import RatingStars from './RatingStars';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface WorkerRatingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobCompletionId: string;
  jobId: string;
  employerId: string;
  employerName: string;
  jobTitle: string;
  workerId: string;
  onSuccess: () => void;
}

const WorkerRatingModal: React.FC<WorkerRatingModalProps> = ({
  open,
  onOpenChange,
  jobCompletionId,
  jobId,
  employerId,
  employerName,
  jobTitle,
  workerId,
  onSuccess,
}) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: 'Rating Required',
        description: 'Please provide a star rating',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Insert rating
      const { error: ratingError } = await supabase.from('ratings').insert({
        job_completion_id: jobCompletionId,
        job_id: jobId,
        rater_id: workerId,
        rated_user_id: employerId,
        rating_type: 'worker_to_employer',
        stars: rating,
        feedback: feedback.trim() || null,
      });

      if (ratingError) throw ratingError;

      toast({
        title: 'Rating Submitted',
        description: 'Thank you for rating the employer!',
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit rating. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setRating(0);
      setFeedback('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rate Your Employer</DialogTitle>
          <DialogDescription>
            How was your experience working for {employerName} on "{jobTitle}"?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Star Rating */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Your Rating *</label>
            <div className="flex justify-center py-2">
              <RatingStars value={rating} onChange={setRating} size="lg" />
            </div>
            {rating > 0 && (
              <p className="text-center text-sm text-muted-foreground">
                {rating === 1 && 'Poor'}
                {rating === 2 && 'Fair'}
                {rating === 3 && 'Good'}
                {rating === 4 && 'Very Good'}
                {rating === 5 && 'Excellent'}
              </p>
            )}
          </div>

          {/* Written Feedback */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Feedback <span className="text-muted-foreground">(Optional)</span>
            </label>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Share your experience working with this employer..."
              className="min-h-[100px]"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {feedback.length}/500
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || rating === 0}
            className="w-full sm:w-auto"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Rating
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WorkerRatingModal;
