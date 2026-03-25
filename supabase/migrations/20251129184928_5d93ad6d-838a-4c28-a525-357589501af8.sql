-- Add drive_folder_link column to events table
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS drive_folder_link text;

-- Add comment for documentation
COMMENT ON COLUMN public.events.drive_folder_link IS 'Google Drive folder link for event photos';