-- Fix profile creation on signup
-- This allows profiles to be created automatically when users sign up

-- Option 1: Create a database trigger to auto-create profile (RECOMMENDED)
-- This trigger automatically creates a profile row when a user signs up
-- It now includes ALL signup information including clinic details
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, phone, specialty, clinic_name, clinic_type)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', 'User'),
    COALESCE(new.raw_user_meta_data->>'phone', ''),
    COALESCE(new.raw_user_meta_data->>'specialty', ''),
    COALESCE(new.raw_user_meta_data->>'clinic_name', NULL),
    COALESCE(new.raw_user_meta_data->>'clinic_type', NULL)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Option 2: Temporarily allow anon users to insert their own profile
-- (Use this if you want the signup page to create the profile directly)
-- WARNING: This is less secure, use Option 1 if possible

-- DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
-- CREATE POLICY "Users can insert their own profile"
--     ON public.profiles FOR INSERT
--     WITH CHECK (true); -- This allows anyone to insert, but they must use their own ID

-- Verify existing policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'profiles';
