import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useFollowUpActions } from '@/hooks/useFollowUpActions';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CreateFollowUpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const CreateFollowUpDialog = ({
  open,
  onOpenChange,
  onSuccess,
}: CreateFollowUpDialogProps) => {
  const { createCustomFollowUp, updating } = useFollowUpActions();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    priority: 'normal',
    followUpDate: new Date(),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const success = await createCustomFollowUp(formData);

    if (success) {
      onSuccess();
      onOpenChange(false);
      setFormData({
        title: '',
        description: '',
        contactName: '',
        contactPhone: '',
        contactEmail: '',
        priority: 'normal',
        followUpDate: new Date(),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Follow-up</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Follow up on admission inquiry"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Additional details about this follow-up..."
              rows={3}
            />
          </div>

          {/* Contact Name */}
          <div className="space-y-2">
            <Label htmlFor="contactName">Contact Name *</Label>
            <Input
              id="contactName"
              value={formData.contactName}
              onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
              placeholder="Full name"
              required
            />
          </div>

          {/* Contact Phone */}
          <div className="space-y-2">
            <Label htmlFor="contactPhone">Contact Phone *</Label>
            <Input
              id="contactPhone"
              type="tel"
              value={formData.contactPhone}
              onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
              placeholder="+91 98765 43210"
              required
            />
          </div>

          {/* Contact Email */}
          <div className="space-y-2">
            <Label htmlFor="contactEmail">Contact Email</Label>
            <Input
              id="contactEmail"
              type="email"
              value={formData.contactEmail}
              onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              placeholder="email@example.com"
            />
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select
              value={formData.priority}
              onValueChange={(value) => setFormData({ ...formData, priority: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Follow-up Date */}
          <div className="space-y-2">
            <Label>Follow-up Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !formData.followUpDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.followUpDate ? format(formData.followUpDate, 'PPP') : 'Select date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.followUpDate}
                  onSelect={(date) => date && setFormData({ ...formData, followUpDate: date })}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updating}>
              {updating ? 'Creating...' : 'Create Follow-up'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
