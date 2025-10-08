export type FollowUpType = 'enquiry' | 'fee_payment' | 'custom';
export type FollowUpStatus = 'pending' | 'contacted' | 'completed' | 'cancelled';
export type FollowUpPriority = 'low' | 'normal' | 'high' | 'urgent';
export type ContactMethod = 'phone' | 'whatsapp' | 'email' | 'in_person' | 'other';

export interface UnifiedFollowUp {
  id: string;
  type: FollowUpType;
  title: string;
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
  studentId?: number;
  studentName?: string;
  priority: FollowUpPriority;
  status: FollowUpStatus;
  followUpDate: Date;
  nextFollowUpDate?: Date;
  lastContactDate?: Date;
  contactCount: number;
  remarks?: string;
  amount?: number;
  dueAmount?: number;
  overdueDays?: number;
  courseId?: number;
  courseName?: string;
  collegeId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FollowUpHistory {
  id: string;
  followupType: FollowUpType;
  referenceId: string;
  studentId?: number;
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
  previousStatus?: string;
  newStatus?: string;
  previousDate?: Date;
  newDate?: Date;
  remarks?: string;
  actionTaken?: string;
  contactedVia?: ContactMethod;
  collegeId: string;
  createdBy?: string;
  createdAt: Date;
}

export interface FollowUpGroup {
  label: string;
  count: number;
  items: UnifiedFollowUp[];
}

export interface FollowUpStats {
  total: number;
  today: number;
  tomorrow: number;
  thisWeek: number;
  overdue: number;
  byStatus: Record<FollowUpStatus, number>;
  byPriority: Record<FollowUpPriority, number>;
  byType: Record<FollowUpType, number>;
}
