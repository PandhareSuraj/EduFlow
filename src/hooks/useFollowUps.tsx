import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCollege } from '@/contexts/CollegeContext';
import { UnifiedFollowUp, FollowUpGroup, FollowUpStats, FollowUpType } from '@/types/followup';
import { startOfToday, startOfTomorrow, endOfWeek, isBefore, isToday, isTomorrow, isThisWeek } from 'date-fns';

export const useFollowUps = (statusFilter?: string) => {
  const { college: currentCollege } = useCollege();
  const [followUps, setFollowUps] = useState<UnifiedFollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<FollowUpStats | null>(null);

  const fetchFollowUps = async () => {
    if (!currentCollege) return;

    try {
      setLoading(true);

      // Fetch enquiries
      const { data: enquiries } = await supabase
        .from('enquiries')
        .select('*')
        .eq('college_id', currentCollege.id)
        .not('next_follow_up_date', 'is', null)
        .order('next_follow_up_date', { ascending: true });

      // Fetch fee payments
      const { data: fees } = await supabase
        .from('student_fees')
        .select(`
          *,
          students(id, name, mobile_number, email, course_id, courses(name))
        `)
        .eq('college_id', currentCollege.id)
        .not('next_follow_up_date', 'is', null)
        .in('status', ['pending', 'partial'])
        .order('next_follow_up_date', { ascending: true });

      // Fetch custom follow-ups
      const { data: customs } = await supabase
        .from('custom_followups')
        .select('*, students(name, mobile_number, email)')
        .eq('college_id', currentCollege.id)
        .order('follow_up_date', { ascending: true });

      const unified: UnifiedFollowUp[] = [];

      // Transform enquiries
      enquiries?.forEach((enq) => {
        const enquiryStatus = enq.status === 'new' ? 'pending' : 
                             enq.status === 'contacted' ? 'contacted' : 
                             enq.status === 'converted' ? 'completed' : 'pending';

        unified.push({
          id: enq.id,
          type: 'enquiry' as FollowUpType,
          title: `Enquiry - ${enq.name}`,
          contactName: enq.name,
          contactPhone: enq.phone || '',
          contactEmail: enq.email || undefined,
          priority: (enq.priority || 'normal') as any,
          status: enquiryStatus as any,
          followUpDate: new Date(enq.next_follow_up_date || enq.follow_up_date),
          nextFollowUpDate: enq.next_follow_up_date ? new Date(enq.next_follow_up_date) : undefined,
          lastContactDate: enq.last_contact_date ? new Date(enq.last_contact_date) : undefined,
          contactCount: enq.contact_count || 0,
          remarks: enq.notes,
          courseName: enq.course,
          collegeId: enq.college_id,
          createdAt: new Date(enq.created_at),
          updatedAt: new Date(enq.updated_at),
        });
      });

      // Transform fees
      fees?.forEach((fee) => {
        const student = fee.students as any;
        const today = startOfToday();
        const dueDate = new Date(fee.due_date);
        const overdueDays = isBefore(dueDate, today) ? Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;

        unified.push({
          id: fee.id,
          type: 'fee_payment' as FollowUpType,
          title: `Fee Payment - ${student?.name || 'Student'}`,
          contactName: student?.name || 'Student',
          contactPhone: student?.mobile_number || '',
          contactEmail: student?.email || undefined,
          studentId: fee.student_id,
          studentName: student?.name,
          priority: (fee.priority_level || 'normal') as any,
          status: (fee.follow_up_status || 'pending') as any,
          followUpDate: new Date(fee.next_follow_up_date || fee.due_date),
          nextFollowUpDate: fee.next_follow_up_date ? new Date(fee.next_follow_up_date) : undefined,
          lastContactDate: fee.last_follow_up_date ? new Date(fee.last_follow_up_date) : undefined,
          contactCount: fee.follow_up_count || 0,
          remarks: fee.follow_up_notes,
          amount: Number(fee.total_amount),
          dueAmount: Number(fee.balance_amount),
          overdueDays,
          courseId: student?.course_id,
          courseName: student?.courses?.name,
          collegeId: fee.college_id,
          createdAt: new Date(fee.created_at),
          updatedAt: new Date(fee.updated_at),
        });
      });

      // Transform custom follow-ups
      customs?.forEach((custom) => {
        const student = custom.students as any;
        unified.push({
          id: custom.id,
          type: 'custom' as FollowUpType,
          title: custom.title,
          contactName: custom.contact_name,
          contactPhone: custom.contact_phone,
          contactEmail: custom.contact_email || undefined,
          studentId: custom.student_id || undefined,
          studentName: student?.name,
          priority: custom.priority as any,
          status: custom.status as any,
          followUpDate: new Date(custom.follow_up_date),
          nextFollowUpDate: custom.next_follow_up_date ? new Date(custom.next_follow_up_date) : undefined,
          lastContactDate: custom.last_contact_date ? new Date(custom.last_contact_date) : undefined,
          contactCount: custom.contact_count || 0,
          remarks: custom.remarks || custom.description,
          collegeId: custom.college_id,
          createdAt: new Date(custom.created_at),
          updatedAt: new Date(custom.updated_at),
        });
      });

      // Apply status filter
      let filtered = unified;
      if (statusFilter && statusFilter !== 'all') {
        filtered = unified.filter((f) => f.status === statusFilter);
      }

      setFollowUps(filtered);
      calculateStats(filtered);
    } catch (error) {
      console.error('Error fetching follow-ups:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: UnifiedFollowUp[]) => {
    const today = startOfToday();
    const tomorrow = startOfTomorrow();
    const endWeek = endOfWeek(today);

    const statsObj: FollowUpStats = {
      total: data.length,
      today: 0,
      tomorrow: 0,
      thisWeek: 0,
      overdue: 0,
      byStatus: { pending: 0, contacted: 0, completed: 0, cancelled: 0 },
      byPriority: { low: 0, normal: 0, high: 0, urgent: 0 },
      byType: { enquiry: 0, fee_payment: 0, custom: 0 },
    };

    data.forEach((item) => {
      const followUpDate = item.followUpDate;

      if (isBefore(followUpDate, today)) statsObj.overdue++;
      if (isToday(followUpDate)) statsObj.today++;
      if (isTomorrow(followUpDate)) statsObj.tomorrow++;
      if (isThisWeek(followUpDate)) statsObj.thisWeek++;

      statsObj.byStatus[item.status]++;
      statsObj.byPriority[item.priority]++;
      statsObj.byType[item.type]++;
    });

    setStats(statsObj);
  };

  const groupByTime = (data: UnifiedFollowUp[]): FollowUpGroup[] => {
    const today = startOfToday();
    const tomorrow = startOfTomorrow();

    const groups: FollowUpGroup[] = [
      { label: 'Overdue', count: 0, items: [] },
      { label: 'Today', count: 0, items: [] },
      { label: 'Tomorrow', count: 0, items: [] },
      { label: 'This Week', count: 0, items: [] },
      { label: 'Later', count: 0, items: [] },
    ];

    data.forEach((item) => {
      const date = item.followUpDate;

      if (isBefore(date, today)) {
        groups[0].items.push(item);
      } else if (isToday(date)) {
        groups[1].items.push(item);
      } else if (isTomorrow(date)) {
        groups[2].items.push(item);
      } else if (isThisWeek(date)) {
        groups[3].items.push(item);
      } else {
        groups[4].items.push(item);
      }
    });

    groups.forEach((g) => (g.count = g.items.length));
    return groups.filter((g) => g.count > 0);
  };

  useEffect(() => {
    fetchFollowUps();
  }, [currentCollege, statusFilter]);

  return {
    followUps,
    loading,
    stats,
    groups: groupByTime(followUps),
    refetch: fetchFollowUps,
  };
};
