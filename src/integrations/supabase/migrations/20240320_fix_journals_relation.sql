-- Drop existing foreign key if it exists
ALTER TABLE IF EXISTS public.journals
DROP CONSTRAINT IF EXISTS journals_user_id_fkey;

-- Add foreign key constraint to link journals.user_id with profiles.id
ALTER TABLE public.journals
ADD CONSTRAINT journals_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- Enable RLS on journals table
ALTER TABLE public.journals ENABLE ROW LEVEL SECURITY;

-- Create policies for journals
CREATE POLICY "Users can view all journals"
ON public.journals
FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own journals"
ON public.journals
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journals"
ON public.journals
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own journals"
ON public.journals
FOR DELETE
USING (auth.uid() = user_id); 