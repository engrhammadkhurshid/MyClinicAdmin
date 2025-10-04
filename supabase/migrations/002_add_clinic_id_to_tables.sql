-- =====================================================
-- RBAC IMPLEMENTATION - PHASE 2: ADD CLINIC_ID TO EXISTING TABLES
-- =====================================================
-- This migration adds clinic_id to existing tables for multi-tenancy
-- Run this AFTER migration 001

-- =====================================================
-- 1. ADD CLINIC_ID COLUMN TO PATIENTS
-- =====================================================
-- Add column as nullable first (for backward compatibility)
ALTER TABLE public.patients 
ADD COLUMN IF NOT EXISTS clinic_id UUID REFERENCES public.clinic(id) ON DELETE CASCADE;

-- Backfill clinic_id for existing patients
-- Links patient to the clinic owned by the patient's creator
UPDATE public.patients p
SET clinic_id = (
    SELECT c.id 
    FROM public.clinic c 
    WHERE c.owner_id = p.user_id 
    LIMIT 1
)
WHERE p.clinic_id IS NULL;

-- Now make it NOT NULL (after backfill)
ALTER TABLE public.patients 
ALTER COLUMN clinic_id SET NOT NULL;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_patients_clinic_id ON public.patients(clinic_id);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_patients_clinic_user ON public.patients(clinic_id, user_id);
CREATE INDEX IF NOT EXISTS idx_patients_clinic_name ON public.patients(clinic_id, full_name);

-- =====================================================
-- 2. ADD CLINIC_ID COLUMN TO APPOINTMENTS
-- =====================================================
ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS clinic_id UUID REFERENCES public.clinic(id) ON DELETE CASCADE;

-- Backfill clinic_id for existing appointments
UPDATE public.appointments a
SET clinic_id = (
    SELECT c.id 
    FROM public.clinic c 
    WHERE c.owner_id = a.user_id 
    LIMIT 1
)
WHERE a.clinic_id IS NULL;

-- Make NOT NULL
ALTER TABLE public.appointments 
ALTER COLUMN clinic_id SET NOT NULL;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_appointments_clinic_id ON public.appointments(clinic_id);
CREATE INDEX IF NOT EXISTS idx_appointments_clinic_date ON public.appointments(clinic_id, appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_clinic_status ON public.appointments(clinic_id, status);

-- =====================================================
-- 3. ADD CLINIC_ID COLUMN TO ATTACHMENTS
-- =====================================================
ALTER TABLE public.attachments 
ADD COLUMN IF NOT EXISTS clinic_id UUID REFERENCES public.clinic(id) ON DELETE CASCADE;

-- Backfill clinic_id for existing attachments
UPDATE public.attachments a
SET clinic_id = (
    SELECT c.id 
    FROM public.clinic c 
    WHERE c.owner_id = a.user_id 
    LIMIT 1
)
WHERE a.clinic_id IS NULL;

-- Make NOT NULL
ALTER TABLE public.attachments 
ALTER COLUMN clinic_id SET NOT NULL;

-- Add index
CREATE INDEX IF NOT EXISTS idx_attachments_clinic_id ON public.attachments(clinic_id);

-- =====================================================
-- 4. VERIFICATION: CHECK DATA INTEGRITY
-- =====================================================
DO $$
DECLARE
    patients_without_clinic INTEGER;
    appointments_without_clinic INTEGER;
    attachments_without_clinic INTEGER;
BEGIN
    -- Check for any orphaned records
    SELECT COUNT(*) INTO patients_without_clinic 
    FROM public.patients WHERE clinic_id IS NULL;
    
    SELECT COUNT(*) INTO appointments_without_clinic 
    FROM public.appointments WHERE clinic_id IS NULL;
    
    SELECT COUNT(*) INTO attachments_without_clinic 
    FROM public.attachments WHERE clinic_id IS NULL;
    
    IF patients_without_clinic > 0 THEN
        RAISE WARNING 'Found % patients without clinic_id', patients_without_clinic;
    END IF;
    
    IF appointments_without_clinic > 0 THEN
        RAISE WARNING 'Found % appointments without clinic_id', appointments_without_clinic;
    END IF;
    
    IF attachments_without_clinic > 0 THEN
        RAISE WARNING 'Found % attachments without clinic_id', attachments_without_clinic;
    END IF;
    
    RAISE NOTICE '✅ Data integrity check complete';
    RAISE NOTICE '   - Patients with clinic_id: %', (SELECT COUNT(*) FROM public.patients WHERE clinic_id IS NOT NULL);
    RAISE NOTICE '   - Appointments with clinic_id: %', (SELECT COUNT(*) FROM public.appointments WHERE clinic_id IS NOT NULL);
    RAISE NOTICE '   - Attachments with clinic_id: %', (SELECT COUNT(*) FROM public.attachments WHERE clinic_id IS NOT NULL);
END $$;

-- =====================================================
-- 5. UPDATE EXISTING HELPER FUNCTIONS
-- =====================================================
-- Update get_patient_stats to be clinic-aware
CREATE OR REPLACE FUNCTION get_patient_stats(user_uuid UUID)
RETURNS TABLE (
    total_patients BIGINT,
    total_appointments BIGINT,
    appointments_today BIGINT,
    monthly_visits BIGINT
) AS $$
DECLARE
    user_clinic_id UUID;
BEGIN
    -- Get user's clinic ID
    SELECT clinic_id INTO user_clinic_id
    FROM public.staff_members
    WHERE user_id = user_uuid AND status = 'active'
    LIMIT 1;
    
    -- Return stats for the entire clinic (not just user's records)
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM public.patients WHERE clinic_id = user_clinic_id),
        (SELECT COUNT(*) FROM public.appointments WHERE clinic_id = user_clinic_id),
        (SELECT COUNT(*) FROM public.appointments 
         WHERE clinic_id = user_clinic_id 
         AND DATE(appointment_date) = CURRENT_DATE),
        (SELECT COUNT(*) FROM public.appointments 
         WHERE clinic_id = user_clinic_id 
         AND DATE_TRUNC('month', appointment_date) = DATE_TRUNC('month', CURRENT_DATE));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. COMPLETION MESSAGE
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '✅ RBAC Phase 2 Complete: clinic_id added to all tables';
    RAISE NOTICE '';
    RAISE NOTICE 'Updated tables:';
    RAISE NOTICE '   - patients: Added clinic_id column and indexes';
    RAISE NOTICE '   - appointments: Added clinic_id column and indexes';
    RAISE NOTICE '   - attachments: Added clinic_id column and indexes';
    RAISE NOTICE '';
    RAISE NOTICE 'Next step:';
    RAISE NOTICE '1. Run migration 003_update_rls_policies.sql';
END $$;
