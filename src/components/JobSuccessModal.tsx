import React from 'react';
import { CheckCircle, Briefcase, Eye, Plus } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface JobSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewJob: () => void;
  onPostAnother: () => void;
}

const JobSuccessModal: React.FC<JobSuccessModalProps> = ({
  isOpen,
  onClose,
  onViewJob,
  onPostAnother
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md mx-4 bg-white dark:bg-gray-900 border shadow-2xl rounded-lg">
        <DialogHeader className="space-y-4 text-center">
          {/* Success Icon with Animation */}
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center success-bounce shadow-lg">
            <CheckCircle className="w-12 h-12 text-white animate-scale-in" />
          </div>
          
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white animate-fade-in">
            Yay!! Congratulations! 🎉
          </DialogTitle>
          
          <DialogDescription className="text-lg text-gray-600 dark:text-gray-300 animate-fade-in delay-100">
            You have successfully posted a new job!
          </DialogDescription>
          
          <div className="flex items-center justify-center space-x-2 text-emerald-600 dark:text-emerald-400 animate-fade-in delay-200">
            <Briefcase className="w-5 h-5" />
            <span className="font-medium">Your job is now live and visible to workers</span>
          </div>
        </DialogHeader>

        <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-8 pt-6">
          <Button
            onClick={onViewJob}
            className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl animate-fade-in delay-300"
          >
            <Eye className="w-4 h-4 mr-2" />
            View My Job
          </Button>
          
          <Button
            onClick={onPostAnother}
            variant="outline"
            className="flex-1 border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 font-medium py-3 px-6 rounded-lg transition-all duration-200 animate-fade-in delay-400"
          >
            <Plus className="w-4 h-4 mr-2" />
            Post Another Job
          </Button>
        </DialogFooter>

        {/* Animated Confetti Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
          <div className="confetti-particle confetti-1"></div>
          <div className="confetti-particle confetti-2"></div>
          <div className="confetti-particle confetti-3"></div>
          <div className="confetti-particle confetti-4"></div>
          <div className="confetti-particle confetti-5"></div>
          <div className="confetti-particle confetti-6"></div>
        </div>

        <style>{`
          .success-bounce {
            animation: successBounce 0.6s ease-out;
          }
          
          @keyframes successBounce {
            0% { transform: scale(0) rotate(0deg); }
            50% { transform: scale(1.1) rotate(180deg); }
            100% { transform: scale(1) rotate(360deg); }
          }
          
          .confetti-particle {
            position: absolute;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            animation: confettiFall 3s ease-out infinite;
          }
          
          .confetti-1 {
            background: linear-gradient(45deg, #22c55e, #16a34a);
            left: 10%;
            animation-delay: 0s;
          }
          
          .confetti-2 {
            background: linear-gradient(45deg, #f59e0b, #d97706);
            left: 20%;
            animation-delay: 0.5s;
          }
          
          .confetti-3 {
            background: linear-gradient(45deg, #3b82f6, #1d4ed8);
            left: 70%;
            animation-delay: 0.3s;
          }
          
          .confetti-4 {
            background: linear-gradient(45deg, #ec4899, #be185d);
            left: 80%;
            animation-delay: 0.8s;
          }
          
          .confetti-5 {
            background: linear-gradient(45deg, #8b5cf6, #7c3aed);
            left: 30%;
            animation-delay: 1s;
          }
          
          .confetti-6 {
            background: linear-gradient(45deg, #ef4444, #dc2626);
            left: 60%;
            animation-delay: 0.2s;
          }
          
          @keyframes confettiFall {
            0% {
              transform: translateY(-100px) rotate(0deg);
              opacity: 1;
            }
            100% {
              transform: translateY(400px) rotate(720deg);
              opacity: 0;
            }
          }
          
          .animate-scale-in {
            animation: scaleIn 0.4s ease-out 0.2s both;
          }
          
          @keyframes scaleIn {
            from {
              transform: scale(0);
              opacity: 0;
            }
            to {
              transform: scale(1);
              opacity: 1;
            }
          }
          
          .animate-fade-in {
            animation: fadeInUp 0.5s ease-out both;
          }
          
          .delay-100 {
            animation-delay: 0.1s;
          }
          
          .delay-200 {
            animation-delay: 0.2s;
          }
          
          .delay-300 {
            animation-delay: 0.3s;
          }
          
          .delay-400 {
            animation-delay: 0.4s;
          }
          
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
};

export default JobSuccessModal;