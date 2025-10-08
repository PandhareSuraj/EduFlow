import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { UnifiedFollowUp, ContactMethod } from '@/types/followup';
import { useFollowUpActions } from '@/hooks/useFollowUpActions';
import { format } from 'date-fns';
import { CalendarIcon, Phone, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UnifiedFollowUpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  followUp: UnifiedFollowUp | null;
  onSuccess: () => void;
}

export const UnifiedFollowUpDialog = ({
  open,
  onOpenChange,
  followUp,
  onSuccess,
}: UnifiedFollowUpDialogProps) => {
  const { updateFollowUp, updating } = useFollowUpActions();
  const [status, setStatus] = useState('');
  const [nextDate, setNextDate] = useState<Date | undefined>();
  const [remarks, setRemarks] = useState('');
  const [contactedVia, setContactedVia] = useState<ContactMethod>('phone');

  useEffect(() => {
    if (followUp) {
      setStatus(followUp.status);
      setNextDate(followUp.nextFollowUpDate);
      setRemarks('');
      setContactedVia('phone');
    }
  }, [followUp]);

  const handleSubmit = async () => {
    if (!followUp) return;

    const success = await updateFollowUp(followUp, {
      status,
      nextDate: nextDate || null,
      remarks,
      contactedVia,
    });

    if (success) {
      onSuccess();
      onOpenChange(false);
    }
  };

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleWhatsApp = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Hello ${name}, this is regarding your follow-up.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  if (!followUp) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update Follow-up</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Contact Info */}
          <div className="p-3 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">{followUp.contactName}</h4>
            <p className="text-sm text-muted-foreground mb-2">
              {followUp.contactPhone}
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCall(followUp.contactPhone)}
                className="flex-1"
              >
                <Phone className="h-4 w-4 mr-1.5" />
                Call Now
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleWhatsApp(followUp.contactPhone, followUp.contactName)}
                className="flex-1"
              >
                <MessageCircle className="h-4 w-4 mr-1.5" />
                WhatsApp
              </Button>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Contacted Via */}
          <div className="space-y-2">
            <Label>Contacted Via</Label>
            <Select value={contactedVia} onValueChange={(v) => setContactedVia(v as ContactMethod)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="phone">Phone</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="in_person">In Person</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Next Follow-up Date */}
          <div className="space-y-2">
            <Label>Next Follow-up Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !nextDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {nextDate ? format(nextDate, 'PPP') : 'Select date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={nextDate}
                  onSelect={setNextDate}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Remarks */}
          <div className="space-y-2">
            <Label>Remarks / Notes</Label>
            <Textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Add your remarks here..."
              rows={4}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={updating}>
            {updating ? 'Saving...' : 'Save Update'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
