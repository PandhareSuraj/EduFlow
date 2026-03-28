export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      academic_years: {
        Row: {
          college_id: string | null
          created_at: string
          created_by: string | null
          end_date: string
          id: string
          is_current: boolean
          start_date: string
          status: string
          updated_at: string
          updated_by: string | null
          year_code: string
        }
        Insert: {
          college_id?: string | null
          created_at?: string
          created_by?: string | null
          end_date: string
          id?: string
          is_current?: boolean
          start_date: string
          status?: string
          updated_at?: string
          updated_by?: string | null
          year_code: string
        }
        Update: {
          college_id?: string | null
          created_at?: string
          created_by?: string | null
          end_date?: string
          id?: string
          is_current?: boolean
          start_date?: string
          status?: string
          updated_at?: string
          updated_by?: string | null
          year_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "academic_years_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_logs: {
        Row: {
          action: string
          college_id: string | null
          created_at: string | null
          details: Json | null
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          college_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          college_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      amc_payments: {
        Row: {
          amount: number
          base_fee: number
          calculated_amount: number
          college_id: string
          created_at: string
          created_by: string | null
          id: string
          invoice_number: string | null
          notes: string | null
          payment_date: string
          payment_method: string
          payment_period_end: string
          payment_period_start: string
          per_student_fee: number
          per_user_fee: number
          receipt_number: string | null
          status: string
          student_count: number
          transaction_reference: string | null
          updated_at: string
          updated_by: string | null
          user_count: number
        }
        Insert: {
          amount: number
          base_fee?: number
          calculated_amount?: number
          college_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          invoice_number?: string | null
          notes?: string | null
          payment_date?: string
          payment_method?: string
          payment_period_end: string
          payment_period_start: string
          per_student_fee?: number
          per_user_fee?: number
          receipt_number?: string | null
          status?: string
          student_count?: number
          transaction_reference?: string | null
          updated_at?: string
          updated_by?: string | null
          user_count?: number
        }
        Update: {
          amount?: number
          base_fee?: number
          calculated_amount?: number
          college_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          invoice_number?: string | null
          notes?: string | null
          payment_date?: string
          payment_method?: string
          payment_period_end?: string
          payment_period_start?: string
          per_student_fee?: number
          per_user_fee?: number
          receipt_number?: string | null
          status?: string
          student_count?: number
          transaction_reference?: string | null
          updated_at?: string
          updated_by?: string | null
          user_count?: number
        }
        Relationships: []
      }
      amc_plans: {
        Row: {
          base_fee: number
          billing_cycle: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          discount_percentage: number | null
          features: Json | null
          id: string
          is_active: boolean | null
          max_students: number | null
          max_users: number | null
          name: string
          per_student_fee: number
          per_user_fee: number
          sort_order: number | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          base_fee?: number
          billing_cycle?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          discount_percentage?: number | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          max_students?: number | null
          max_users?: number | null
          name: string
          per_student_fee?: number
          per_user_fee?: number
          sort_order?: number | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          base_fee?: number
          billing_cycle?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          discount_percentage?: number | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          max_students?: number | null
          max_users?: number | null
          name?: string
          per_student_fee?: number
          per_user_fee?: number
          sort_order?: number | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      attendance_records: {
        Row: {
          college_id: string | null
          created_at: string
          created_by: string | null
          id: string
          marked_at: string | null
          marked_by: string | null
          remarks: string | null
          session_id: string
          status: string
          student_id: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          college_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          marked_at?: string | null
          marked_by?: string | null
          remarks?: string | null
          session_id: string
          status?: string
          student_id: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          college_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          marked_at?: string | null
          marked_by?: string | null
          remarks?: string | null
          session_id?: string
          status?: string
          student_id?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      attendance_sessions: {
        Row: {
          absent_count: number | null
          attendance_percentage: number | null
          class_name: string
          college_id: string | null
          course_id: number
          created_at: string
          created_by: string | null
          end_time: string | null
          faculty_id: string
          id: string
          present_count: number | null
          schedule_id: string | null
          session_date: string
          start_time: string
          status: string
          subject_id: string
          total_students: number | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          absent_count?: number | null
          attendance_percentage?: number | null
          class_name: string
          college_id?: string | null
          course_id: number
          created_at?: string
          created_by?: string | null
          end_time?: string | null
          faculty_id: string
          id?: string
          present_count?: number | null
          schedule_id?: string | null
          session_date?: string
          start_time: string
          status?: string
          subject_id: string
          total_students?: number | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          absent_count?: number | null
          attendance_percentage?: number | null
          class_name?: string
          college_id?: string | null
          course_id?: number
          created_at?: string
          created_by?: string | null
          end_time?: string | null
          faculty_id?: string
          id?: string
          present_count?: number | null
          schedule_id?: string | null
          session_date?: string
          start_time?: string
          status?: string
          subject_id?: string
          total_students?: number | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          college_id: string | null
          created_at: string | null
          id: string
          new_values: Json | null
          old_values: Json | null
          record_id: string
          table_name: string
          user_id: string | null
        }
        Insert: {
          action: string
          college_id?: string | null
          created_at?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id: string
          table_name: string
          user_id?: string | null
        }
        Update: {
          action?: string
          college_id?: string | null
          created_at?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string
          table_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      book_categories: {
        Row: {
          college_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          college_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          college_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      book_issues: {
        Row: {
          book_id: string
          college_id: string | null
          created_at: string
          created_by: string | null
          due_date: string
          id: string
          issue_date: string
          issued_by: string | null
          max_renewals: number | null
          member_id: string
          remarks: string | null
          renewal_count: number | null
          return_date: string | null
          returned_by: string | null
          status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          book_id: string
          college_id?: string | null
          created_at?: string
          created_by?: string | null
          due_date: string
          id?: string
          issue_date?: string
          issued_by?: string | null
          max_renewals?: number | null
          member_id: string
          remarks?: string | null
          renewal_count?: number | null
          return_date?: string | null
          returned_by?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          book_id?: string
          college_id?: string | null
          created_at?: string
          created_by?: string | null
          due_date?: string
          id?: string
          issue_date?: string
          issued_by?: string | null
          max_renewals?: number | null
          member_id?: string
          remarks?: string | null
          renewal_count?: number | null
          return_date?: string | null
          returned_by?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      books: {
        Row: {
          author: string
          available_copies: number
          category_id: string | null
          college_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          isbn: string | null
          language: string | null
          location: string | null
          pages: number | null
          price: number | null
          publication_year: number | null
          publisher: string | null
          status: string
          title: string
          total_copies: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          author: string
          available_copies?: number
          category_id?: string | null
          college_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          isbn?: string | null
          language?: string | null
          location?: string | null
          pages?: number | null
          price?: number | null
          publication_year?: number | null
          publisher?: string | null
          status?: string
          title: string
          total_copies?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          author?: string
          available_copies?: number
          category_id?: string | null
          college_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          isbn?: string | null
          language?: string | null
          location?: string | null
          pages?: number | null
          price?: number | null
          publication_year?: number | null
          publisher?: string | null
          status?: string
          title?: string
          total_copies?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      buses: {
        Row: {
          bus_number: string
          capacity: number
          college_id: string | null
          created_at: string
          created_by: string | null
          driver_name: string | null
          driver_phone: string | null
          id: string
          registration_number: string | null
          route_id: string | null
          status: string
          updated_at: string
          updated_by: string | null
          vehicle_type: string | null
        }
        Insert: {
          bus_number: string
          capacity: number
          college_id?: string | null
          created_at?: string
          created_by?: string | null
          driver_name?: string | null
          driver_phone?: string | null
          id?: string
          registration_number?: string | null
          route_id?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
          vehicle_type?: string | null
        }
        Update: {
          bus_number?: string
          capacity?: number
          college_id?: string | null
          created_at?: string
          created_by?: string | null
          driver_name?: string | null
          driver_phone?: string | null
          id?: string
          registration_number?: string | null
          route_id?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
          vehicle_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "buses_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "buses_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "transport_routes"
            referencedColumns: ["id"]
          },
        ]
      }
      class_schedules: {
        Row: {
          class_name: string
          college_id: string | null
          course_id: number
          created_at: string
          day_of_week: number
          end_time: string
          faculty_id: string
          id: string
          room_number: string | null
          semester: number | null
          start_time: string
          status: string
          subject_id: string
          updated_at: string
        }
        Insert: {
          class_name: string
          college_id?: string | null
          course_id: number
          created_at?: string
          day_of_week: number
          end_time: string
          faculty_id: string
          id?: string
          room_number?: string | null
          semester?: number | null
          start_time: string
          status?: string
          subject_id: string
          updated_at?: string
        }
        Update: {
          class_name?: string
          college_id?: string | null
          course_id?: number
          created_at?: string
          day_of_week?: number
          end_time?: string
          faculty_id?: string
          id?: string
          room_number?: string | null
          semester?: number | null
          start_time?: string
          status?: string
          subject_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      college_calendar: {
        Row: {
          calendar_date: string
          calendar_type: string
          college_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_recurring: boolean
          recurrence_pattern: string | null
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          calendar_date: string
          calendar_type?: string
          college_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_recurring?: boolean
          recurrence_pattern?: string | null
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          calendar_date?: string
          calendar_type?: string
          college_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_recurring?: boolean
          recurrence_pattern?: string | null
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "college_calendar_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      college_subscriptions: {
        Row: {
          auto_renew: boolean | null
          college_id: string
          created_at: string | null
          created_by: string | null
          custom_base_fee: number | null
          custom_per_student: number | null
          custom_per_user: number | null
          discount_percentage: number | null
          discount_reason: string | null
          end_date: string
          id: string
          notes: string | null
          plan_id: string | null
          renewal_reminder_sent: boolean | null
          start_date: string
          status: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          auto_renew?: boolean | null
          college_id: string
          created_at?: string | null
          created_by?: string | null
          custom_base_fee?: number | null
          custom_per_student?: number | null
          custom_per_user?: number | null
          discount_percentage?: number | null
          discount_reason?: string | null
          end_date: string
          id?: string
          notes?: string | null
          plan_id?: string | null
          renewal_reminder_sent?: boolean | null
          start_date: string
          status?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          auto_renew?: boolean | null
          college_id?: string
          created_at?: string | null
          created_by?: string | null
          custom_base_fee?: number | null
          custom_per_student?: number | null
          custom_per_user?: number | null
          discount_percentage?: number | null
          discount_reason?: string | null
          end_date?: string
          id?: string
          notes?: string | null
          plan_id?: string | null
          renewal_reminder_sent?: boolean | null
          start_date?: string
          status?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "college_subscriptions_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: true
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "college_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "amc_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      colleges: {
        Row: {
          address: string | null
          code: string
          created_at: string
          created_by: string | null
          email: string | null
          id: string
          id_card_template_id: string | null
          logo_url: string | null
          name: string
          onboarding_completed: boolean | null
          phone: string | null
          signature_title: string | null
          signature_url: string | null
          status: string
          subscription_status: string | null
          theme_config: Json | null
          trial_ends_at: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          code: string
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          id_card_template_id?: string | null
          logo_url?: string | null
          name: string
          onboarding_completed?: boolean | null
          phone?: string | null
          signature_title?: string | null
          signature_url?: string | null
          status?: string
          subscription_status?: string | null
          theme_config?: Json | null
          trial_ends_at?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          code?: string
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          id_card_template_id?: string | null
          logo_url?: string | null
          name?: string
          onboarding_completed?: boolean | null
          phone?: string | null
          signature_title?: string | null
          signature_url?: string | null
          status?: string
          subscription_status?: string | null
          theme_config?: Json | null
          trial_ends_at?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "colleges_id_card_template_id_fkey"
            columns: ["id_card_template_id"]
            isOneToOne: false
            referencedRelation: "id_card_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address: string | null
          college_id: string | null
          company_size: string | null
          contact_person: string | null
          created_at: string
          created_by: string | null
          description: string | null
          email: string | null
          id: string
          industry: string | null
          logo_url: string | null
          name: string
          phone: string | null
          status: string
          updated_at: string
          updated_by: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          college_id?: string | null
          company_size?: string | null
          contact_person?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          email?: string | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          name: string
          phone?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          college_id?: string | null
          company_size?: string | null
          contact_person?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          email?: string | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          name?: string
          phone?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          code: string
          college_id: string | null
          created_at: string
          created_by: string | null
          department: string | null
          description: string | null
          duration_months: number
          fees_per_semester: number | null
          id: number
          name: string
          status: string
          total_semesters: number | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          code: string
          college_id?: string | null
          created_at?: string
          created_by?: string | null
          department?: string | null
          description?: string | null
          duration_months?: number
          fees_per_semester?: number | null
          id?: number
          name: string
          status?: string
          total_semesters?: number | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          code?: string
          college_id?: string | null
          created_at?: string
          created_by?: string | null
          department?: string | null
          description?: string | null
          duration_months?: number
          fees_per_semester?: number | null
          id?: number
          name?: string
          status?: string
          total_semesters?: number | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "courses_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_followups: {
        Row: {
          college_id: string | null
          contact_count: number | null
          contact_email: string | null
          contact_name: string
          contact_phone: string
          contacted_via: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          follow_up_date: string
          id: string
          last_contact_date: string | null
          next_follow_up_date: string | null
          priority: string
          remarks: string | null
          status: string
          student_id: number | null
          tags: string[] | null
          title: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          college_id?: string | null
          contact_count?: number | null
          contact_email?: string | null
          contact_name: string
          contact_phone: string
          contacted_via?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          follow_up_date: string
          id?: string
          last_contact_date?: string | null
          next_follow_up_date?: string | null
          priority?: string
          remarks?: string | null
          status?: string
          student_id?: number | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          college_id?: string | null
          contact_count?: number | null
          contact_email?: string | null
          contact_name?: string
          contact_phone?: string
          contacted_via?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          follow_up_date?: string
          id?: string
          last_contact_date?: string | null
          next_follow_up_date?: string | null
          priority?: string
          remarks?: string | null
          status?: string
          student_id?: number | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_followups_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_followups_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_payment_ledger"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "custom_followups_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          code: string | null
          college_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
          status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          code?: string | null
          college_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          code?: string | null
          college_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "departments_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      enquiries: {
        Row: {
          assigned_to: string | null
          college_id: string | null
          contact_count: number | null
          contacted_via: string | null
          course: string
          created_at: string
          created_by: string | null
          email: string | null
          follow_up_date: string | null
          id: string
          last_contact_date: string | null
          name: string
          next_follow_up_date: string | null
          notes: string | null
          phone: string | null
          priority: string | null
          source: string
          status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          assigned_to?: string | null
          college_id?: string | null
          contact_count?: number | null
          contacted_via?: string | null
          course: string
          created_at?: string
          created_by?: string | null
          email?: string | null
          follow_up_date?: string | null
          id?: string
          last_contact_date?: string | null
          name: string
          next_follow_up_date?: string | null
          notes?: string | null
          phone?: string | null
          priority?: string | null
          source?: string
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          assigned_to?: string | null
          college_id?: string | null
          contact_count?: number | null
          contacted_via?: string | null
          course?: string
          created_at?: string
          created_by?: string | null
          email?: string | null
          follow_up_date?: string | null
          id?: string
          last_contact_date?: string | null
          name?: string
          next_follow_up_date?: string | null
          notes?: string | null
          phone?: string | null
          priority?: string | null
          source?: string
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      event_attendees: {
        Row: {
          attendance_status: string
          college_id: string | null
          created_at: string
          event_id: string
          feedback_comments: string | null
          feedback_rating: number | null
          id: string
          registration_date: string
          student_id: number | null
          user_id: string | null
        }
        Insert: {
          attendance_status?: string
          college_id?: string | null
          created_at?: string
          event_id: string
          feedback_comments?: string | null
          feedback_rating?: number | null
          id?: string
          registration_date?: string
          student_id?: number | null
          user_id?: string | null
        }
        Update: {
          attendance_status?: string
          college_id?: string | null
          created_at?: string
          event_id?: string
          feedback_comments?: string | null
          feedback_rating?: number | null
          id?: string
          registration_date?: string
          student_id?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_attendees_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_attendees_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_attendees_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_payment_ledger"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "event_attendees_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      event_categories: {
        Row: {
          college_id: string | null
          color: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          college_id?: string | null
          color?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          college_id?: string | null
          color?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_categories_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          category_id: string | null
          college_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          end_time: string | null
          event_date: string
          event_type: string
          id: string
          is_public: boolean
          location: string | null
          max_attendees: number | null
          organizer_id: string | null
          poster_url: string | null
          start_time: string | null
          status: string
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          category_id?: string | null
          college_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_time?: string | null
          event_date: string
          event_type?: string
          id?: string
          is_public?: boolean
          location?: string | null
          max_attendees?: number | null
          organizer_id?: string | null
          poster_url?: string | null
          start_time?: string | null
          status?: string
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          category_id?: string | null
          college_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_time?: string | null
          event_date?: string
          event_type?: string
          id?: string
          is_public?: boolean
          location?: string | null
          max_attendees?: number | null
          organizer_id?: string | null
          poster_url?: string | null
          start_time?: string | null
          status?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "event_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      exams: {
        Row: {
          college_id: string | null
          course_id: number
          created_at: string
          created_by: string | null
          description: string | null
          duration_minutes: number | null
          end_time: string | null
          exam_date: string
          exam_type: string | null
          id: string
          instructions: string | null
          max_attempts: number | null
          name: string
          passing_marks: number | null
          start_time: string | null
          status: string
          total_marks: number
          total_questions: number | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          college_id?: string | null
          course_id: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_minutes?: number | null
          end_time?: string | null
          exam_date: string
          exam_type?: string | null
          id?: string
          instructions?: string | null
          max_attempts?: number | null
          name: string
          passing_marks?: number | null
          start_time?: string | null
          status?: string
          total_marks?: number
          total_questions?: number | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          college_id?: string | null
          course_id?: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_minutes?: number | null
          end_time?: string | null
          exam_date?: string
          exam_type?: string | null
          id?: string
          instructions?: string | null
          max_attempts?: number | null
          name?: string
          passing_marks?: number | null
          start_time?: string | null
          status?: string
          total_marks?: number
          total_questions?: number | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exams_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      faculty: {
        Row: {
          address: string | null
          college_id: string | null
          created_at: string
          created_by: string | null
          department: string
          designation: string
          email: string
          experience: string | null
          id: string
          name: string
          phone: string
          qualification: string | null
          status: string
          subjects: string[] | null
          updated_at: string
          updated_by: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          college_id?: string | null
          created_at?: string
          created_by?: string | null
          department: string
          designation: string
          email: string
          experience?: string | null
          id?: string
          name: string
          phone: string
          qualification?: string | null
          status?: string
          subjects?: string[] | null
          updated_at?: string
          updated_by?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          college_id?: string | null
          created_at?: string
          created_by?: string | null
          department?: string
          designation?: string
          email?: string
          experience?: string | null
          id?: string
          name?: string
          phone?: string
          qualification?: string | null
          status?: string
          subjects?: string[] | null
          updated_at?: string
          updated_by?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      fee_installments: {
        Row: {
          amount: number
          college_id: string | null
          created_at: string
          due_date: string
          id: string
          installment_number: number
          paid_amount: number | null
          paid_date: string | null
          status: string
          student_fee_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          college_id?: string | null
          created_at?: string
          due_date: string
          id?: string
          installment_number: number
          paid_amount?: number | null
          paid_date?: string | null
          status?: string
          student_fee_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          college_id?: string | null
          created_at?: string
          due_date?: string
          id?: string
          installment_number?: number
          paid_amount?: number | null
          paid_date?: string | null
          status?: string
          student_fee_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_fee_installments_student_fee_id"
            columns: ["student_fee_id"]
            isOneToOne: false
            referencedRelation: "student_fee_ledger"
            referencedColumns: ["fee_record_id"]
          },
          {
            foreignKeyName: "fk_fee_installments_student_fee_id"
            columns: ["student_fee_id"]
            isOneToOne: false
            referencedRelation: "student_fee_summary"
            referencedColumns: ["fee_record_id"]
          },
          {
            foreignKeyName: "fk_fee_installments_student_fee_id"
            columns: ["student_fee_id"]
            isOneToOne: false
            referencedRelation: "student_fees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_fee_installments_student_fee_id"
            columns: ["student_fee_id"]
            isOneToOne: false
            referencedRelation: "student_payment_ledger"
            referencedColumns: ["fee_record_id"]
          },
        ]
      }
      fee_payments: {
        Row: {
          amount: number
          bank_name: string | null
          cheque_number: string | null
          college_id: string | null
          created_at: string
          created_by: string | null
          id: string
          payment_date: string
          payment_method: string
          receipt_number: string | null
          remarks: string | null
          student_fee_id: string
          student_id: number
          transaction_id: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          amount: number
          bank_name?: string | null
          cheque_number?: string | null
          college_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          payment_date?: string
          payment_method?: string
          receipt_number?: string | null
          remarks?: string | null
          student_fee_id: string
          student_id: number
          transaction_id?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          amount?: number
          bank_name?: string | null
          cheque_number?: string | null
          college_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          payment_date?: string
          payment_method?: string
          receipt_number?: string | null
          remarks?: string | null
          student_fee_id?: string
          student_id?: number
          transaction_id?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fee_payments_student_fee_id_fkey"
            columns: ["student_fee_id"]
            isOneToOne: false
            referencedRelation: "student_fee_ledger"
            referencedColumns: ["fee_record_id"]
          },
          {
            foreignKeyName: "fee_payments_student_fee_id_fkey"
            columns: ["student_fee_id"]
            isOneToOne: false
            referencedRelation: "student_fee_summary"
            referencedColumns: ["fee_record_id"]
          },
          {
            foreignKeyName: "fee_payments_student_fee_id_fkey"
            columns: ["student_fee_id"]
            isOneToOne: false
            referencedRelation: "student_fees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_payments_student_fee_id_fkey"
            columns: ["student_fee_id"]
            isOneToOne: false
            referencedRelation: "student_payment_ledger"
            referencedColumns: ["fee_record_id"]
          },
          {
            foreignKeyName: "fee_payments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_payment_ledger"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "fee_payments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_fee_payments_student_fee_id"
            columns: ["student_fee_id"]
            isOneToOne: false
            referencedRelation: "student_fee_ledger"
            referencedColumns: ["fee_record_id"]
          },
          {
            foreignKeyName: "fk_fee_payments_student_fee_id"
            columns: ["student_fee_id"]
            isOneToOne: false
            referencedRelation: "student_fee_summary"
            referencedColumns: ["fee_record_id"]
          },
          {
            foreignKeyName: "fk_fee_payments_student_fee_id"
            columns: ["student_fee_id"]
            isOneToOne: false
            referencedRelation: "student_fees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_fee_payments_student_fee_id"
            columns: ["student_fee_id"]
            isOneToOne: false
            referencedRelation: "student_payment_ledger"
            referencedColumns: ["fee_record_id"]
          },
          {
            foreignKeyName: "fk_fee_payments_student_id"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_payment_ledger"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "fk_fee_payments_student_id"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_structures: {
        Row: {
          academic_year_id: string | null
          college_id: string | null
          course_id: number
          created_at: string
          created_by: string | null
          due_date: string | null
          effective_from: string | null
          effective_to: string | null
          fee_status: Database["public"]["Enums"]["fee_structure_status"]
          id: string
          is_published: boolean
          lab_fee: number | null
          library_fee: number | null
          other_fees: number | null
          published_at: string | null
          published_by: string | null
          registration_fee: number | null
          semester: number
          total_fee: number
          tuition_fee: number | null
          updated_at: string
          updated_by: string | null
          version: number
        }
        Insert: {
          academic_year_id?: string | null
          college_id?: string | null
          course_id: number
          created_at?: string
          created_by?: string | null
          due_date?: string | null
          effective_from?: string | null
          effective_to?: string | null
          fee_status?: Database["public"]["Enums"]["fee_structure_status"]
          id?: string
          is_published?: boolean
          lab_fee?: number | null
          library_fee?: number | null
          other_fees?: number | null
          published_at?: string | null
          published_by?: string | null
          registration_fee?: number | null
          semester: number
          total_fee?: number
          tuition_fee?: number | null
          updated_at?: string
          updated_by?: string | null
          version?: number
        }
        Update: {
          academic_year_id?: string | null
          college_id?: string | null
          course_id?: number
          created_at?: string
          created_by?: string | null
          due_date?: string | null
          effective_from?: string | null
          effective_to?: string | null
          fee_status?: Database["public"]["Enums"]["fee_structure_status"]
          id?: string
          is_published?: boolean
          lab_fee?: number | null
          library_fee?: number | null
          other_fees?: number | null
          published_at?: string | null
          published_by?: string | null
          registration_fee?: number | null
          semester?: number
          total_fee?: number
          tuition_fee?: number | null
          updated_at?: string
          updated_by?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "fee_structures_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback_forms: {
        Row: {
          college_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string | null
          form_title: string
          id: string
          is_active: boolean
          questions: Json
          start_date: string | null
          target_audience: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          college_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          form_title: string
          id?: string
          is_active?: boolean
          questions?: Json
          start_date?: string | null
          target_audience?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          college_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          form_title?: string
          id?: string
          is_active?: boolean
          questions?: Json
          start_date?: string | null
          target_audience?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_forms_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback_submissions: {
        Row: {
          college_id: string | null
          form_id: string
          id: string
          responses: Json
          student_id: number | null
          submission_date: string
          submitted_by: string | null
        }
        Insert: {
          college_id?: string | null
          form_id: string
          id?: string
          responses?: Json
          student_id?: number | null
          submission_date?: string
          submitted_by?: string | null
        }
        Update: {
          college_id?: string | null
          form_id?: string
          id?: string
          responses?: Json
          student_id?: number | null
          submission_date?: string
          submitted_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_submissions_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_submissions_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "feedback_forms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_submissions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_payment_ledger"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "feedback_submissions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      follow_up_history: {
        Row: {
          action_taken: string | null
          college_id: string | null
          contact_email: string | null
          contact_name: string
          contact_phone: string
          contacted_via: string | null
          created_at: string | null
          created_by: string | null
          followup_type: string
          id: string
          new_date: string | null
          new_status: string | null
          previous_date: string | null
          previous_status: string | null
          reference_id: string
          remarks: string | null
          student_id: number | null
          updated_at: string | null
        }
        Insert: {
          action_taken?: string | null
          college_id?: string | null
          contact_email?: string | null
          contact_name: string
          contact_phone: string
          contacted_via?: string | null
          created_at?: string | null
          created_by?: string | null
          followup_type: string
          id?: string
          new_date?: string | null
          new_status?: string | null
          previous_date?: string | null
          previous_status?: string | null
          reference_id: string
          remarks?: string | null
          student_id?: number | null
          updated_at?: string | null
        }
        Update: {
          action_taken?: string | null
          college_id?: string | null
          contact_email?: string | null
          contact_name?: string
          contact_phone?: string
          contacted_via?: string | null
          created_at?: string | null
          created_by?: string | null
          followup_type?: string
          id?: string
          new_date?: string | null
          new_status?: string | null
          previous_date?: string | null
          previous_status?: string | null
          reference_id?: string
          remarks?: string | null
          student_id?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "follow_up_history_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      google_drive_settings: {
        Row: {
          access_token_encrypted: string | null
          college_id: string
          created_at: string
          created_by: string | null
          drive_connected: boolean | null
          drive_email: string
          drive_folder_id: string | null
          google_client_id_encrypted: string | null
          google_client_secret_encrypted: string | null
          id: string
          oauth_setup_completed: boolean | null
          quota_limit: number | null
          quota_used: number | null
          refresh_token_encrypted: string | null
          token_expires_at: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          access_token_encrypted?: string | null
          college_id: string
          created_at?: string
          created_by?: string | null
          drive_connected?: boolean | null
          drive_email: string
          drive_folder_id?: string | null
          google_client_id_encrypted?: string | null
          google_client_secret_encrypted?: string | null
          id?: string
          oauth_setup_completed?: boolean | null
          quota_limit?: number | null
          quota_used?: number | null
          refresh_token_encrypted?: string | null
          token_expires_at?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          access_token_encrypted?: string | null
          college_id?: string
          created_at?: string
          created_by?: string | null
          drive_connected?: boolean | null
          drive_email?: string
          drive_folder_id?: string | null
          google_client_id_encrypted?: string | null
          google_client_secret_encrypted?: string | null
          id?: string
          oauth_setup_completed?: boolean | null
          quota_limit?: number | null
          quota_used?: number | null
          refresh_token_encrypted?: string | null
          token_expires_at?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "google_drive_settings_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: true
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      grievance_attachments: {
        Row: {
          college_id: string | null
          created_at: string
          file_name: string
          file_type: string | null
          file_url: string
          grievance_id: string
          id: string
          uploaded_by: string | null
        }
        Insert: {
          college_id?: string | null
          created_at?: string
          file_name: string
          file_type?: string | null
          file_url: string
          grievance_id: string
          id?: string
          uploaded_by?: string | null
        }
        Update: {
          college_id?: string | null
          created_at?: string
          file_name?: string
          file_type?: string | null
          file_url?: string
          grievance_id?: string
          id?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "grievance_attachments_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grievance_attachments_grievance_id_fkey"
            columns: ["grievance_id"]
            isOneToOne: false
            referencedRelation: "grievances"
            referencedColumns: ["id"]
          },
        ]
      }
      grievance_categories: {
        Row: {
          college_id: string | null
          created_at: string
          created_by: string | null
          department: string | null
          description: string | null
          escalation_level: number
          id: string
          is_active: boolean
          name: string
          response_time_hours: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          college_id?: string | null
          created_at?: string
          created_by?: string | null
          department?: string | null
          description?: string | null
          escalation_level?: number
          id?: string
          is_active?: boolean
          name: string
          response_time_hours?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          college_id?: string | null
          created_at?: string
          created_by?: string | null
          department?: string | null
          description?: string | null
          escalation_level?: number
          id?: string
          is_active?: boolean
          name?: string
          response_time_hours?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "grievance_categories_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      grievance_responses: {
        Row: {
          college_id: string | null
          created_at: string
          grievance_id: string
          id: string
          is_public: boolean
          response_by: string | null
          response_text: string
          response_type: string
        }
        Insert: {
          college_id?: string | null
          created_at?: string
          grievance_id: string
          id?: string
          is_public?: boolean
          response_by?: string | null
          response_text: string
          response_type?: string
        }
        Update: {
          college_id?: string | null
          created_at?: string
          grievance_id?: string
          id?: string
          is_public?: boolean
          response_by?: string | null
          response_text?: string
          response_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "grievance_responses_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grievance_responses_grievance_id_fkey"
            columns: ["grievance_id"]
            isOneToOne: false
            referencedRelation: "grievances"
            referencedColumns: ["id"]
          },
        ]
      }
      grievances: {
        Row: {
          acknowledged_date: string | null
          assigned_to: string | null
          category_id: string | null
          college_id: string | null
          created_at: string
          description: string
          escalated_to: string | null
          faculty_id: string | null
          grievance_type: string
          id: string
          priority: string
          resolution_date: string | null
          resolution_notes: string | null
          satisfaction_rating: number | null
          status: string
          student_id: number | null
          submission_date: string
          submitted_by_id: string | null
          submitted_by_type: string
          title: string
          updated_at: string
        }
        Insert: {
          acknowledged_date?: string | null
          assigned_to?: string | null
          category_id?: string | null
          college_id?: string | null
          created_at?: string
          description: string
          escalated_to?: string | null
          faculty_id?: string | null
          grievance_type?: string
          id?: string
          priority?: string
          resolution_date?: string | null
          resolution_notes?: string | null
          satisfaction_rating?: number | null
          status?: string
          student_id?: number | null
          submission_date?: string
          submitted_by_id?: string | null
          submitted_by_type: string
          title: string
          updated_at?: string
        }
        Update: {
          acknowledged_date?: string | null
          assigned_to?: string | null
          category_id?: string | null
          college_id?: string | null
          created_at?: string
          description?: string
          escalated_to?: string | null
          faculty_id?: string | null
          grievance_type?: string
          id?: string
          priority?: string
          resolution_date?: string | null
          resolution_notes?: string | null
          satisfaction_rating?: number | null
          status?: string
          student_id?: number | null
          submission_date?: string
          submitted_by_id?: string | null
          submitted_by_type?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "grievances_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "grievance_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grievances_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grievances_faculty_id_fkey"
            columns: ["faculty_id"]
            isOneToOne: false
            referencedRelation: "faculty"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grievances_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_payment_ledger"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "grievances_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      hostel_allocations: {
        Row: {
          allocation_date: string
          college_id: string | null
          created_at: string
          created_by: string | null
          id: string
          room_fee: number
          room_id: string | null
          semester: number | null
          special_requirements: string | null
          status: string
          student_id: number | null
          updated_at: string
          updated_by: string | null
          vacate_date: string | null
        }
        Insert: {
          allocation_date?: string
          college_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          room_fee?: number
          room_id?: string | null
          semester?: number | null
          special_requirements?: string | null
          status?: string
          student_id?: number | null
          updated_at?: string
          updated_by?: string | null
          vacate_date?: string | null
        }
        Update: {
          allocation_date?: string
          college_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          room_fee?: number
          room_id?: string | null
          semester?: number | null
          special_requirements?: string | null
          status?: string
          student_id?: number | null
          updated_at?: string
          updated_by?: string | null
          vacate_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hostel_allocations_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hostel_allocations_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "hostel_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hostel_allocations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_payment_ledger"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "hostel_allocations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      hostel_complaints: {
        Row: {
          college_id: string | null
          complaint_type: string
          created_at: string
          created_by: string | null
          description: string
          id: string
          priority: string
          resolution_notes: string | null
          resolved_at: string | null
          room_id: string | null
          status: string
          student_id: number | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          college_id?: string | null
          complaint_type: string
          created_at?: string
          created_by?: string | null
          description: string
          id?: string
          priority?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          room_id?: string | null
          status?: string
          student_id?: number | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          college_id?: string | null
          complaint_type?: string
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          priority?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          room_id?: string | null
          status?: string
          student_id?: number | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hostel_complaints_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hostel_complaints_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "hostel_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hostel_complaints_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_payment_ledger"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "hostel_complaints_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      hostel_rooms: {
        Row: {
          building: string | null
          capacity: number
          college_id: string | null
          created_at: string
          created_by: string | null
          facilities: string[] | null
          floor: number | null
          id: string
          occupied_beds: number
          rent_amount: number
          room_number: string
          room_type: string
          status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          building?: string | null
          capacity?: number
          college_id?: string | null
          created_at?: string
          created_by?: string | null
          facilities?: string[] | null
          floor?: number | null
          id?: string
          occupied_beds?: number
          rent_amount?: number
          room_number: string
          room_type?: string
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          building?: string | null
          capacity?: number
          college_id?: string | null
          created_at?: string
          created_by?: string | null
          facilities?: string[] | null
          floor?: number | null
          id?: string
          occupied_beds?: number
          rent_amount?: number
          room_number?: string
          room_type?: string
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hostel_rooms_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      id_card_templates: {
        Row: {
          code: string
          config: Json
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          config?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          config?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      interviews: {
        Row: {
          college_id: string | null
          company_id: string
          created_at: string
          created_by: string | null
          feedback: string | null
          id: string
          interview_date: string
          interview_time: string | null
          interview_type: string
          interviewer_name: string | null
          job_posting_id: string
          location: string | null
          rating: number | null
          result: string | null
          status: string
          student_id: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          college_id?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          feedback?: string | null
          id?: string
          interview_date: string
          interview_time?: string | null
          interview_type?: string
          interviewer_name?: string | null
          job_posting_id: string
          location?: string | null
          rating?: number | null
          result?: string | null
          status?: string
          student_id: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          college_id?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          feedback?: string | null
          id?: string
          interview_date?: string
          interview_time?: string | null
          interview_type?: string
          interviewer_name?: string | null
          job_posting_id?: string
          location?: string | null
          rating?: number | null
          result?: string | null
          status?: string
          student_id?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interviews_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interviews_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interviews_job_posting_id_fkey"
            columns: ["job_posting_id"]
            isOneToOne: false
            referencedRelation: "job_postings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interviews_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_payment_ledger"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "interviews_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_items: {
        Row: {
          category: string
          college_id: string | null
          created_at: string
          created_by: string | null
          current_stock: number
          description: string | null
          id: string
          item_code: string
          last_restocked: string | null
          max_stock: number
          min_stock: number
          name: string
          price_per_unit: number
          status: string
          supplier_id: string | null
          unit: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          category: string
          college_id?: string | null
          created_at?: string
          created_by?: string | null
          current_stock?: number
          description?: string | null
          id?: string
          item_code: string
          last_restocked?: string | null
          max_stock?: number
          min_stock?: number
          name: string
          price_per_unit?: number
          status?: string
          supplier_id?: string | null
          unit?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          category?: string
          college_id?: string | null
          created_at?: string
          created_by?: string | null
          current_stock?: number
          description?: string | null
          id?: string
          item_code?: string
          last_restocked?: string | null
          max_stock?: number
          min_stock?: number
          name?: string
          price_per_unit?: number
          status?: string
          supplier_id?: string | null
          unit?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_transactions: {
        Row: {
          college_id: string | null
          created_at: string
          created_by: string | null
          department: string | null
          id: string
          issued_to: string | null
          item_id: string
          processed_by: string | null
          purpose: string | null
          quantity: number
          remarks: string | null
          transaction_code: string
          transaction_date: string
          transaction_type: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          college_id?: string | null
          created_at?: string
          created_by?: string | null
          department?: string | null
          id?: string
          issued_to?: string | null
          item_id: string
          processed_by?: string | null
          purpose?: string | null
          quantity: number
          remarks?: string | null
          transaction_code?: string
          transaction_date?: string
          transaction_type: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          college_id?: string | null
          created_at?: string
          created_by?: string | null
          department?: string | null
          id?: string
          issued_to?: string | null
          item_id?: string
          processed_by?: string | null
          purpose?: string | null
          quantity?: number
          remarks?: string | null
          transaction_code?: string
          transaction_date?: string
          transaction_type?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_transactions_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
        ]
      }
      job_postings: {
        Row: {
          application_deadline: string | null
          college_id: string | null
          company_id: string
          created_at: string
          created_by: string | null
          description: string | null
          eligibility_criteria: string | null
          employment_type: string
          filled_positions: number
          id: string
          job_type: string
          location: string | null
          required_skills: string[] | null
          salary_range: string | null
          status: string
          title: string
          total_positions: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          application_deadline?: string | null
          college_id?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          eligibility_criteria?: string | null
          employment_type?: string
          filled_positions?: number
          id?: string
          job_type?: string
          location?: string | null
          required_skills?: string[] | null
          salary_range?: string | null
          status?: string
          title: string
          total_positions?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          application_deadline?: string | null
          college_id?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          eligibility_criteria?: string | null
          employment_type?: string
          filled_positions?: number
          id?: string
          job_type?: string
          location?: string | null
          required_skills?: string[] | null
          salary_range?: string | null
          status?: string
          title?: string
          total_positions?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_postings_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_postings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      library_fines: {
        Row: {
          balance_amount: number
          college_id: string | null
          created_at: string
          days_overdue: number | null
          fine_amount: number
          fine_date: string
          fine_per_day: number | null
          id: string
          issue_id: string
          member_id: string
          paid_amount: number | null
          payment_date: string | null
          status: string
          updated_at: string
          waived_by: string | null
          waiver_reason: string | null
        }
        Insert: {
          balance_amount?: number
          college_id?: string | null
          created_at?: string
          days_overdue?: number | null
          fine_amount?: number
          fine_date?: string
          fine_per_day?: number | null
          id?: string
          issue_id: string
          member_id: string
          paid_amount?: number | null
          payment_date?: string | null
          status?: string
          updated_at?: string
          waived_by?: string | null
          waiver_reason?: string | null
        }
        Update: {
          balance_amount?: number
          college_id?: string | null
          created_at?: string
          days_overdue?: number | null
          fine_amount?: number
          fine_date?: string
          fine_per_day?: number | null
          id?: string
          issue_id?: string
          member_id?: string
          paid_amount?: number | null
          payment_date?: string | null
          status?: string
          updated_at?: string
          waived_by?: string | null
          waiver_reason?: string | null
        }
        Relationships: []
      }
      library_members: {
        Row: {
          college_id: string | null
          created_at: string
          created_by: string | null
          faculty_id: string | null
          id: string
          max_books: number
          member_type: string
          membership_end_date: string | null
          membership_number: string
          membership_start_date: string
          status: string
          student_id: number | null
          updated_at: string
          updated_by: string | null
          user_id: string | null
        }
        Insert: {
          college_id?: string | null
          created_at?: string
          created_by?: string | null
          faculty_id?: string | null
          id?: string
          max_books?: number
          member_type: string
          membership_end_date?: string | null
          membership_number: string
          membership_start_date?: string
          status?: string
          student_id?: number | null
          updated_at?: string
          updated_by?: string | null
          user_id?: string | null
        }
        Update: {
          college_id?: string | null
          created_at?: string
          created_by?: string | null
          faculty_id?: string | null
          id?: string
          max_books?: number
          member_type?: string
          membership_end_date?: string | null
          membership_number?: string
          membership_start_date?: string
          status?: string
          student_id?: number | null
          updated_at?: string
          updated_by?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_library_members_faculty"
            columns: ["faculty_id"]
            isOneToOne: false
            referencedRelation: "faculty"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_library_members_student"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_payment_ledger"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "fk_library_members_student"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      library_settings: {
        Row: {
          college_id: string | null
          created_at: string
          description: string | null
          id: string
          setting_key: string
          setting_value: string
          updated_at: string
        }
        Insert: {
          college_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          setting_key: string
          setting_value: string
          updated_at?: string
        }
        Update: {
          college_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: string
          updated_at?: string
        }
        Relationships: []
      }
      mcq_questions: {
        Row: {
          college_id: string | null
          correct_answer: string
          created_at: string
          created_by: string | null
          difficulty: string | null
          exam_id: string
          explanation: string | null
          id: string
          marks: number
          options: Json
          question_number: number
          question_text: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          college_id?: string | null
          correct_answer: string
          created_at?: string
          created_by?: string | null
          difficulty?: string | null
          exam_id: string
          explanation?: string | null
          id?: string
          marks?: number
          options?: Json
          question_number: number
          question_text: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          college_id?: string | null
          correct_answer?: string
          created_at?: string
          created_by?: string | null
          difficulty?: string | null
          exam_id?: string
          explanation?: string | null
          id?: string
          marks?: number
          options?: Json
          question_number?: number
          question_text?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mcq_questions_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          college_id: string | null
          count: number | null
          created_at: string
          expires_at: string | null
          id: string
          is_read: boolean | null
          message: string
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          college_id?: string | null
          count?: number | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          college_id?: string | null
          count?: number | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      otp_verifications: {
        Row: {
          attempts: number
          college_id: string | null
          created_at: string
          expires_at: string
          id: string
          max_attempts: number
          otp_code: string
          phone_number: string
          updated_at: string
          verified: boolean
        }
        Insert: {
          attempts?: number
          college_id?: string | null
          created_at?: string
          expires_at: string
          id?: string
          max_attempts?: number
          otp_code: string
          phone_number: string
          updated_at?: string
          verified?: boolean
        }
        Update: {
          attempts?: number
          college_id?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          max_attempts?: number
          otp_code?: string
          phone_number?: string
          updated_at?: string
          verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "otp_verifications_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      personal_google_drive: {
        Row: {
          access_token: string | null
          connected: boolean
          created_at: string
          drive_folder_id: string | null
          google_email: string
          id: string
          quota_limit: number
          quota_used: number
          refresh_token: string | null
          token_expires_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token?: string | null
          connected?: boolean
          created_at?: string
          drive_folder_id?: string | null
          google_email: string
          id?: string
          quota_limit?: number
          quota_used?: number
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string | null
          connected?: boolean
          created_at?: string
          drive_folder_id?: string | null
          google_email?: string
          id?: string
          quota_limit?: number
          quota_used?: number
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      placement_drives: {
        Row: {
          college_id: string | null
          company_id: string
          coordinator_id: string | null
          created_at: string
          created_by: string | null
          drive_date: string
          drive_name: string | null
          eligible_courses: string[] | null
          id: string
          job_positions: string[] | null
          min_cgpa: number | null
          registration_deadline: string | null
          status: string
          updated_at: string
          updated_by: string | null
          venue: string | null
        }
        Insert: {
          college_id?: string | null
          company_id: string
          coordinator_id?: string | null
          created_at?: string
          created_by?: string | null
          drive_date: string
          drive_name?: string | null
          eligible_courses?: string[] | null
          id?: string
          job_positions?: string[] | null
          min_cgpa?: number | null
          registration_deadline?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
          venue?: string | null
        }
        Update: {
          college_id?: string | null
          company_id?: string
          coordinator_id?: string | null
          created_at?: string
          created_by?: string | null
          drive_date?: string
          drive_name?: string | null
          eligible_courses?: string[] | null
          id?: string
          job_positions?: string[] | null
          min_cgpa?: number | null
          registration_deadline?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "placement_drives_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "placement_drives_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          department: string | null
          employee_id: string | null
          full_name: string | null
          id: string
          phone: string | null
          phone_verified: boolean | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          department?: string | null
          employee_id?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          phone_verified?: boolean | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          department?: string | null
          employee_id?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          phone_verified?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      promotion_job_events: {
        Row: {
          college_id: string
          created_at: string
          details: Json | null
          error_message: string | null
          event_type: string
          id: string
          new_semester: number
          new_year: number
          previous_semester: number
          previous_year: number
          promotion_job_id: string
          student_id: number
        }
        Insert: {
          college_id: string
          created_at?: string
          details?: Json | null
          error_message?: string | null
          event_type: string
          id?: string
          new_semester: number
          new_year: number
          previous_semester: number
          previous_year: number
          promotion_job_id: string
          student_id: number
        }
        Update: {
          college_id?: string
          created_at?: string
          details?: Json | null
          error_message?: string | null
          event_type?: string
          id?: string
          new_semester?: number
          new_year?: number
          previous_semester?: number
          previous_year?: number
          promotion_job_id?: string
          student_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "promotion_job_events_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotion_job_events_promotion_job_id_fkey"
            columns: ["promotion_job_id"]
            isOneToOne: false
            referencedRelation: "promotion_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotion_job_events_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_payment_ledger"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "promotion_job_events_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      promotion_jobs: {
        Row: {
          can_rollback: boolean
          college_id: string
          completed_at: string | null
          created_at: string
          failed_count: number
          filters: Json | null
          from_academic_year_id: string | null
          id: string
          job_name: string
          new_semester: number
          new_year: number
          processed_count: number
          rollback_window_hours: number
          skipped_count: number
          started_at: string | null
          started_by: string
          status: Database["public"]["Enums"]["promotion_status"]
          success_count: number
          target_semester: number | null
          target_year: number | null
          to_academic_year_id: string | null
          total_students: number
          updated_at: string
        }
        Insert: {
          can_rollback?: boolean
          college_id: string
          completed_at?: string | null
          created_at?: string
          failed_count?: number
          filters?: Json | null
          from_academic_year_id?: string | null
          id?: string
          job_name: string
          new_semester: number
          new_year: number
          processed_count?: number
          rollback_window_hours?: number
          skipped_count?: number
          started_at?: string | null
          started_by: string
          status?: Database["public"]["Enums"]["promotion_status"]
          success_count?: number
          target_semester?: number | null
          target_year?: number | null
          to_academic_year_id?: string | null
          total_students?: number
          updated_at?: string
        }
        Update: {
          can_rollback?: boolean
          college_id?: string
          completed_at?: string | null
          created_at?: string
          failed_count?: number
          filters?: Json | null
          from_academic_year_id?: string | null
          id?: string
          job_name?: string
          new_semester?: number
          new_year?: number
          processed_count?: number
          rollback_window_hours?: number
          skipped_count?: number
          started_at?: string | null
          started_by?: string
          status?: Database["public"]["Enums"]["promotion_status"]
          success_count?: number
          target_semester?: number | null
          target_year?: number | null
          to_academic_year_id?: string | null
          total_students?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "promotion_jobs_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotion_jobs_from_academic_year_id_fkey"
            columns: ["from_academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotion_jobs_to_academic_year_id_fkey"
            columns: ["to_academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          created_at: string | null
          device_info: string | null
          id: string
          subscription: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_info?: string | null
          id?: string
          subscription: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_info?: string | null
          id?: string
          subscription?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      reminders: {
        Row: {
          college_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          recipient_ids: string[] | null
          recipient_type: string
          reminder_date: string
          reminder_time: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          college_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          recipient_ids?: string[] | null
          recipient_type?: string
          reminder_date: string
          reminder_time?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          college_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          recipient_ids?: string[] | null
          recipient_type?: string
          reminder_date?: string
          reminder_time?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminders_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      report_history: {
        Row: {
          college_id: string | null
          export_format: string
          file_url: string | null
          filters: Json | null
          generated_at: string
          id: string
          name: string
          report_type: string
          size_bytes: number | null
          user_id: string
        }
        Insert: {
          college_id?: string | null
          export_format: string
          file_url?: string | null
          filters?: Json | null
          generated_at?: string
          id?: string
          name: string
          report_type: string
          size_bytes?: number | null
          user_id: string
        }
        Update: {
          college_id?: string | null
          export_format?: string
          file_url?: string | null
          filters?: Json | null
          generated_at?: string
          id?: string
          name?: string
          report_type?: string
          size_bytes?: number | null
          user_id?: string
        }
        Relationships: []
      }
      results: {
        Row: {
          college_id: string | null
          created_at: string
          created_by: string | null
          exam_id: string
          grade: string | null
          id: string
          marks_obtained: number
          percentage: number | null
          student_id: number
          subject_id: string
          total_marks: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          college_id?: string | null
          created_at?: string
          created_by?: string | null
          exam_id: string
          grade?: string | null
          id?: string
          marks_obtained?: number
          percentage?: number | null
          student_id: number
          subject_id: string
          total_marks?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          college_id?: string | null
          created_at?: string
          created_by?: string | null
          exam_id?: string
          grade?: string | null
          id?: string
          marks_obtained?: number
          percentage?: number | null
          student_id?: number
          subject_id?: string
          total_marks?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_results_exam_id"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_results_student_id"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_payment_ledger"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "fk_results_student_id"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_results_subject_id"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "results_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "results_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "results_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      sms_configurations: {
        Row: {
          api_key_encrypted: string | null
          api_key_name: string
          channel: number
          college_id: string | null
          created_at: string
          created_by: string | null
          dcs: number
          default_country_code: string | null
          dev_mode: boolean
          dlt_template_id: string | null
          entity_id: string | null
          flash_sms: number
          general_otp_template: string | null
          id: string
          is_active: boolean
          login_otp_template: string | null
          route: string
          sender_id: string
          signup_otp_template: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          api_key_encrypted?: string | null
          api_key_name?: string
          channel?: number
          college_id?: string | null
          created_at?: string
          created_by?: string | null
          dcs?: number
          default_country_code?: string | null
          dev_mode?: boolean
          dlt_template_id?: string | null
          entity_id?: string | null
          flash_sms?: number
          general_otp_template?: string | null
          id?: string
          is_active?: boolean
          login_otp_template?: string | null
          route?: string
          sender_id?: string
          signup_otp_template?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          api_key_encrypted?: string | null
          api_key_name?: string
          channel?: number
          college_id?: string | null
          created_at?: string
          created_by?: string | null
          dcs?: number
          default_country_code?: string | null
          dev_mode?: boolean
          dlt_template_id?: string | null
          entity_id?: string | null
          flash_sms?: number
          general_otp_template?: string | null
          id?: string
          is_active?: boolean
          login_otp_template?: string | null
          route?: string
          sender_id?: string
          signup_otp_template?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sms_configurations_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      student_academic_history: {
        Row: {
          college_id: string | null
          created_at: string
          id: string
          previous_course_id: number | null
          previous_semester: number
          previous_status: string | null
          previous_year: number
          promotion_job_id: string | null
          snapshot_data: Json
          snapshot_taken_at: string
          student_id: number
        }
        Insert: {
          college_id?: string | null
          created_at?: string
          id?: string
          previous_course_id?: number | null
          previous_semester: number
          previous_status?: string | null
          previous_year: number
          promotion_job_id?: string | null
          snapshot_data: Json
          snapshot_taken_at?: string
          student_id: number
        }
        Update: {
          college_id?: string | null
          created_at?: string
          id?: string
          previous_course_id?: number | null
          previous_semester?: number
          previous_status?: string | null
          previous_year?: number
          promotion_job_id?: string | null
          snapshot_data?: Json
          snapshot_taken_at?: string
          student_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_student_academic_history_promotion_job"
            columns: ["promotion_job_id"]
            isOneToOne: false
            referencedRelation: "promotion_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_academic_history_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_academic_history_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_payment_ledger"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "student_academic_history_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_answers: {
        Row: {
          answered_at: string | null
          college_id: string | null
          created_at: string
          created_by: string | null
          id: string
          is_correct: boolean | null
          marks_obtained: number | null
          question_id: string
          selected_answer: string | null
          session_id: string
          time_spent_seconds: number | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          answered_at?: string | null
          college_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_correct?: boolean | null
          marks_obtained?: number | null
          question_id: string
          selected_answer?: string | null
          session_id: string
          time_spent_seconds?: number | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          answered_at?: string | null
          college_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_correct?: boolean | null
          marks_obtained?: number | null
          question_id?: string
          selected_answer?: string | null
          session_id?: string
          time_spent_seconds?: number | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "mcq_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_answers_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "student_exam_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      student_applications: {
        Row: {
          application_date: string
          college_id: string | null
          cover_letter: string | null
          created_at: string
          final_result: string | null
          id: string
          interview_date: string | null
          interview_feedback: string | null
          job_posting_id: string
          resume_url: string | null
          skills: string | null
          status: string
          student_id: number
          updated_at: string
        }
        Insert: {
          application_date?: string
          college_id?: string | null
          cover_letter?: string | null
          created_at?: string
          final_result?: string | null
          id?: string
          interview_date?: string | null
          interview_feedback?: string | null
          job_posting_id: string
          resume_url?: string | null
          skills?: string | null
          status?: string
          student_id: number
          updated_at?: string
        }
        Update: {
          application_date?: string
          college_id?: string | null
          cover_letter?: string | null
          created_at?: string
          final_result?: string | null
          id?: string
          interview_date?: string | null
          interview_feedback?: string | null
          job_posting_id?: string
          resume_url?: string | null
          skills?: string | null
          status?: string
          student_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_applications_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_applications_job_posting_id_fkey"
            columns: ["job_posting_id"]
            isOneToOne: false
            referencedRelation: "job_postings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_applications_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_payment_ledger"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "student_applications_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_documents: {
        Row: {
          college_id: string | null
          created_at: string
          document_type: string
          file_name: string
          file_size: number | null
          file_url: string
          google_drive_file_id: string | null
          id: string
          storage_type: string | null
          student_id: number | null
          updated_at: string
          uploaded_at: string
        }
        Insert: {
          college_id?: string | null
          created_at?: string
          document_type: string
          file_name: string
          file_size?: number | null
          file_url: string
          google_drive_file_id?: string | null
          id?: string
          storage_type?: string | null
          student_id?: number | null
          updated_at?: string
          uploaded_at?: string
        }
        Update: {
          college_id?: string | null
          created_at?: string
          document_type?: string
          file_name?: string
          file_size?: number | null
          file_url?: string
          google_drive_file_id?: string | null
          id?: string
          storage_type?: string | null
          student_id?: number | null
          updated_at?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_documents_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_documents_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_payment_ledger"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "student_documents_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_exam_sessions: {
        Row: {
          answered_questions: number | null
          attempt_number: number
          college_id: string | null
          created_at: string
          created_by: string | null
          duration_minutes: number | null
          end_time: string | null
          exam_id: string
          grade: string | null
          id: string
          marks_obtained: number | null
          percentage: number | null
          start_time: string
          status: string
          student_id: number
          submit_time: string | null
          total_marks: number | null
          total_questions: number | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          answered_questions?: number | null
          attempt_number?: number
          college_id?: string | null
          created_at?: string
          created_by?: string | null
          duration_minutes?: number | null
          end_time?: string | null
          exam_id: string
          grade?: string | null
          id?: string
          marks_obtained?: number | null
          percentage?: number | null
          start_time?: string
          status?: string
          student_id: number
          submit_time?: string | null
          total_marks?: number | null
          total_questions?: number | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          answered_questions?: number | null
          attempt_number?: number
          college_id?: string | null
          created_at?: string
          created_by?: string | null
          duration_minutes?: number | null
          end_time?: string | null
          exam_id?: string
          grade?: string | null
          id?: string
          marks_obtained?: number | null
          percentage?: number | null
          start_time?: string
          status?: string
          student_id?: number
          submit_time?: string | null
          total_marks?: number | null
          total_questions?: number | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_exam_sessions_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_exam_sessions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_payment_ledger"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "student_exam_sessions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_fee_assignments: {
        Row: {
          academic_year_id: string | null
          assigned_at: string
          assigned_by: string | null
          college_id: string
          created_at: string
          fee_structure_id: string
          id: string
          promotion_job_id: string | null
          status: string
          student_id: number
          updated_at: string
        }
        Insert: {
          academic_year_id?: string | null
          assigned_at?: string
          assigned_by?: string | null
          college_id: string
          created_at?: string
          fee_structure_id: string
          id?: string
          promotion_job_id?: string | null
          status?: string
          student_id: number
          updated_at?: string
        }
        Update: {
          academic_year_id?: string | null
          assigned_at?: string
          assigned_by?: string | null
          college_id?: string
          created_at?: string
          fee_structure_id?: string
          id?: string
          promotion_job_id?: string | null
          status?: string
          student_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_fee_assignments_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_fee_assignments_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_fee_assignments_fee_structure_id_fkey"
            columns: ["fee_structure_id"]
            isOneToOne: false
            referencedRelation: "fee_structures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_fee_assignments_promotion_job_id_fkey"
            columns: ["promotion_job_id"]
            isOneToOne: false
            referencedRelation: "promotion_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_fee_assignments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_payment_ledger"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "student_fee_assignments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_fees: {
        Row: {
          balance_amount: number
          collection_stage: string | null
          college_id: string | null
          created_at: string
          created_by: string | null
          discount_amount: number | null
          discount_percentage: number | null
          discount_reason: string | null
          due_date: string | null
          fee_category: string
          fee_description: string | null
          fee_structure_id: string | null
          follow_up_count: number | null
          follow_up_notes: string | null
          follow_up_status: string | null
          id: string
          last_follow_up_date: string | null
          next_follow_up_date: string | null
          original_amount: number | null
          paid_amount: number
          priority_level: string | null
          promised_payment_date: string | null
          status: string
          student_id: number
          total_amount: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          balance_amount?: number
          collection_stage?: string | null
          college_id?: string | null
          created_at?: string
          created_by?: string | null
          discount_amount?: number | null
          discount_percentage?: number | null
          discount_reason?: string | null
          due_date?: string | null
          fee_category?: string
          fee_description?: string | null
          fee_structure_id?: string | null
          follow_up_count?: number | null
          follow_up_notes?: string | null
          follow_up_status?: string | null
          id?: string
          last_follow_up_date?: string | null
          next_follow_up_date?: string | null
          original_amount?: number | null
          paid_amount?: number
          priority_level?: string | null
          promised_payment_date?: string | null
          status?: string
          student_id: number
          total_amount?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          balance_amount?: number
          collection_stage?: string | null
          college_id?: string | null
          created_at?: string
          created_by?: string | null
          discount_amount?: number | null
          discount_percentage?: number | null
          discount_reason?: string | null
          due_date?: string | null
          fee_category?: string
          fee_description?: string | null
          fee_structure_id?: string | null
          follow_up_count?: number | null
          follow_up_notes?: string | null
          follow_up_status?: string | null
          id?: string
          last_follow_up_date?: string | null
          next_follow_up_date?: string | null
          original_amount?: number | null
          paid_amount?: number
          priority_level?: string | null
          promised_payment_date?: string | null
          status?: string
          student_id?: number
          total_amount?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_student_fees_student_id"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_payment_ledger"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "fk_student_fees_student_id"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_fees_fee_structure_id_fkey"
            columns: ["fee_structure_id"]
            isOneToOne: false
            referencedRelation: "fee_structures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_fees_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_payment_ledger"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "student_fees_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_placements: {
        Row: {
          college_id: string | null
          company_id: string
          created_at: string
          id: string
          job_posting_id: string | null
          joining_date: string | null
          package_amount: number | null
          placed_by: string | null
          placement_type: string
          position_title: string
          status: string
          student_id: number
          updated_at: string
        }
        Insert: {
          college_id?: string | null
          company_id: string
          created_at?: string
          id?: string
          job_posting_id?: string | null
          joining_date?: string | null
          package_amount?: number | null
          placed_by?: string | null
          placement_type?: string
          position_title: string
          status?: string
          student_id: number
          updated_at?: string
        }
        Update: {
          college_id?: string | null
          company_id?: string
          created_at?: string
          id?: string
          job_posting_id?: string | null
          joining_date?: string | null
          package_amount?: number | null
          placed_by?: string | null
          placement_type?: string
          position_title?: string
          status?: string
          student_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_placements_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_placements_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_placements_job_posting_id_fkey"
            columns: ["job_posting_id"]
            isOneToOne: false
            referencedRelation: "job_postings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_placements_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_payment_ledger"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "student_placements_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          academic_year_id: string | null
          admission_date: string
          class: string | null
          college_id: string | null
          course_id: number | null
          created_at: string
          created_by: string | null
          email: string
          id: number
          mobile_number: string
          name: string
          photo_url: string | null
          semester: number | null
          status: string
          student_id: string
          updated_at: string
          updated_by: string | null
          user_id: string | null
          year: number | null
        }
        Insert: {
          academic_year_id?: string | null
          admission_date?: string
          class?: string | null
          college_id?: string | null
          course_id?: number | null
          created_at?: string
          created_by?: string | null
          email: string
          id?: number
          mobile_number: string
          name: string
          photo_url?: string | null
          semester?: number | null
          status?: string
          student_id?: string
          updated_at?: string
          updated_by?: string | null
          user_id?: string | null
          year?: number | null
        }
        Update: {
          academic_year_id?: string | null
          admission_date?: string
          class?: string | null
          college_id?: string | null
          course_id?: number | null
          created_at?: string
          created_by?: string | null
          email?: string
          id?: number
          mobile_number?: string
          name?: string
          photo_url?: string | null
          semester?: number | null
          status?: string
          student_id?: string
          updated_at?: string
          updated_by?: string | null
          user_id?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_students_course_id"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          code: string
          college_id: string | null
          course_id: number
          created_at: string
          created_by: string | null
          credits: number | null
          description: string | null
          id: string
          name: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          code: string
          college_id?: string | null
          course_id: number
          created_at?: string
          created_by?: string | null
          credits?: number | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          code?: string
          college_id?: string | null
          course_id?: number
          created_at?: string
          created_by?: string | null
          credits?: number | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subjects_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_renewals: {
        Row: {
          amount_paid: number | null
          college_id: string
          created_at: string | null
          created_by: string | null
          id: string
          new_end_date: string | null
          new_plan_id: string | null
          notes: string | null
          payment_reference: string | null
          previous_end_date: string | null
          previous_plan_id: string | null
          renewal_type: string | null
          subscription_id: string | null
        }
        Insert: {
          amount_paid?: number | null
          college_id: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          new_end_date?: string | null
          new_plan_id?: string | null
          notes?: string | null
          payment_reference?: string | null
          previous_end_date?: string | null
          previous_plan_id?: string | null
          renewal_type?: string | null
          subscription_id?: string | null
        }
        Update: {
          amount_paid?: number | null
          college_id?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          new_end_date?: string | null
          new_plan_id?: string | null
          notes?: string | null
          payment_reference?: string | null
          previous_end_date?: string | null
          previous_plan_id?: string | null
          renewal_type?: string | null
          subscription_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscription_renewals_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_renewals_new_plan_id_fkey"
            columns: ["new_plan_id"]
            isOneToOne: false
            referencedRelation: "amc_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_renewals_previous_plan_id_fkey"
            columns: ["previous_plan_id"]
            isOneToOne: false
            referencedRelation: "amc_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_renewals_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "college_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          college_id: string | null
          contact_person: string | null
          created_at: string
          created_by: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          address?: string | null
          college_id?: string | null
          contact_person?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          address?: string | null
          college_id?: string | null
          contact_person?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      system_analytics: {
        Row: {
          college_id: string | null
          created_at: string
          id: string
          metric_data: Json | null
          metric_name: string
          metric_value: number
          period_end: string
          period_start: string
          updated_at: string
        }
        Insert: {
          college_id?: string | null
          created_at?: string
          id?: string
          metric_data?: Json | null
          metric_name: string
          metric_value?: number
          period_end: string
          period_start: string
          updated_at?: string
        }
        Update: {
          college_id?: string | null
          created_at?: string
          id?: string
          metric_data?: Json | null
          metric_name?: string
          metric_value?: number
          period_end?: string
          period_start?: string
          updated_at?: string
        }
        Relationships: []
      }
      system_configurations: {
        Row: {
          config_key: string
          config_value: number
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          config_key: string
          config_value?: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          config_key?: string
          config_value?: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      theme_presets: {
        Row: {
          accent_color: string
          code: string
          created_at: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          name: string
          primary_color: string
          secondary_color: string
          sidebar_background: string
          sidebar_text: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          accent_color: string
          code: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name: string
          primary_color: string
          secondary_color: string
          sidebar_background: string
          sidebar_text: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          accent_color?: string
          code?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name?: string
          primary_color?: string
          secondary_color?: string
          sidebar_background?: string
          sidebar_text?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      transport_routes: {
        Row: {
          base_fare: number
          college_id: string | null
          created_at: string
          created_by: string | null
          distance: number | null
          duration: number | null
          ending_point: string
          id: string
          route_code: string | null
          route_name: string
          starting_point: string
          status: string
          stops: Json | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          base_fare?: number
          college_id?: string | null
          created_at?: string
          created_by?: string | null
          distance?: number | null
          duration?: number | null
          ending_point: string
          id?: string
          route_code?: string | null
          route_name: string
          starting_point: string
          status?: string
          stops?: Json | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          base_fare?: number
          college_id?: string | null
          created_at?: string
          created_by?: string | null
          distance?: number | null
          duration?: number | null
          ending_point?: string
          id?: string
          route_code?: string | null
          route_name?: string
          starting_point?: string
          status?: string
          stops?: Json | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transport_routes_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      tutorial_videos: {
        Row: {
          college_id: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          page_identifier: string
          page_title: string
          updated_at: string | null
          video_id: string
          video_url: string
        }
        Insert: {
          college_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          page_identifier: string
          page_title: string
          updated_at?: string | null
          video_id: string
          video_url: string
        }
        Update: {
          college_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          page_identifier?: string
          page_title?: string
          updated_at?: string | null
          video_id?: string
          video_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "tutorial_videos_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          college_id: string | null
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          college_id?: string | null
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          college_id?: string | null
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      student_fee_ledger: {
        Row: {
          balance_amount: number | null
          college_id: string | null
          course_name: string | null
          discount_amount: number | null
          discount_percentage: number | null
          discount_reason: string | null
          due_date: string | null
          fee_category: string | null
          fee_created_at: string | null
          fee_description: string | null
          fee_record_id: string | null
          fee_status: string | null
          final_amount: number | null
          original_amount: number | null
          paid_amount: number | null
          payment_history: Json | null
          semester: number | null
          student_id: number | null
          student_name: string | null
          student_number: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_student_fees_student_id"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_payment_ledger"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "fk_student_fees_student_id"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_fees_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_payment_ledger"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "student_fees_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_fee_summary: {
        Row: {
          balance_amount: number | null
          college_id: string | null
          course_code: string | null
          course_name: string | null
          discount_amount: number | null
          discount_percentage: number | null
          discount_reason: string | null
          due_date: string | null
          email: string | null
          fee_category: string | null
          fee_created_at: string | null
          fee_description: string | null
          fee_record_id: string | null
          fee_status: string | null
          last_payment_amount: number | null
          last_payment_date: string | null
          last_payment_method: string | null
          mobile_number: string | null
          original_amount: number | null
          paid_amount: number | null
          payment_count: number | null
          payment_status: string | null
          semester: number | null
          student_id: number | null
          student_name: string | null
          student_number: string | null
          total_amount: number | null
          year: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_student_fees_student_id"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_payment_ledger"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "fk_student_fees_student_id"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_fees_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_payment_ledger"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "student_fees_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_payment_ledger: {
        Row: {
          bank_name: string | null
          cheque_number: string | null
          course_name: string | null
          cumulative_paid: number | null
          discount_amount: number | null
          discount_percentage: number | null
          discount_reason: string | null
          due_date: string | null
          fee_category: string | null
          fee_created_at: string | null
          fee_description: string | null
          fee_record_id: string | null
          fee_status: string | null
          original_amount: number | null
          payment_amount: number | null
          payment_date: string | null
          payment_id: string | null
          payment_method: string | null
          payment_sequence: number | null
          receipt_number: string | null
          remarks: string | null
          running_balance: number | null
          student_id: number | null
          student_name: string | null
          student_number: string | null
          total_amount: number | null
          transaction_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      analyze_college_data: { Args: { college_uuid: string }; Returns: Json }
      auto_create_student_fees_with_discount: {
        Args: {
          p_discount_amount?: number
          p_discount_percentage?: number
          p_discount_reason?: string
          p_student_id: number
        }
        Returns: string
      }
      calculate_next_year_semester: {
        Args: {
          course_duration_months: number
          current_semester: number
          current_year: number
        }
        Returns: {
          is_graduating: boolean
          next_semester: number
          next_year: number
        }[]
      }
      can_rollback_promotion: { Args: { job_id: string }; Returns: boolean }
      clean_college_data: {
        Args: {
          college_uuid: string
          modules?: string[]
          preserve_structure?: boolean
        }
        Returns: Json
      }
      cleanup_expired_otps: { Args: never; Returns: undefined }
      exec_sql: { Args: { params?: string[]; query: string }; Returns: Json[] }
      export_college_data: { Args: { college_uuid: string }; Returns: Json }
      finalize_demo_setup: { Args: { demo: Json }; Returns: undefined }
      generate_role_based_notifications: { Args: never; Returns: undefined }
      get_current_user_email: { Args: never; Returns: string }
      get_current_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_dashboard_stats: { Args: never; Returns: Json }
      get_faculty_login_status: {
        Args: { faculty_id: string }
        Returns: boolean
      }
      get_role_counts_for_college: {
        Args: { college_uuid: string }
        Returns: {
          count: number
          role: Database["public"]["Enums"]["app_role"]
        }[]
      }
      get_role_counts_global: {
        Args: never
        Returns: {
          count: number
          role: Database["public"]["Enums"]["app_role"]
        }[]
      }
      get_student_data: {
        Args: never
        Returns: {
          admission_date: string
          course_name: string
          email: string
          id: number
          mobile_number: string
          name: string
          semester: number
          status: string
          student_id: string
          year: number
        }[]
      }
      get_student_login_status: {
        Args: { _student_id: number }
        Returns: boolean
      }
      get_user_college: { Args: never; Returns: string }
      get_user_email_by_id: { Args: { user_uuid: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      link_user_to_student: { Args: { p_student_email: string }; Returns: Json }
      update_exam_statuses: { Args: never; Returns: undefined }
    }
    Enums: {
      app_role:
        | "admin"
        | "teacher"
        | "clerk"
        | "librarian"
        | "accountant"
        | "assistant"
        | "super_admin"
        | "student"
        | "auditor"
      fee_structure_status: "draft" | "published" | "archived"
      promotion_status:
        | "preview"
        | "running"
        | "completed"
        | "failed"
        | "rolled_back"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "admin",
        "teacher",
        "clerk",
        "librarian",
        "accountant",
        "assistant",
        "super_admin",
        "student",
        "auditor",
      ],
      fee_structure_status: ["draft", "published", "archived"],
      promotion_status: [
        "preview",
        "running",
        "completed",
        "failed",
        "rolled_back",
      ],
    },
  },
} as const
