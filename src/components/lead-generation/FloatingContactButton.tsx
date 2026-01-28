import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InquiryFormDialog } from './InquiryFormDialog';

export function FloatingContactButton() {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <InquiryFormDialog
        title="Quick Inquiry"
        description="Have a question? Fill out this form and we'll get back to you right away."
      >
        <Button
          size="lg"
          className="h-14 w-14 rounded-full bg-gradient-to-r from-primary to-secondary shadow-glow hover:shadow-elegant hover:scale-110 transition-all duration-300"
        >
          <MessageCircle className="h-6 w-6" />
          <span className="sr-only">Contact Us</span>
        </Button>
      </InquiryFormDialog>
    </div>
  );
}
