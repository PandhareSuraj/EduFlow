import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, Send, User, Phone, Mail, MessageSquare } from 'lucide-react';
import { inquirySchema, submitInquiry, type InquiryFormSchema } from '@/utils/inquiryApi';

interface InquiryFormDialogProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export function InquiryFormDialog({
  children,
  title = 'Get in Touch',
  description = 'Fill out the form below and our team will get back to you within 24 hours.',
}: InquiryFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InquiryFormSchema>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      contact_person: '',
      phone: '',
      email: '',
      message: '',
    },
  });

  const onSubmit = async (data: InquiryFormSchema) => {
    setServerErrors({});

    const response = await submitInquiry({
      contact_person: data.contact_person,
      phone: data.phone,
      email: data.email,
      message: data.message,
    });

    if (response.success) {
      toast.success('Inquiry Received!', {
        description: 'Our team will contact you shortly.',
      });
      reset();
      setOpen(false);
    } else if (response.errors) {
      const errorsMap: Record<string, string> = {};
      response.errors.forEach((err) => {
        errorsMap[err.field] = err.message;
      });
      setServerErrors(errorsMap);

      if (errorsMap.general) {
        toast.error('Submission Failed', {
          description: errorsMap.general,
        });
      }
    }
  };

  const getError = (field: keyof InquiryFormSchema) => {
    return errors[field]?.message || serverErrors[field];
  };

  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.target.value = e.target.value.replace(/\D/g, '');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="contact_person" className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="contact_person"
              placeholder="Your full name"
              {...register('contact_person')}
              className={getError('contact_person') ? 'border-destructive' : ''}
            />
            {getError('contact_person') && (
              <p className="text-sm text-destructive">{getError('contact_person')}</p>
            )}
          </div>

          {/* Phone Field */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              Phone <span className="text-destructive">*</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="10-digit mobile number"
              {...register('phone')}
              onInput={handlePhoneInput}
              maxLength={15}
              className={getError('phone') ? 'border-destructive' : ''}
            />
            {getError('phone') && (
              <p className="text-sm text-destructive">{getError('phone')}</p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              {...register('email')}
              className={getError('email') ? 'border-destructive' : ''}
            />
            {getError('email') && (
              <p className="text-sm text-destructive">{getError('email')}</p>
            )}
          </div>

          {/* Message Field */}
          <div className="space-y-2">
            <Label htmlFor="message" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              Message
            </Label>
            <Textarea
              id="message"
              placeholder="Tell us about your requirements..."
              rows={3}
              maxLength={2000}
              {...register('message')}
              className={getError('message') ? 'border-destructive' : ''}
            />
            {getError('message') && (
              <p className="text-sm text-destructive">{getError('message')}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Submit Inquiry
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
