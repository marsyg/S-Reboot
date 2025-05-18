-- Add foreign key relationship between journals and profiles
ALTER TABLE journals
ADD CONSTRAINT journals_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES profiles(id)
ON DELETE CASCADE;

-- Enable RLS on journals table
ALTER TABLE journals ENABLE ROW LEVEL SECURITY;

-- Create policies for journals
CREATE POLICY "Users can view all journals"
ON journals FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can create their own journals"
ON journals FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journals"
ON journals FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own journals"
ON journals FOR DELETE
TO authenticated
USING (auth.uid() = user_id); 