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
  maxImages = 5 
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
      const fileName = `${user?.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      
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
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{uploadedCount} of {maxImages} photos</span>
        {uploadedCount > 0 && (
          <span className="text-green-600">✓ Images added</span>
        )}
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {slots.map((index) => {
          const hasImage = images[index];
          const isUploading = uploadingIndex === index;
          
          return (
            <div key={index} className="relative aspect-square">
              {hasImage ? (
                // Image preview with remove button
                <div className="relative group h-full w-full">
                  <img 
                    src={hasImage} 
                    alt={`Upload ${index + 1}`}
                    className="h-full w-full object-cover rounded-lg border-2 border-border"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-destructive/90"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                // Upload slot
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={(e) => handleDrop(e, index)}
                  className={`h-full w-full border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-accent/50 transition-colors ${
                    dragActive ? 'border-primary bg-accent' : 'border-border'
                  } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                    <div className="flex flex-col items-center gap-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      <span className="text-xs text-muted-foreground">Uploading...</span>
                    </div>
                  ) : (
                    <>
                      {index === 0 ? (
                        <ImageIcon className="h-8 w-8 text-muted-foreground mb-1" />
                      ) : (
                        <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                      )}
                      <span className="text-xs text-muted-foreground text-center px-2">
                        {index === 0 ? 'Add Photo' : '+'}
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <p className="text-xs text-muted-foreground">
        Supported formats: JPG, PNG, WEBP (max 5MB each)
      </p>
    </div>
  );
};

export default ImageUpload;
