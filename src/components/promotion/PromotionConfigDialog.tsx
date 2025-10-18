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
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { usePromotion } from '@/hooks/usePromotion';
import { useAcademicYears } from '@/hooks/useAcademicYears';
import { useCourses } from '@/hooks/useCourses';
import { HelpCircle } from 'lucide-react';

const formSchema = z.object({
  academic_year_id: z.string().min(1, 'Academic year is required'),
  course_ids: z.array(z.number()).optional(),
  year: z.coerce.number().optional(),
  semester: z.coerce.number().optional(),
  min_attendance_percentage: z.coerce.number().min(0).max(100).optional(),
  min_marks_percentage: z.coerce.number().min(0).max(100).optional(),
  check_fee_payment: z.boolean().default(false),
  dry_run: z.boolean().default(true),
});

interface PromotionConfigDialogProps {
  open: boolean;
  onClose: () => void;
}

export const PromotionConfigDialog = ({
  open,
  onClose,
}: PromotionConfigDialogProps) => {
  const { initiatePromotion, isInitiating } = usePromotion();
  const { academicYears } = useAcademicYears();
  const { courses } = useCourses();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      academic_year_id: '',
      dry_run: true,
      check_fee_payment: false,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const criteria: any = {};
    if (values.min_attendance_percentage) {
      criteria.min_attendance_percentage = values.min_attendance_percentage;
    }
    if (values.min_marks_percentage) {
      criteria.min_marks_percentage = values.min_marks_percentage;
    }
    if (values.check_fee_payment) {
      criteria.check_fee_payment = true;
    }

    try {
      await initiatePromotion({
        academic_year_id: values.academic_year_id,
        course_ids: values.course_ids,
        year: values.year,
        semester: values.semester,
        criteria: Object.keys(criteria).length > 0 ? criteria : undefined,
        dry_run: values.dry_run,
      });
      onClose();
      form.reset();
    } catch (error) {
      console.error('Failed to initiate promotion:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Configure Student Promotion</DialogTitle>
          <DialogDescription>
            Set criteria and filters for promoting students to the next year/semester
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="academic_year_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    Academic Year *
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-sm max-w-xs">
                            Select the academic year for which students will be promoted.
                            This helps track promotion history.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select academic year" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {academicYears?.map((year) => (
                        <SelectItem key={year.id} value={year.id}>
                          {year.year_code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Filter by Year (optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g., 1"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="semester"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Filter by Semester (optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g., 1"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                Eligibility Criteria
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm max-w-xs">
                        Set minimum requirements for students to be eligible for promotion.
                        Leave blank to skip that criteria.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="min_attendance_percentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Min. Attendance %</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 75"
                          min="0"
                          max="100"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Students below this % won't be promoted
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="min_marks_percentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Min. Marks %</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 40"
                          min="0"
                          max="100"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Based on latest exam results
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="check_fee_payment"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="!mt-0">
                      Check fee payment status
                    </FormLabel>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="dry_run"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="!mt-0">Dry run (preview only)</FormLabel>
                    <FormDescription>
                      Review promotion results before applying changes
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isInitiating}>
                {form.watch('dry_run') ? 'Preview Promotion' : 'Start Promotion'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
