import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useAcademicYears } from '@/hooks/useAcademicYears';

const formSchema = z.object({
  year_code: z.string().min(1, 'Year code is required'),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  is_current: z.boolean().default(false),
});

interface AcademicYearDialogProps {
  open: boolean;
  onClose: () => void;
  editingYear?: any;
}

export const AcademicYearDialog = ({
  open,
  onClose,
  editingYear,
}: AcademicYearDialogProps) => {
  const { createAcademicYear, updateAcademicYear, isCreating, isUpdating } =
    useAcademicYears();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      year_code: '',
      start_date: '',
      end_date: '',
      is_current: false,
    },
  });

  useEffect(() => {
    if (editingYear) {
      form.reset({
        year_code: editingYear.year_code,
        start_date: editingYear.start_date,
        end_date: editingYear.end_date,
        is_current: editingYear.is_current,
      });
    } else {
      form.reset({
        year_code: '',
        start_date: '',
        end_date: '',
        is_current: false,
      });
    }
  }, [editingYear, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (editingYear) {
      updateAcademicYear({ id: editingYear.id, ...values });
    } else {
      createAcademicYear({
        year_code: values.year_code,
        start_date: values.start_date,
        end_date: values.end_date,
        is_current: values.is_current,
      });
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingYear ? 'Edit Academic Year' : 'Add Academic Year'}
          </DialogTitle>
          <DialogDescription>
            {editingYear
              ? 'Update academic year details'
              : 'Create a new academic year for student promotions'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="year_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Year Code</FormLabel>
                  <FormControl>
                    <Input placeholder="2024-2025" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="start_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="end_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_current"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="!mt-0">Set as current year</FormLabel>
                </FormItem>
              )}
            />

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating || isUpdating}>
                {editingYear ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
