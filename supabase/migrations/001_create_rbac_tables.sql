-- =====================================================
-- RBAC IMPLEMENTATION - PHASE 1: CREATE NEW TABLES
-- =====================================================
-- This migration adds multi-role support without breaking existing functionality
-- Run this in Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search and slugify

-- =====================================================
-- 1. CREATE CLINIC TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.clinic (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    type TEXT, -- e.g., "General Practice", "Dental", "Pediatric"
    location TEXT,
    phone TEXT,
    address TEXT,
    logo_url TEXT,
    settings JSONB DEFAULT '{}'::jsonb, -- For future extensibility
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_clinic_owner_id ON public.clinic(owner_id);
CREATE INDEX IF NOT EXISTS idx_clinic_slug ON public.clinic(slug);

-- Add trigger for updated_at
CREATE TRIGGER update_clinic_updated_at
    BEFORE UPDATE ON public.clinic
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 2. CREATE ROLE TYPE ENUM
-- =====================================================
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role_type') THEN
        CREATE TYPE role_type AS ENUM ('owner', 'manager');
    END IF;
END $$;

-- =====================================================
-- 3. CREATE STAFF_MEMBERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.staff_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES public.clinic(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role role_type NOT NULL,
    staff_id TEXT NOT NULL, -- Generated: "clinic-slug-username"
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    permissions JSONB DEFAULT '{}'::jsonb, -- For future fine-grained permissions
    invited_by UUID REFERENCES auth.users(id), -- Track who invited this staff member
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE (clinic_id, user_id), -- One user can only have one role per clinic
    UNIQUE (clinic_id, staff_id) -- Staff ID must be unique within clinic
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_staff_members_clinic_id ON public.staff_members(clinic_id);
CREATE INDEX IF NOT EXISTS idx_staff_members_user_id ON public.staff_members(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_members_status ON public.staff_members(status);
CREATE INDEX IF NOT EXISTS idx_staff_members_user_status ON public.staff_members(user_id, status);

-- Add trigger for updated_at
CREATE TRIGGER update_staff_members_updated_at
    BEFORE UPDATE ON public.staff_members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 4. CREATE STAFF_INVITES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.staff_invites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES public.clinic(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    role role_type NOT NULL DEFAULT 'manager',
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    accepted_at TIMESTAMP WITH TIME ZONE,
    invited_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_staff_invites_clinic_id ON public.staff_invites(clinic_id);
CREATE INDEX IF NOT EXISTS idx_staff_invites_email ON public.staff_invites(email);
CREATE INDEX IF NOT EXISTS idx_staff_invites_token ON public.staff_invites(token);
CREATE INDEX IF NOT EXISTS idx_staff_invites_expires_at ON public.staff_invites(expires_at);

-- =====================================================
-- 5. HELPER FUNCTION: SLUGIFY TEXT
-- =====================================================
CREATE OR REPLACE FUNCTION slugify(txt TEXT) 
RETURNS TEXT AS $$
BEGIN
    RETURN lower(
        regexp_replace(
            regexp_replace(
                trim(txt), 
                '[^a-zA-Z0-9]+', 
                '-', 
                'g'
            ),
            '^-|-$',
            '',
            'g'
        )
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- 6. HELPER FUNCTION: GENERATE STAFF ID
-- =====================================================
CREATE OR REPLACE FUNCTION gen_staff_id()
RETURNS TRIGGER AS $$
DECLARE
    clinic_slug TEXT;
    username TEXT;
    email_local TEXT;
BEGIN
    -- Get clinic slug
    SELECT slug INTO clinic_slug 
    FROM public.clinic 
    WHERE id = NEW.clinic_id;
    
    -- Get username from email
    SELECT email INTO email_local 
    FROM auth.users 
    WHERE id = NEW.user_id;
    
    -- Extract local part of email (before @)
    username := split_part(email_local, '@', 1);
    
    -- Generate staff_id: "clinic-slug-username"
    NEW.staff_id := clinic_slug || '-' || slugify(username);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to auto-generate staff_id
DROP TRIGGER IF EXISTS staff_members_gen_id ON public.staff_members;
CREATE TRIGGER staff_members_gen_id
    BEFORE INSERT ON public.staff_members
    FOR EACH ROW 
    WHEN (NEW.staff_id = '' OR NEW.staff_id IS NULL)
    EXECUTE FUNCTION gen_staff_id();

-- =====================================================
-- 7. MIGRATION: CREATE CLINICS FOR EXISTING USERS
-- =====================================================
-- This auto-upgrades existing users to clinic owners
-- Safe to run multiple times (idempotent)

DO $$
DECLARE
    user_record RECORD;
    clinic_id_var UUID;
    clinic_slug_var TEXT;
    clinic_name_var TEXT;
BEGIN
    -- Loop through all users who don't have a clinic yet
    FOR user_record IN 
        SELECT u.id, u.email, p.name, p.phone, p.specialty
        FROM auth.users u
        LEFT JOIN public.profiles p ON p.id = u.id
        WHERE u.id NOT IN (SELECT owner_id FROM public.clinic)
    LOOP
        -- Generate clinic name from user's name or email
        clinic_name_var := COALESCE(user_record.name, split_part(user_record.email, '@', 1)) || '''s Clinic';
        clinic_slug_var := 'clinic-' || substr(user_record.id::text, 1, 8);
        
        -- Create clinic for this user
        INSERT INTO public.clinic (owner_id, name, slug, phone, type)
        VALUES (
            user_record.id,
            clinic_name_var,
            clinic_slug_var,
            user_record.phone,
            COALESCE(user_record.specialty, 'General Practice')
        )
        RETURNING id INTO clinic_id_var;
        
        -- Create owner staff_member entry
        INSERT INTO public.staff_members (clinic_id, user_id, role, staff_id, status)
        VALUES (
            clinic_id_var,
            user_record.id,
            'owner',
            '', -- Trigger will generate
            'active'
        );
        
        RAISE NOTICE 'Created clinic for user: % (ID: %)', user_record.email, user_record.id;
    END LOOP;
    
    RAISE NOTICE '✅ Migration complete: All existing users now have clinics';
END $$;

-- =====================================================
-- 8. COMPLETION MESSAGE
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '✅ RBAC Phase 1 Complete: New tables created';
    RAISE NOTICE '   - clinic: % rows', (SELECT COUNT(*) FROM public.clinic);
    RAISE NOTICE '   - staff_members: % rows', (SELECT COUNT(*) FROM public.staff_members);
    RAISE NOTICE '   - staff_invites: % rows', (SELECT COUNT(*) FROM public.staff_invites);
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Run migration 002_add_clinic_id_to_tables.sql';
    RAISE NOTICE '2. Run migration 003_update_rls_policies.sql';
END $$;
