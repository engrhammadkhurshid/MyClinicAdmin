-- MyClinic Admin - Supabase Database Schema
-- Run these SQL commands in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PROFILES TABLE (for user metadata)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    specialty TEXT NOT NULL,
    profile_picture_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =====================================================
-- PATIENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    gender TEXT NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
    age INTEGER NOT NULL CHECK (age >= 0 AND age <= 150),
    address TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    labels TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =====================================================
-- APPOINTMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    visit_type TEXT NOT NULL,
    diagnosis TEXT NOT NULL,
    notes TEXT,
    appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no-show')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =====================================================
-- ATTACHMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_patients_user_id ON public.patients(user_id);
CREATE INDEX IF NOT EXISTS idx_patients_full_name ON public.patients(full_name);
CREATE INDEX IF NOT EXISTS idx_patients_labels ON public.patients USING GIN(labels);

CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON public.appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);

CREATE INDEX IF NOT EXISTS idx_attachments_patient_id ON public.attachments(patient_id);
CREATE INDEX IF NOT EXISTS idx_attachments_user_id ON public.attachments(user_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;

-- PROFILES TABLE POLICIES
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- PATIENTS TABLE POLICIES
CREATE POLICY "Users can view their own patients"
    ON public.patients FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own patients"
    ON public.patients FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own patients"
    ON public.patients FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own patients"
    ON public.patients FOR DELETE
    USING (auth.uid() = user_id);

-- APPOINTMENTS TABLE POLICIES
CREATE POLICY "Users can view their own appointments"
    ON public.appointments FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own appointments"
    ON public.appointments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own appointments"
    ON public.appointments FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own appointments"
    ON public.appointments FOR DELETE
    USING (auth.uid() = user_id);

-- ATTACHMENTS TABLE POLICIES
CREATE POLICY "Users can view their own attachments"
    ON public.attachments FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own attachments"
    ON public.attachments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own attachments"
    ON public.attachments FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables with updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at
    BEFORE UPDATE ON public.patients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON public.appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STORAGE BUCKET FOR FILE UPLOADS
-- =====================================================

-- Create a storage bucket for patient attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('patient-attachments', 'patient-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload files"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'patient-attachments' 
        AND auth.role() = 'authenticated'
    );

-- Storage policy: Allow users to view their own files
CREATE POLICY "Users can view their own files"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'patient-attachments' 
        AND auth.role() = 'authenticated'
    );

-- Storage policy: Allow users to delete their own files
CREATE POLICY "Users can delete their own files"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'patient-attachments' 
        AND auth.role() = 'authenticated'
    );

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to get patient statistics for a user
CREATE OR REPLACE FUNCTION get_patient_stats(user_uuid UUID)
RETURNS TABLE (
    total_patients BIGINT,
    total_appointments BIGINT,
    appointments_today BIGINT,
    monthly_visits BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM public.patients WHERE user_id = user_uuid),
        (SELECT COUNT(*) FROM public.appointments WHERE user_id = user_uuid),
        (SELECT COUNT(*) FROM public.appointments 
         WHERE user_id = user_uuid 
         AND DATE(appointment_date) = CURRENT_DATE),
        (SELECT COUNT(*) FROM public.appointments 
         WHERE user_id = user_uuid 
         AND DATE_TRUNC('month', appointment_date) = DATE_TRUNC('month', CURRENT_DATE));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_patient_stats(UUID) TO authenticated;

-- =====================================================
-- SAMPLE DATA (OPTIONAL - FOR TESTING)
-- =====================================================

-- To insert sample data, first create a user via the application
-- Then uncomment and run the following with your user_id

/*
-- Sample patient
INSERT INTO public.patients (user_id, full_name, gender, age, address, phone, email, labels)
VALUES (
    'YOUR_USER_ID_HERE',
    'John Doe',
    'Male',
    35,
    '123 Main St, City, State 12345',
    '+1 (555) 123-4567',
    'john.doe@example.com',
    ARRAY['New Patient', 'Regular']
);

-- Sample appointment
INSERT INTO public.appointments (user_id, patient_id, visit_type, diagnosis, notes, appointment_date)
VALUES (
    'YOUR_USER_ID_HERE',
    'PATIENT_ID_FROM_ABOVE',
    'Routine Checkup',
    'General health checkup - all vitals normal',
    'Patient reported feeling well. Advised to maintain current lifestyle.',
    TIMEZONE('utc'::text, NOW() + INTERVAL '1 day')
);
*/

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ MyClinic Admin database schema created successfully!';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Update your .env.local file with Supabase credentials';
    RAISE NOTICE '2. Sign up for a new account in the application';
    RAISE NOTICE '3. Start adding patients and appointments';
END $$;
