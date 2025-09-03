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
      attendance_records: {
        Row: {
          college_id: string | null
          created_at: string
          id: string
          marked_at: string | null
          marked_by: string | null
          remarks: string | null
          session_id: string
          status: string
          student_id: number
          updated_at: string
        }
        Insert: {
          college_id?: string | null
          created_at?: string
          id?: string
          marked_at?: string | null
          marked_by?: string | null
          remarks?: string | null
          session_id: string
          status?: string
          student_id: number
          updated_at?: string
        }
        Update: {
          college_id?: string | null
          created_at?: string
          id?: string
          marked_at?: string | null
          marked_by?: string | null
          remarks?: string | null
          session_id?: string
          status?: string
          student_id?: number
          updated_at?: string
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
        }
        Insert: {
          absent_count?: number | null
          attendance_percentage?: number | null
          class_name: string
          college_id?: string | null
          course_id: number
          created_at?: string
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
        }
        Update: {
          absent_count?: number | null
          attendance_percentage?: number | null
          class_name?: string
          college_id?: string | null
          course_id?: number
          created_at?: string
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
        }
        Relationships: []
      }
      book_categories: {
        Row: {
          college_id: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          college_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          college_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      book_issues: {
        Row: {
          book_id: string
          college_id: string | null
          created_at: string
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
        }
        Insert: {
          book_id: string
          college_id?: string | null
          created_at?: string
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
        }
        Update: {
          book_id?: string
          college_id?: string | null
          created_at?: string
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
        }
        Insert: {
          author: string
          available_copies?: number
          category_id?: string | null
          college_id?: string | null
          created_at?: string
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
        }
        Update: {
          author?: string
          available_copies?: number
          category_id?: string | null
          college_id?: string | null
          created_at?: string
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
          logo_url: string | null
          name: string
          phone: string | null
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
          logo_url?: string | null
          name: string
          phone?: string | null
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
          logo_url?: string | null
          name?: string
          phone?: string | null
          status?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      courses: {
        Row: {
          code: string
          college_id: string | null
          created_at: string
          department: string | null
          description: string | null
          duration_months: number
          fees_per_semester: number | null
          id: number
          name: string
          status: string
          total_semesters: number | null
          updated_at: string
        }
        Insert: {
          code: string
          college_id?: string | null
          created_at?: string
          department?: string | null
          description?: string | null
          duration_months?: number
          fees_per_semester?: number | null
          id?: number
          name: string
          status?: string
          total_semesters?: number | null
          updated_at?: string
        }
        Update: {
          code?: string
          college_id?: string | null
          created_at?: string
          department?: string | null
          description?: string | null
          duration_months?: number
          fees_per_semester?: number | null
          id?: number
          name?: string
          status?: string
          total_semesters?: number | null
          updated_at?: string
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
      enquiries: {
        Row: {
          assigned_to: string | null
          college_id: string | null
          course: string
          created_at: string
          email: string | null
          follow_up_date: string | null
          id: string
          name: string
          notes: string | null
          phone: string
          source: string
          status: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          college_id?: string | null
          course: string
          created_at?: string
          email?: string | null
          follow_up_date?: string | null
          id?: string
          name: string
          notes?: string | null
          phone: string
          source?: string
          status?: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          college_id?: string | null
          course?: string
          created_at?: string
          email?: string | null
          follow_up_date?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string
          source?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      exams: {
        Row: {
          college_id: string | null
          course_id: number
          created_at: string
          description: string | null
          exam_date: string
          id: string
          name: string
          status: string
          total_marks: number
          updated_at: string
        }
        Insert: {
          college_id?: string | null
          course_id: number
          created_at?: string
          description?: string | null
          exam_date: string
          id?: string
          name: string
          status?: string
          total_marks?: number
          updated_at?: string
        }
        Update: {
          college_id?: string | null
          course_id?: number
          created_at?: string
          description?: string | null
          exam_date?: string
          id?: string
          name?: string
          status?: string
          total_marks?: number
          updated_at?: string
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
          user_id: string | null
        }
        Insert: {
          address?: string | null
          college_id?: string | null
          created_at?: string
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
          user_id?: string | null
        }
        Update: {
          address?: string | null
          college_id?: string | null
          created_at?: string
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
            referencedRelation: "student_fees"
            referencedColumns: ["id"]
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
          id: string
          payment_date: string
          payment_method: string
          receipt_number: string | null
          remarks: string | null
          student_fee_id: string
          student_id: number
          transaction_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          bank_name?: string | null
          cheque_number?: string | null
          college_id?: string | null
          created_at?: string
          id?: string
          payment_date?: string
          payment_method?: string
          receipt_number?: string | null
          remarks?: string | null
          student_fee_id: string
          student_id: number
          transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          bank_name?: string | null
          cheque_number?: string | null
          college_id?: string | null
          created_at?: string
          id?: string
          payment_date?: string
          payment_method?: string
          receipt_number?: string | null
          remarks?: string | null
          student_fee_id?: string
          student_id?: number
          transaction_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fee_payments_student_fee_id_fkey"
            columns: ["student_fee_id"]
            isOneToOne: false
            referencedRelation: "student_fees"
            referencedColumns: ["id"]
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
            referencedRelation: "student_fees"
            referencedColumns: ["id"]
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
        }
        Insert: {
          college_id?: string | null
          course_id: number
          created_at?: string
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
        }
        Update: {
          college_id?: string | null
          course_id?: number
          created_at?: string
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
        }
        Relationships: []
      }
      inventory_items: {
        Row: {
          category: string
          college_id: string | null
          created_at: string
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
        }
        Insert: {
          category: string
          college_id?: string | null
          created_at?: string
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
        }
        Update: {
          category?: string
          college_id?: string | null
          created_at?: string
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
        }
        Insert: {
          college_id?: string | null
          created_at?: string
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
        }
        Update: {
          college_id?: string | null
          created_at?: string
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
          user_id: string | null
        }
        Insert: {
          college_id?: string | null
          created_at?: string
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
          user_id?: string | null
        }
        Update: {
          college_id?: string | null
          created_at?: string
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
      profiles: {
        Row: {
          created_at: string
          department: string | null
          employee_id: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          department?: string | null
          employee_id?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          department?: string | null
          employee_id?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      results: {
        Row: {
          college_id: string | null
          created_at: string
          exam_id: string
          grade: string | null
          id: string
          marks_obtained: number
          percentage: number | null
          student_id: number
          subject_id: string
          total_marks: number
          updated_at: string
        }
        Insert: {
          college_id?: string | null
          created_at?: string
          exam_id: string
          grade?: string | null
          id?: string
          marks_obtained?: number
          percentage?: number | null
          student_id: number
          subject_id: string
          total_marks?: number
          updated_at?: string
        }
        Update: {
          college_id?: string | null
          created_at?: string
          exam_id?: string
          grade?: string | null
          id?: string
          marks_obtained?: number
          percentage?: number | null
          student_id?: number
          subject_id?: string
          total_marks?: number
          updated_at?: string
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
          due_date: string | null
          fee_structure_id: string
          id: string
          paid_amount: number
          status: string
          student_id: number
          total_amount: number
          updated_at: string
        }
        Insert: {
          balance_amount?: number
          college_id?: string | null
          created_at?: string
          due_date?: string | null
          fee_structure_id: string
          id?: string
          paid_amount?: number
          status?: string
          student_id: number
          total_amount?: number
          updated_at?: string
        }
        Update: {
          balance_amount?: number
          college_id?: string | null
          created_at?: string
          due_date?: string | null
          fee_structure_id?: string
          id?: string
          paid_amount?: number
          status?: string
          student_id?: number
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
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
          email: string
          id: number
          mobile_number: string
          name: string
          semester: number | null
          status: string
          student_id: string
          updated_at: string
          year: number | null
        }
        Insert: {
          admission_date?: string
          class?: string | null
          college_id?: string | null
          course_id?: number | null
          created_at?: string
          email: string
          id?: number
          mobile_number: string
          name: string
          semester?: number | null
          status?: string
          student_id?: string
          updated_at?: string
          year?: number | null
        }
        Update: {
          admission_date?: string
          class?: string | null
          college_id?: string | null
          course_id?: number | null
          created_at?: string
          email?: string
          id?: number
          mobile_number?: string
          name?: string
          semester?: number | null
          status?: string
          student_id?: string
          updated_at?: string
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
          credits: number | null
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          college_id?: string | null
          course_id: number
          created_at?: string
          credits?: number | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          college_id?: string | null
          course_id?: number
          created_at?: string
          credits?: number | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
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
          email: string | null
          id: string
          name: string
          phone: string | null
          status: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          college_id?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          college_id?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          status?: string
          updated_at?: string
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
      [_ in never]: never
    }
    Functions: {
      analyze_college_data: {
        Args: { college_uuid: string }
        Returns: Json
      }
      clean_college_data: {
        Args: {
          college_uuid: string
          modules?: string[]
          preserve_structure?: boolean
        }
        Returns: Json
      }
      export_college_data: {
        Args: { college_uuid: string }
        Returns: Json
      }
      finalize_demo_setup: {
        Args: { demo: Json }
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
      get_user_college: {
        Args: Record<PropertyKey, never>
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
