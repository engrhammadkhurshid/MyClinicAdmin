export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          phone: string
          specialty: string
          clinic_name: string | null
          clinic_type: string | null
          profile_picture_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          name: string
          phone: string
          specialty: string
          clinic_name?: string | null
          clinic_type?: string | null
          profile_picture_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          phone?: string
          specialty?: string
          clinic_name?: string | null
          clinic_type?: string | null
          profile_picture_url?: string | null
        }
      }
      patients: {
        Row: {
          id: string
          user_id: string
          full_name: string
          gender: string
          age: number
          address: string
          phone: string
          email: string | null
          labels: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name: string
          gender: string
          age: number
          address: string
          phone: string
          email?: string | null
          labels?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string
          gender?: string
          age?: number
          address?: string
          phone?: string
          email?: string | null
          labels?: string[]
          updated_at?: string
        }
      }
      appointments: {
        Row: {
          id: string
          user_id: string
          patient_id: string
          visit_type: string
          diagnosis: string
          notes: string | null
          appointment_date: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          patient_id: string
          visit_type: string
          diagnosis: string
          notes?: string | null
          appointment_date: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          patient_id?: string
          visit_type?: string
          diagnosis?: string
          notes?: string | null
          appointment_date?: string
          status?: string
          updated_at?: string
        }
      }
      attachments: {
        Row: {
          id: string
          user_id: string
          patient_id: string
          file_url: string
          file_name: string
          file_type: string
          uploaded_at: string
        }
        Insert: {
          id?: string
          user_id: string
          patient_id: string
          file_url: string
          file_name: string
          file_type: string
          uploaded_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          patient_id?: string
          file_url?: string
          file_name?: string
          file_type?: string
        }
      }
    }
  }
}
