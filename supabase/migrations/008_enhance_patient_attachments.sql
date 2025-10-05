-- Migration: Enhance patient form with DOB, medical info, and attachments
-- Created: 2025-10-06

-- 1. ADD COLUMNS TO PATIENTS TABLE
ALTER TABLE public.patients 
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS reason_for_visit TEXT,
ADD COLUMN IF NOT EXISTS medical_history TEXT;

-- 2. ADD SOURCE COLUMN TO APPOINTMENTS TABLE
ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'Walk In';

-- 3. CREATE PATIENT_ATTACHMENTS TABLE
CREATE TABLE IF NOT EXISTS public.patient_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL REFERENCES public.clinic(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL, -- 'image/jpeg', 'image/png', 'image/webp'
  file_size INTEGER, -- in bytes
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_patient_attachments_patient_id ON public.patient_attachments(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_attachments_clinic_id ON public.patient_attachments(clinic_id);
CREATE INDEX IF NOT EXISTS idx_patients_date_of_birth ON public.patients(date_of_birth);

-- 5. ENABLE RLS ON PATIENT_ATTACHMENTS
ALTER TABLE public.patient_attachments ENABLE ROW LEVEL SECURITY;

-- 6. RLS POLICIES FOR PATIENT_ATTACHMENTS

-- Policy: Users can view attachments for their clinic's patients
CREATE POLICY patient_attachments_select ON public.patient_attachments
  FOR SELECT
  USING (
    clinic_id IN (
      SELECT clinic_id FROM public.staff_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Policy: Users can insert attachments for their clinic's patients
CREATE POLICY patient_attachments_insert ON public.patient_attachments
  FOR INSERT
  WITH CHECK (
    clinic_id IN (
      SELECT clinic_id FROM public.staff_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Policy: Users can update their clinic's patient attachments
CREATE POLICY patient_attachments_update ON public.patient_attachments
  FOR UPDATE
  USING (
    clinic_id IN (
      SELECT clinic_id FROM public.staff_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Policy: Users can delete their clinic's patient attachments
CREATE POLICY patient_attachments_delete ON public.patient_attachments
  FOR DELETE
  USING (
    clinic_id IN (
      SELECT clinic_id FROM public.staff_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- 7. ADD UPDATED_AT TRIGGER FOR PATIENT_ATTACHMENTS
CREATE OR REPLACE FUNCTION update_patient_attachments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_patient_attachments_updated_at
  BEFORE UPDATE ON public.patient_attachments
  FOR EACH ROW
  EXECUTE FUNCTION update_patient_attachments_updated_at();

-- 8. VERIFICATION
DO $$
BEGIN
  RAISE NOTICE '✅ Migration 008 completed successfully';
  RAISE NOTICE '   - Added date_of_birth, reason_for_visit, medical_history to patients';
  RAISE NOTICE '   - Added source to appointments';
  RAISE NOTICE '   - Created patient_attachments table with RLS';
  RAISE NOTICE '   - Created indexes for performance';
END $$;
