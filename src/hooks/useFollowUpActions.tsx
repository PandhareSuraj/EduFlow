import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCollege } from '@/contexts/CollegeContext';
import { toast } from 'sonner';
import { UnifiedFollowUp, ContactMethod } from '@/types/followup';

export const useFollowUpActions = () => {
  const { college: currentCollege } = useCollege();
  const [updating, setUpdating] = useState(false);

  const updateFollowUp = async (
    followUp: UnifiedFollowUp,
    data: {
      status?: string;
      nextDate?: Date | null;
      remarks?: string;
      contactedVia?: ContactMethod;
    }
  ) => {
    if (!currentCollege) return false;

    try {
      setUpdating(true);

      const updates: any = {
        updated_at: new Date().toISOString(),
      };

      if (data.status) updates.status = data.status;
      if (data.nextDate !== undefined) {
        updates.next_follow_up_date = data.nextDate ? data.nextDate.toISOString().split('T')[0] : null;
      }
      if (data.remarks) updates.remarks = data.remarks;
      if (data.contactedVia) updates.contacted_via = data.contactedVia;

      // Update contact tracking
      updates.last_contact_date = new Date().toISOString().split('T')[0];
      updates.contact_count = (followUp.contactCount || 0) + 1;

      // Update the appropriate table
      let error: any = null;

      if (followUp.type === 'enquiry') {
        const { error: err } = await supabase
          .from('enquiries')
          .update({
            ...updates,
            notes: data.remarks,
          })
          .eq('id', followUp.id);
        error = err;
      } else if (followUp.type === 'fee_payment') {
        const { error: err } = await supabase
          .from('student_fees')
          .update({
            follow_up_status: data.status,
            next_follow_up_date: data.nextDate ? data.nextDate.toISOString().split('T')[0] : null,
            last_follow_up_date: new Date().toISOString().split('T')[0],
            follow_up_notes: data.remarks,
            follow_up_count: (followUp.contactCount || 0) + 1,
            updated_at: new Date().toISOString(),
          })
          .eq('id', followUp.id);
        error = err;
      } else if (followUp.type === 'custom') {
        const { error: err } = await supabase
          .from('custom_followups')
          .update(updates)
          .eq('id', followUp.id);
        error = err;
      }

      if (error) throw error;

      // Log to history
      await supabase.from('follow_up_history').insert([{
        followup_type: followUp.type,
        reference_id: followUp.id,
        student_id: followUp.studentId,
        contact_name: followUp.contactName,
        contact_phone: followUp.contactPhone,
        contact_email: followUp.contactEmail,
        previous_status: followUp.status,
        new_status: data.status || followUp.status,
        previous_date: followUp.nextFollowUpDate ? followUp.nextFollowUpDate.toISOString().split('T')[0] : null,
        new_date: data.nextDate ? data.nextDate.toISOString().split('T')[0] : null,
        remarks: data.remarks,
        contacted_via: data.contactedVia,
        college_id: currentCollege.id,
      }]);

      toast.success('Follow-up updated successfully');
      return true;
    } catch (error: any) {
      console.error('Error updating follow-up:', error);
      toast.error(error.message || 'Failed to update follow-up');
      return false;
    } finally {
      setUpdating(false);
    }
  };

  const createCustomFollowUp = async (data: {
    title: string;
    description?: string;
    contactName: string;
    contactPhone: string;
    contactEmail?: string;
    studentId?: number;
    priority: string;
    followUpDate: Date;
    tags?: string[];
  }) => {
    if (!currentCollege) return false;

    try {
      setUpdating(true);

      const { error } = await supabase.from('custom_followups').insert([{
        title: data.title,
        description: data.description,
        contact_name: data.contactName,
        contact_phone: data.contactPhone,
        contact_email: data.contactEmail,
        student_id: data.studentId,
        priority: data.priority,
        follow_up_date: data.followUpDate.toISOString().split('T')[0],
        tags: data.tags,
        college_id: currentCollege.id,
        status: 'pending',
      }]);

      if (error) throw error;

      toast.success('Follow-up created successfully');
      return true;
    } catch (error: any) {
      console.error('Error creating follow-up:', error);
      toast.error(error.message || 'Failed to create follow-up');
      return false;
    } finally {
      setUpdating(false);
    }
  };

  const deleteCustomFollowUp = async (id: string) => {
    try {
      setUpdating(true);

      const { error } = await supabase
        .from('custom_followups')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Follow-up deleted successfully');
      return true;
    } catch (error: any) {
      console.error('Error deleting follow-up:', error);
      toast.error(error.message || 'Failed to delete follow-up');
      return false;
    } finally {
      setUpdating(false);
    }
  };

  return {
    updating,
    updateFollowUp,
    createCustomFollowUp,
    deleteCustomFollowUp,
  };
};
