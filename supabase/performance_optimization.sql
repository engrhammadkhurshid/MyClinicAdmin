-- Performance Optimization for MyClinicAdmin Database
-- Run this in Supabase SQL Editor

-- =====================================================
-- 0. ENABLE REQUIRED EXTENSIONS (MUST BE FIRST!)
-- =====================================================

-- Enable pg_trgm extension for fuzzy text search (MUST come before GIN indexes)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- =====================================================
-- 1. CREATE INDEXES FOR FREQUENTLY QUERIED FIELDS
-- =====================================================

-- Index on patients.full_name for search (requires pg_trgm extension)
CREATE INDEX IF NOT EXISTS idx_patients_full_name 
ON patients USING gin (full_name gin_trgm_ops);

-- Index on patients.phone for search
CREATE INDEX IF NOT EXISTS idx_patients_phone 
ON patients (phone);

-- Index on patients.created_at for sorting
CREATE INDEX IF NOT EXISTS idx_patients_created_at 
ON patients (created_at DESC);

-- Index on appointments.appointment_date for filtering
CREATE INDEX IF NOT EXISTS idx_appointments_date 
ON appointments (appointment_date DESC);

-- Index on appointments.patient_id for joins (if not already exists from schema.sql)
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id 
ON appointments (patient_id);

-- Index on appointments.status for filtering (if not already exists from schema.sql)
CREATE INDEX IF NOT EXISTS idx_appointments_status 
ON appointments (status);

-- Index on appointments.created_at for recent activity
CREATE INDEX IF NOT EXISTS idx_appointments_created_at 
ON appointments (created_at DESC);

-- Index on profiles.id (primary key, usually automatic but ensuring)
CREATE INDEX IF NOT EXISTS idx_profiles_id 
ON profiles (id);

-- =====================================================
-- 2. ADD DATABASE STATISTICS
-- =====================================================

-- Analyze tables to update statistics for query planner
ANALYZE patients;
ANALYZE appointments;
ANALYZE profiles;

-- =====================================================
-- 3. CREATE MATERIALIZED VIEW FOR DASHBOARD KPIs
-- =====================================================

-- Materialized view for fast dashboard statistics
CREATE MATERIALIZED VIEW IF NOT EXISTS dashboard_stats AS
SELECT
  (SELECT COUNT(*) FROM patients) as total_patients,
  (SELECT COUNT(*) FROM appointments) as total_appointments,
  (SELECT COUNT(*) FROM appointments WHERE status = 'scheduled') as scheduled_appointments,
  (SELECT COUNT(*) FROM appointments WHERE status = 'completed') as completed_appointments,
  (SELECT COUNT(*) FROM appointments WHERE appointment_date = CURRENT_DATE) as today_appointments,
  NOW() as last_updated;

-- Index on the materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_dashboard_stats_unique 
ON dashboard_stats (last_updated);

-- Function to refresh dashboard stats
CREATE OR REPLACE FUNCTION refresh_dashboard_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY dashboard_stats;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 4. ADD FOREIGN KEY INDEXES (if not exists)
-- =====================================================

-- Ensure foreign key on appointments.patient_id has an index
-- (This was created above as idx_appointments_patient_id)

-- =====================================================
-- 5. CREATE FUNCTION FOR EFFICIENT PATIENT SEARCH
-- =====================================================

CREATE OR REPLACE FUNCTION search_patients(search_query TEXT, page_num INT DEFAULT 1, page_size INT DEFAULT 20)
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  gender TEXT,
  age INTEGER,
  created_at TIMESTAMPTZ,
  total_count BIGINT
) AS $$
DECLARE
  offset_val INT := (page_num - 1) * page_size;
BEGIN
  RETURN QUERY
  WITH counted AS (
    SELECT COUNT(*) OVER() as total
    FROM patients p
    WHERE 
      search_query IS NULL 
      OR search_query = ''
      OR p.full_name ILIKE '%' || search_query || '%'
      OR p.phone ILIKE '%' || search_query || '%'
      OR p.email ILIKE '%' || search_query || '%'
  )
  SELECT 
    p.id,
    p.full_name,
    p.phone,
    p.email,
    p.address,
    p.gender,
    p.age,
    p.created_at,
    COALESCE(c.total, 0) as total_count
  FROM patients p
  CROSS JOIN LATERAL (SELECT total FROM counted LIMIT 1) c
  WHERE 
    search_query IS NULL 
    OR search_query = ''
    OR p.full_name ILIKE '%' || search_query || '%'
    OR p.phone ILIKE '%' || search_query || '%'
    OR p.email ILIKE '%' || search_query || '%'
  ORDER BY p.created_at DESC
  LIMIT page_size
  OFFSET offset_val;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- 6. CREATE FUNCTION FOR EFFICIENT APPOINTMENT QUERIES
-- =====================================================

CREATE OR REPLACE FUNCTION get_appointments_with_patients(
  filter_date DATE DEFAULT NULL,
  page_num INT DEFAULT 1,
  page_size INT DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  patient_id UUID,
  patient_name TEXT,
  patient_phone TEXT,
  appointment_date TIMESTAMPTZ,
  visit_type TEXT,
  diagnosis TEXT,
  status TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ,
  total_count BIGINT
) AS $$
DECLARE
  offset_val INT := (page_num - 1) * page_size;
BEGIN
  RETURN QUERY
  WITH counted AS (
    SELECT COUNT(*) OVER() as total
    FROM appointments a
    WHERE filter_date IS NULL OR DATE(a.appointment_date) = filter_date
  )
  SELECT 
    a.id,
    a.patient_id,
    p.full_name as patient_name,
    p.phone as patient_phone,
    a.appointment_date,
    a.visit_type,
    a.diagnosis,
    a.status,
    a.notes,
    a.created_at,
    COALESCE(c.total, 0) as total_count
  FROM appointments a
  INNER JOIN patients p ON a.patient_id = p.id
  CROSS JOIN LATERAL (SELECT total FROM counted LIMIT 1) c
  WHERE filter_date IS NULL OR DATE(a.appointment_date) = filter_date
  ORDER BY a.appointment_date DESC
  LIMIT page_size
  OFFSET offset_val;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- 7. ADD TRIGGERS FOR AUTOMATIC STATS REFRESH
-- =====================================================

-- Create trigger function to refresh stats after changes
CREATE OR REPLACE FUNCTION trigger_refresh_dashboard_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Refresh dashboard stats asynchronously
  PERFORM pg_notify('refresh_stats', '');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on patients insert/delete
CREATE TRIGGER refresh_stats_on_patient_change
AFTER INSERT OR DELETE ON patients
FOR EACH STATEMENT
EXECUTE FUNCTION trigger_refresh_dashboard_stats();

-- Trigger on appointments insert/update/delete
CREATE TRIGGER refresh_stats_on_appointment_change
AFTER INSERT OR UPDATE OR DELETE ON appointments
FOR EACH STATEMENT
EXECUTE FUNCTION trigger_refresh_dashboard_stats();

-- =====================================================
-- 8. UPDATE TABLE STATISTICS
-- =====================================================

-- Update statistics for query planner (VACUUM removed - cannot run in transaction)
ANALYZE patients;
ANALYZE appointments;
ANALYZE profiles;

-- Note: VACUUM should be run separately outside transaction if needed
-- Run manually in Supabase SQL Editor with: VACUUM ANALYZE patients;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check all indexes
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('patients', 'appointments', 'profiles')
ORDER BY tablename, indexname;

-- Check table sizes
SELECT
  relname as table_name,
  pg_size_pretty(pg_total_relation_size(relid)) as total_size,
  pg_size_pretty(pg_relation_size(relid)) as table_size,
  pg_size_pretty(pg_total_relation_size(relid) - pg_relation_size(relid)) as indexes_size
FROM pg_catalog.pg_statio_user_tables
WHERE relname IN ('patients', 'appointments', 'profiles')
ORDER BY pg_total_relation_size(relid) DESC;

-- =====================================================
-- USAGE EXAMPLES
-- =====================================================

-- Search patients with pagination
-- SELECT * FROM search_patients('john', 1, 20);

-- Get appointments for today with pagination
-- SELECT * FROM get_appointments_with_patients(CURRENT_DATE, 1, 20);

-- Get all appointments with pagination
-- SELECT * FROM get_appointments_with_patients(NULL, 1, 20);

-- Refresh dashboard stats manually
-- SELECT refresh_dashboard_stats();

-- Get dashboard stats
-- SELECT * FROM dashboard_stats;
