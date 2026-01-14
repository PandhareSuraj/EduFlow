import { Phone, MessageCircle, Calendar, AlertCircle, IndianRupee, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UnifiedFollowUp } from '@/types/followup';
import { format, formatDistanceToNow } from 'date-fns';

interface FollowUpCardProps {
  followUp: UnifiedFollowUp;
  onUpdate: (followUp: UnifiedFollowUp) => void;
  onCall: (phone: string) => void;
  onWhatsApp: (phone: string, name: string) => void;
  onDiscard?: (followUp: UnifiedFollowUp) => void;
}

export const FollowUpCard = ({ followUp, onUpdate, onCall, onWhatsApp, onDiscard }: FollowUpCardProps) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'default';
      case 'normal': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'enquiry': return 'Enquiry';
      case 'fee_payment': return 'Fee';
      case 'custom': return 'Follow-up';
      default: return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'default';
      case 'contacted': return 'secondary';
      case 'completed': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base truncate">{followUp.title}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {followUp.contactName}
          </p>
        </div>
        <div className="flex gap-1.5 ml-2">
          <Badge variant={getPriorityColor(followUp.priority)} className="text-xs">
            {followUp.priority}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {getTypeLabel(followUp.type)}
          </Badge>
        </div>
      </div>

      {/* Contact Info */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
        <Phone className="h-3.5 w-3.5" />
        <span className="font-mono">{followUp.contactPhone}</span>
      </div>

      {/* Fee Info (if applicable) */}
      {followUp.type === 'fee_payment' && followUp.dueAmount && (
        <div className="flex items-center gap-2 mb-3 p-2 bg-destructive/10 rounded-md">
          <IndianRupee className="h-4 w-4 text-destructive" />
          <div className="text-sm">
            <span className="font-semibold text-destructive">₹{followUp.dueAmount.toLocaleString()}</span>
            <span className="text-muted-foreground ml-2">due</span>
            {followUp.overdueDays && followUp.overdueDays > 0 && (
              <span className="ml-2 text-destructive">({followUp.overdueDays} days overdue)</span>
            )}
          </div>
        </div>
      )}

      {/* Follow-up Date */}
      <div className="flex items-center gap-2 text-sm mb-3">
        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="font-medium">{format(followUp.followUpDate, 'PPP')}</span>
        <span className="text-muted-foreground">
          ({formatDistanceToNow(followUp.followUpDate, { addSuffix: true })})
        </span>
      </div>

      {/* Last Contact Info */}
      {followUp.lastContactDate && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
          <AlertCircle className="h-3 w-3" />
          <span>
            Last contacted {format(followUp.lastContactDate, 'PP')} ({followUp.contactCount} times)
          </span>
        </div>
      )}

      {/* Remarks */}
      {followUp.remarks && (
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {followUp.remarks}
        </p>
      )}

      {/* Status */}
      <div className="mb-3">
        <Badge variant={getStatusColor(followUp.status)} className="text-xs">
          {followUp.status}
        </Badge>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          className="flex-1"
          onClick={() => onCall(followUp.contactPhone)}
        >
          <Phone className="h-4 w-4 mr-1.5" />
          Call
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex-1"
          onClick={() => onWhatsApp(followUp.contactPhone, followUp.contactName)}
        >
          <MessageCircle className="h-4 w-4 mr-1.5" />
          WhatsApp
        </Button>
        <Button
          size="sm"
          className="flex-1"
          onClick={() => onUpdate(followUp)}
        >
          Update
        </Button>
        {onDiscard && followUp.status !== 'cancelled' && followUp.status !== 'completed' && (
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => onDiscard(followUp)}
            title="Discard follow-up"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </Card>
  );
};
