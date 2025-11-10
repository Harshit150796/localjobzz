-- Create storage bucket for job images
INSERT INTO storage.buckets (id, name, public)
VALUES ('job-images', 'job-images', true);

-- Add images column to jobs table
ALTER TABLE public.jobs 
ADD COLUMN images TEXT[] DEFAULT '{}';

-- Allow anyone to view job images
CREATE POLICY "Anyone can view job images"
ON storage.objects FOR SELECT
USING (bucket_id = 'job-images');

-- Allow authenticated users to upload job images
CREATE POLICY "Authenticated users can upload job images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'job-images' 
  AND auth.role() = 'authenticated'
);

-- Allow users to delete their own job images
CREATE POLICY "Users can delete their own job images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'job-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);