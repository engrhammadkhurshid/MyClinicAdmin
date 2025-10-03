-- Verification Script for Performance Optimizations
-- Copy and run these queries one by one in Supabase SQL Editor

-- =====================================================
-- 1. CHECK ALL INDEXES CREATED
-- =====================================================
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('patients', 'appointments', 'profiles')
ORDER BY tablename, indexname;

-- Expected: You should see indexes like:
-- - idx_patients_full_name (GIN index for search)
-- - idx_patients_phone
-- - idx_patients_created_at
-- - idx_appointments_date
-- - idx_appointments_created_at
-- - idx_appointments_patient_id
-- - idx_appointments_status
-- And more...

-- =====================================================
-- 2. TEST DASHBOARD STATS (Materialized View)
-- =====================================================
SELECT * FROM dashboard_stats;

-- Expected: Single row with:
-- - total_patients
-- - total_appointments
-- - scheduled_appointments
-- - completed_appointments
-- - today_appointments
-- - last_updated

-- =====================================================
-- 3. TEST PATIENT SEARCH FUNCTION
-- =====================================================
-- Search all patients (page 1, 20 results)
SELECT * FROM search_patients('', 1, 20);

-- Search by name (try a partial match)
-- SELECT * FROM search_patients('john', 1, 20);

-- =====================================================
-- 4. TEST APPOINTMENTS FUNCTION
-- =====================================================
-- Get all appointments (page 1, 20 results)
SELECT * FROM get_appointments_with_patients(NULL, 1, 20);

-- Get today's appointments only
-- SELECT * FROM get_appointments_with_patients(CURRENT_DATE, 1, 20);

-- =====================================================
-- 5. CHECK FUNCTIONS EXIST
-- =====================================================
SELECT 
  routine_name,
  routine_type,
  data_type as return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'search_patients',
    'get_appointments_with_patients',
    'refresh_dashboard_stats',
    'trigger_refresh_dashboard_stats'
  )
ORDER BY routine_name;

-- Expected: 4 functions listed

-- =====================================================
-- 6. CHECK TRIGGERS EXIST
-- =====================================================
SELECT 
  trigger_name,
  event_object_table,
  action_timing,
  event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name IN (
    'refresh_stats_on_patient_change',
    'refresh_stats_on_appointment_change'
  )
ORDER BY trigger_name;

-- Expected: 2 triggers listed

-- =====================================================
-- 7. MANUALLY REFRESH DASHBOARD STATS (Optional)
-- =====================================================
-- SELECT refresh_dashboard_stats();
-- SELECT * FROM dashboard_stats;

-- =====================================================
-- SUCCESS! All optimizations are working! 🚀
-- =====================================================
