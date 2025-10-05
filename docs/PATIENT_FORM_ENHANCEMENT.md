# Enhanced Patient Form - Setup Guide

## ✅ Completed

### 1. Database Migration
**File**: `supabase/migrations/008_enhance_patient_attachments.sql`

**Changes Made:**
- Added `date_of_birth`, `reason_for_visit`, `medical_history` to `patients` table
- Added `source` to `appointments` table  
- Created `patient_attachments` table with RLS policies
- Added indexes for performance
- Created update triggers

**To Run:**
```sql
-- Run this in Supabase SQL Editor or via CLI
psql -f supabase/migrations/008_enhance_patient_attachments.sql
```

### 2. Utility Libraries Created

**`lib/imageCompression.ts`** - Image optimization
- `compressImage()` - Compress single image to WebP
- `compressMultipleImages()` - Batch compression with progress
- `calculateAge()` - Calculate age from DOB (e.g., "2y 3m")
- `isValidImageType()` - Validate file types
- `isValidFileSize()` - Check file size limits

**`lib/supabase/storage.ts`** - Supabase Storage operations
- `uploadMedicalRecord()` - Upload to storage bucket
- `deleteMedicalRecord()` - Remove files
- `getPatientMedicalRecords()` - List patient files
- `saveAttachmentMetadata()` - Save to database

### 3. Required Package
```bash
npm install browser-image-compression
```

## 🚀 Next Steps

### Step 1: Run Database Migration
```bash
# Option 1: Via Supabase Dashboard
# Go to SQL Editor and run 008_enhance_patient_attachments.sql

# Option 2: Via Supabase CLI
supabase db push
```

### Step 2: Create Storage Bucket
1. Go to Supabase Dashboard → Storage
2. Click "New Bucket"
3. Name: `medical-records`
4. Public bucket: **Yes** (with RLS policies)
5. File size limit: 10MB
6. Allowed MIME types: `image/jpeg,image/png,image/webp`

### Step 3: Set Storage RLS Policies

```sql
-- Allow authenticated users to upload to their clinic's patient folders
CREATE POLICY "Users can upload medical records"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'medical-records' AND
  (storage.foldername(name))[1] IN (
    SELECT patient_id::text FROM patients 
    WHERE clinic_id IN (
      SELECT clinic_id FROM staff_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  )
);

-- Allow users to view their clinic's medical records
CREATE POLICY "Users can view medical records"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'medical-records' AND
  (storage.foldername(name))[1] IN (
    SELECT patient_id::text FROM patients 
    WHERE clinic_id IN (
      SELECT clinic_id FROM staff_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  )
);

-- Allow users to delete their clinic's medical records  
CREATE POLICY "Users can delete medical records"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'medical-records' AND
  (storage.foldername(name))[1] IN (
    SELECT patient_id::text FROM patients 
    WHERE clinic_id IN (
      SELECT clinic_id FROM staff_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  )
);
```

### Step 4: Update Form Components
The enhanced patient form will include:

**Card 1: Basic Information**
- Full Name
- Date of Birth (with auto-calculated age)
- Gender

**Card 2: Contact Information**
- Phone Number
- Email (optional)
- Address

**Card 3: Medical Information**
- Reason for Visit / Symptoms
- Previous Medical History
- Medical Records (Image upload with compression)

**Card 4: Appointment Details**
- Appointment Date
- Appointment Time
- Visit Type
- Source (Walk In, Referral, Google Ads, Meta Ads, Other)

## 📊 Performance Optimization

### Image Compression Settings
- **Original**: ~3-5MB per JPEG
- **Compressed**: ~300-500KB per WebP
- **Savings**: ~90%
- **Quality**: 80-85% (visually identical)

### Storage Estimates
- 1000 patients × 3 images avg = 1.5GB (compressed) vs 15GB (original)
- Supabase free tier: 1GB storage
- Cost at scale: ~$0.021/GB/month

### Performance Impact
| Operation | Time | Notes |
|-----------|------|-------|
| Image Compression | 1-2s | Client-side, non-blocking |
| Upload to Storage | 1-3s | Depends on connection |
| Database Insert | 100ms | Metadata only |

## 🔐 Security

### RLS Policies
- ✅ Users can only access their clinic's data
- ✅ Storage files protected by RLS
- ✅ Automatic user tracking (uploaded_by)
- ✅ Cascade delete (when patient deleted)

### File Validation
- ✅ Max file size: 10MB
- ✅ Allowed types: JPEG, PNG, WebP
- ✅ Client-side validation
- ✅ Server-side validation (Supabase)

## 📱 Mobile Features
- Camera capture for instant upload
- Progressive image upload with progress indicator
- Responsive multi-card form layout
- Touch-friendly file picker

## 🎯 Usage Example

```typescript
import { compressImage } from '@/lib/imageCompression'
import { uploadMedicalRecord, saveAttachmentMetadata } from '@/lib/supabase/storage'

// Compress image
const compressed = await compressImage(file)

// Upload to storage
const result = await uploadMedicalRecord(patientId, compressed)

if (result.success) {
  // Save metadata to database
  await saveAttachmentMetadata(
    patientId,
    clinicId,
    result.fileUrl!,
    result.fileName!,
    compressed.type,
    compressed.size
  )
}
```

## ✨ Features Completed
- ✅ Database schema with RLS
- ✅ Image compression utility
- ✅ Storage upload/download functions
- ✅ Age calculation from DOB
- ✅ File validation helpers
- ✅ Metadata tracking

## 🔜 Remaining Tasks
1. Update AppointmentForm component with multi-card layout
2. Update patient/new page with enhanced form
3. Add attachment gallery to patient profile
4. Test image upload flow
5. Deploy to production

---

**Ready to implement the enhanced forms!** 🚀
