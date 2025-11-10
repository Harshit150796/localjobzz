import React, { useRef, useState } from 'react';
import { Upload, X, ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  images, 
  onImagesChange, 
  maxImages = 3 
}) => {
  const { user } = useAuth();
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = async (file: File, index: number) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload JPG, PNG, or WEBP images only.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload images smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setUploadingIndex(index);
    
    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id || 'anonymous'}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('job-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('job-images')
        .getPublicUrl(fileName);

      // Update images array
      const newImages = [...images];
      newImages[index] = publicUrl;
      onImagesChange(newImages.filter(img => img)); // Remove empty strings
      
      toast({
        title: "Image Uploaded",
        description: "Your image has been uploaded successfully.",
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file, index);
    }
  };

  const handleRemove = async (index: number) => {
    const imageUrl = images[index];
    if (!imageUrl) return;

    try {
      // Extract filename from URL
      const fileName = imageUrl.split('/job-images/')[1];
      
      // Delete from storage
      await supabase.storage
        .from('job-images')
        .remove([fileName]);

      // Remove from array
      const newImages = [...images];
      newImages.splice(index, 1);
      onImagesChange(newImages);
      
      toast({
        title: "Image Removed",
        description: "Image has been deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting image:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete image.",
        variant: "destructive",
      });
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file, index);
    }
  };

  // Create array of slots (0 to maxImages-1)
  const slots = Array.from({ length: maxImages }, (_, i) => i);
  const uploadedCount = images.filter(img => img).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-3 text-sm">
        <span className="text-gray-600 font-medium">{uploadedCount} of {maxImages} photos</span>
        {uploadedCount > 0 && (
          <span className="text-green-600 flex items-center gap-1">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
            Added
          </span>
        )}
      </div>
      
      <div className="flex justify-center items-center gap-3 sm:gap-5">
        {slots.map((index) => {
          const hasImage = images[index];
          const isUploading = uploadingIndex === index;
          
          return (
            <div key={index} className="relative w-[90px] h-[90px] sm:w-[120px] sm:h-[120px]">
              {hasImage ? (
                // Image preview with remove button
                <div className="relative group h-full w-full">
                  <img 
                    src={hasImage} 
                    alt={`Upload ${index + 1}`}
                    className="h-full w-full object-cover rounded-full border-3 border-white shadow-lg ring-2 ring-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 transition-all duration-200 hover:scale-110 z-10"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                // Upload slot
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={(e) => handleDrop(e, index)}
                  className={`h-full w-full border-2 border-dashed rounded-full flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-accent/50 transition-all duration-200 ${
                    dragActive ? 'border-primary bg-accent scale-105' : 'border-gray-300'
                  } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''} ${index === 0 && uploadedCount === 0 ? 'animate-pulse' : ''}`}
                  onClick={() => !isUploading && fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={(e) => handleFileInput(e, index)}
                    className="hidden"
                  />
                  {isUploading ? (
                    <div className="flex flex-col items-center gap-1">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <>
                      <ImageIcon className="h-6 w-6 sm:h-8 sm:h-8 text-gray-400 mb-1" />
                      {index === 0 && uploadedCount === 0 && (
                        <span className="text-[10px] text-gray-500 text-center">Add</span>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <p className="text-xs text-gray-500 text-center">
        JPG, PNG or WEBP (max 5MB each)
      </p>
    </div>
  );
};

export default ImageUpload;
