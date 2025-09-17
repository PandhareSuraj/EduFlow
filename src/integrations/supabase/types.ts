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
          phone: string | null
          signature_title: string | null
          signature_url: string | null
          status: string
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
          phone?: string | null
          signature_title?: string | null
          signature_url?: string | null
          status?: string
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
          phone?: string | null
          signature_title?: string | null
          signature_url?: string | null
          status?: string
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
          course: string
          created_at: string
          created_by: string | null
          email: string | null
          follow_up_date: string | null
          id: string
          name: string
          notes: string | null
          phone: string
          source: string
          status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          assigned_to?: string | null
          college_id?: string | null
          course: string
          created_at?: string
          created_by?: string | null
          email?: string | null
          follow_up_date?: string | null
          id?: string
          name: string
          notes?: string | null
          phone: string
          source?: string
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          assigned_to?: string | null
          college_id?: string | null
          course?: string
          created_at?: string
          created_by?: string | null
          email?: string | null
          follow_up_date?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string
          source?: string
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
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
          college_id: string | null
          course_id: number
          created_at: string
          created_by: string | null
          due_date: string | null
          id: string
          lab_fee: number | null
          library_fee: number | null
          other_fees: number | null
          registration_fee: number | null
          semester: number
          total_fee: number
          tuition_fee: number | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          college_id?: string | null
          course_id: number
          created_at?: string
          created_by?: string | null
          due_date?: string | null
          id?: string
          lab_fee?: number | null
          library_fee?: number | null
          other_fees?: number | null
          registration_fee?: number | null
          semester: number
          total_fee?: number
          tuition_fee?: number | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          college_id?: string | null
          course_id?: number
          created_at?: string
          created_by?: string | null
          due_date?: string | null
          id?: string
          lab_fee?: number | null
          library_fee?: number | null
          other_fees?: number | null
          registration_fee?: number | null
          semester?: number
          total_fee?: number
          tuition_fee?: number | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
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
        Relationships: []
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
          api_key_name: string
          channel: number
          college_id: string | null
          created_at: string
          created_by: string | null
          dcs: number
          dlt_template_id: string | null
          entity_id: string | null
          flash_sms: number
          id: string
          is_active: boolean
          route: string
          sender_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          api_key_name?: string
          channel?: number
          college_id?: string | null
          created_at?: string
          created_by?: string | null
          dcs?: number
          dlt_template_id?: string | null
          entity_id?: string | null
          flash_sms?: number
          id?: string
          is_active?: boolean
          route?: string
          sender_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          api_key_name?: string
          channel?: number
          college_id?: string | null
          created_at?: string
          created_by?: string | null
          dcs?: number
          dlt_template_id?: string | null
          entity_id?: string | null
          flash_sms?: number
          id?: string
          is_active?: boolean
          route?: string
          sender_id?: string
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
      student_documents: {
        Row: {
          college_id: string | null
          created_at: string
          document_type: string
          file_name: string
          file_size: number | null
          file_url: string
          id: string
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
          id?: string
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
          id?: string
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
      student_fees: {
        Row: {
          balance_amount: number
          college_id: string | null
          created_at: string
          created_by: string | null
          discount_amount: number | null
          discount_percentage: number | null
          discount_reason: string | null
          due_date: string | null
          fee_structure_id: string
          id: string
          original_amount: number | null
          paid_amount: number
          status: string
          student_id: number
          total_amount: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          balance_amount?: number
          college_id?: string | null
          created_at?: string
          created_by?: string | null
          discount_amount?: number | null
          discount_percentage?: number | null
          discount_reason?: string | null
          due_date?: string | null
          fee_structure_id: string
          id?: string
          original_amount?: number | null
          paid_amount?: number
          status?: string
          student_id: number
          total_amount?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          balance_amount?: number
          college_id?: string | null
          created_at?: string
          created_by?: string | null
          discount_amount?: number | null
          discount_percentage?: number | null
          discount_reason?: string | null
          due_date?: string | null
          fee_structure_id?: string
          id?: string
          original_amount?: number | null
          paid_amount?: number
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
      students: {
        Row: {
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
          fee_created_at: string | null
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
          fee_created_at: string | null
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
          fee_created_at: string | null
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
      analyze_college_data: {
        Args: { college_uuid: string }
        Returns: Json
      }
      auto_create_student_fees_with_discount: {
        Args: {
          p_discount_amount?: number
          p_discount_percentage?: number
          p_discount_reason?: string
          p_student_id: number
        }
        Returns: string
      }
      clean_college_data: {
        Args: {
          college_uuid: string
          modules?: string[]
          preserve_structure?: boolean
        }
        Returns: Json
      }
      cleanup_expired_otps: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      export_college_data: {
        Args: { college_uuid: string }
        Returns: Json
      }
      finalize_demo_setup: {
        Args: { demo: Json }
        Returns: undefined
      }
      generate_role_based_notifications: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_current_user_email: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_faculty_login_status: {
        Args: { faculty_id: string }
        Returns: boolean
      }
      get_student_data: {
        Args: Record<PropertyKey, never>
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
      get_user_college: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_email_by_id: {
        Args: { user_uuid: string }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
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
      ],
    },
  },
} as const
