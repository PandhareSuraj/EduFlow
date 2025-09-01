import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Data flow integration for seamless module interaction
export class DataFlowManager {
  private static instance: DataFlowManager;
  private subscribers: Map<string, Function[]> = new Map();
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();

  static getInstance(): DataFlowManager {
    if (!DataFlowManager.instance) {
      DataFlowManager.instance = new DataFlowManager();
    }
    return DataFlowManager.instance;
  }

  // Subscribe to data changes across modules
  subscribe(event: string, callback: Function) {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, []);
    }
    this.subscribers.get(event)?.push(callback);
  }

  // Unsubscribe from events
  unsubscribe(event: string, callback: Function) {
    const callbacks = this.subscribers.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // Emit events to all subscribers
  emit(event: string, data: any) {
    const callbacks = this.subscribers.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  // Cache management for performance
  setCache(key: string, data: any, ttl: number = 300000) { // 5 minutes default TTL
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  getCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && (Date.now() - cached.timestamp) < cached.ttl) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  clearCache(pattern?: string) {
    if (pattern) {
      for (const [key] of this.cache) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  // Cross-module data synchronization
  async syncStudentData(studentId: number) {
    try {
      const { data: student, error } = await supabase
        .from('students')
        .select(`
          *,
          courses(id, name, code),
          student_fees(id, total_amount, paid_amount, balance_amount, status)
        `)
        .eq('id', studentId)
        .single();

      if (error) throw error;

      // Emit to all modules that might need this data
      this.emit('student:updated', student);
      this.emit('fees:student_updated', student);
      this.emit('attendance:student_updated', student);
      this.emit('results:student_updated', student);

      // Cache the student data
      this.setCache(`student:${studentId}`, student);

      return student;
    } catch (error) {
      console.error('Error syncing student data:', error);
      throw error;
    }
  }

  async syncCourseData(courseId: number) {
    try {
      const { data: course, error } = await supabase
        .from('courses')
        .select(`
          *,
          subjects(*),
          students(count),
          exams(*)
        `)
        .eq('id', courseId)
        .single();

      if (error) throw error;

      this.emit('course:updated', course);
      this.setCache(`course:${courseId}`, course);

      return course;
    } catch (error) {
      console.error('Error syncing course data:', error);
      throw error;
    }
  }

  // Batch operations for better performance
  async batchUpdateStudentFees(updates: Array<{ studentId: number; amount: number; type: string }>) {
    try {
      const results = [];
      
      for (const update of updates) {
        const result = await supabase
          .from('fee_payments')
          .insert({
            student_id: update.studentId,
            amount: update.amount,
            payment_method: update.type,
            payment_date: new Date().toISOString().split('T')[0]
          });
        
        results.push(result);
        
        // Emit individual updates
        this.emit('fees:payment_added', {
          studentId: update.studentId,
          amount: update.amount,
          type: update.type
        });
      }

      // Clear related cache
      this.clearCache('student_fees');
      
      return results;
    } catch (error) {
      console.error('Error in batch fee updates:', error);
      throw error;
    }
  }

  // Real-time synchronization setup
  setupRealTimeSync() {
    // Student updates
    supabase
      .channel('students_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'students' },
        (payload) => {
          this.emit('students:realtime', payload);
          this.clearCache('students');
        }
      )
      .subscribe();

    // Fee updates
    supabase
      .channel('fees_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'fee_payments' },
        (payload) => {
          this.emit('fees:realtime', payload);
          this.clearCache('fees');
        }
      )
      .subscribe();

    // Attendance updates
    supabase
      .channel('attendance_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'attendance_records' },
        (payload) => {
          this.emit('attendance:realtime', payload);
          this.clearCache('attendance');
        }
      )
      .subscribe();
  }

  // Analytics and reporting
  async generateCrossModuleReport(type: 'student' | 'course' | 'financial', id: number) {
    const cacheKey = `report:${type}:${id}`;
    const cached = this.getCache(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      let report: any = {};

      switch (type) {
        case 'student':
          const { data: studentReport } = await supabase.rpc('get_student_comprehensive_data', {
            student_id: id
          });
          report = studentReport;
          break;

        case 'course':
          // Course analytics across all modules
          const [students, attendance, fees, exams] = await Promise.all([
            supabase.from('students').select('*').eq('course_id', id),
            supabase.from('attendance_records').select('*').eq('course_id', id),
            supabase.from('student_fees').select('*').eq('course_id', id),
            supabase.from('exams').select('*').eq('course_id', id)
          ]);
          
          report = {
            students: students.data,
            attendance: attendance.data,
            fees: fees.data,
            exams: exams.data,
            analytics: {
              totalStudents: students.data?.length || 0,
              averageAttendance: this.calculateAverageAttendance(attendance.data),
              feeCollectionRate: this.calculateFeeCollectionRate(fees.data),
              examPerformance: this.calculateExamPerformance(exams.data)
            }
          };
          break;

        case 'financial':
          // Financial report across all modules
          const { data: financialData } = await supabase
            .from('fee_payments')
            .select(`
              *,
              student_fees(total_amount, balance_amount),
              students(name, course_id, courses(name))
            `);
          
          report = {
            payments: financialData,
            summary: this.calculateFinancialSummary(financialData)
          };
          break;
      }

      this.setCache(cacheKey, report, 600000); // Cache for 10 minutes
      return report;
      
    } catch (error) {
      console.error('Error generating cross-module report:', error);
      throw error;
    }
  }

  // Helper calculation methods
  private calculateAverageAttendance(attendanceData: any[]): number {
    if (!attendanceData || attendanceData.length === 0) return 0;
    
    const presentCount = attendanceData.filter(record => record.status === 'present').length;
    return Math.round((presentCount / attendanceData.length) * 100);
  }

  private calculateFeeCollectionRate(feeData: any[]): number {
    if (!feeData || feeData.length === 0) return 0;
    
    const totalAmount = feeData.reduce((sum, fee) => sum + (fee.total_amount || 0), 0);
    const paidAmount = feeData.reduce((sum, fee) => sum + (fee.paid_amount || 0), 0);
    
    return totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0;
  }

  private calculateExamPerformance(examData: any[]): any {
    if (!examData || examData.length === 0) return { passRate: 0, averageScore: 0 };
    
    // This would need to join with results table in real implementation
    return {
      passRate: 75, // Mock data
      averageScore: 68 // Mock data
    };
  }

  private calculateFinancialSummary(financialData: any[]): any {
    const totalCollected = financialData?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;
    const totalOutstanding = financialData?.reduce((sum, payment) => 
      sum + ((payment.student_fees?.balance_amount || 0)), 0) || 0;
    
    return {
      totalCollected,
      totalOutstanding,
      collectionRate: totalCollected + totalOutstanding > 0 
        ? Math.round((totalCollected / (totalCollected + totalOutstanding)) * 100)
        : 0
    };
  }
}

// Hook for using DataFlowManager in components
export function useDataFlow() {
  const [manager] = useState(() => DataFlowManager.getInstance());
  const { toast } = useToast();

  useEffect(() => {
    // Setup real-time sync when component mounts
    manager.setupRealTimeSync();
  }, [manager]);

  const syncData = async (type: string, id: number) => {
    try {
      switch (type) {
        case 'student':
          return await manager.syncStudentData(id);
        case 'course':
          return await manager.syncCourseData(id);
        default:
          throw new Error(`Unknown sync type: ${type}`);
      }
    } catch (error) {
      toast({
        title: "Sync Error",
        description: "Failed to synchronize data across modules",
        variant: "destructive"
      });
      throw error;
    }
  };

  return {
    manager,
    syncData,
    subscribe: manager.subscribe.bind(manager),
    unsubscribe: manager.unsubscribe.bind(manager),
    emit: manager.emit.bind(manager),
    generateReport: manager.generateCrossModuleReport.bind(manager)
  };
}