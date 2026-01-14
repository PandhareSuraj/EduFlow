import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { UnifiedFollowUp } from '@/types/followup';
import { Badge } from '@/components/ui/badge';

interface DiscardFollowUpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  followUp: UnifiedFollowUp | null;
  onConfirm: () => void;
  loading?: boolean;
}

export const DiscardFollowUpDialog = ({
  open,
  onOpenChange,
  followUp,
  onConfirm,
  loading = false,
}: DiscardFollowUpDialogProps) => {
  if (!followUp) return null;

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'enquiry': return 'Enquiry';
      case 'fee_payment': return 'Fee Follow-up';
      case 'custom': return 'Custom Follow-up';
      default: return type;
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Discard Follow-up</AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>Are you sure you want to discard this follow-up? This action will mark it as cancelled.</p>
            <div className="p-3 bg-muted rounded-md space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">{followUp.title}</span>
                <Badge variant="outline" className="text-xs">
                  {getTypeLabel(followUp.type)}
                </Badge>
              </div>
              <p className="text-sm">{followUp.contactName} • {followUp.contactPhone}</p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm} 
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? 'Discarding...' : 'Discard'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
