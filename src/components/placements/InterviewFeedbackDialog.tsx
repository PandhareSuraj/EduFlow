import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Star } from "lucide-react";

const feedbackSchema = z.object({
  technical_rating: z.string().min(1, "Technical rating is required"),
  communication_rating: z.string().min(1, "Communication rating is required"),
  feedback: z.string().min(10, "Feedback must be at least 10 characters"),
  recommendation: z.string().min(1, "Recommendation is required"),
});

interface InterviewFeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  interview: any;
  onSuccess: () => void;
}

export function InterviewFeedbackDialog({ open, onOpenChange, interview, onSuccess }: InterviewFeedbackDialogProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof feedbackSchema>>({
    resolver: zodResolver(feedbackSchema),
  });

  async function onSubmit(values: z.infer<typeof feedbackSchema>) {
    try {
      setLoading(true);

      // Update interview with feedback
      const { error: updateError } = await supabase
        .from("interviews")
        .update({
          technical_rating: parseInt(values.technical_rating),
          communication_rating: parseInt(values.communication_rating),
          feedback: values.feedback,
          recommendation: values.recommendation,
          status: "completed",
        })
        .eq("id", interview.id);

      if (updateError) throw updateError;

      // Update student application status based on recommendation
      if (values.recommendation === "selected") {
        const { error: appError } = await supabase
          .from("student_applications")
          .update({ status: "selected" })
          .eq("job_posting_id", interview.job_posting_id)
          .eq("student_id", interview.student_id);

        if (appError) throw appError;
      } else if (values.recommendation === "rejected") {
        const { error: appError } = await supabase
          .from("student_applications")
          .update({ status: "rejected" })
          .eq("job_posting_id", interview.job_posting_id)
          .eq("student_id", interview.student_id);

        if (appError) throw appError;
      }

      toast.success("Feedback recorded successfully");
      form.reset();
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Failed to record feedback");
    } finally {
      setLoading(false);
    }
  }

  const RatingField = ({ value, onChange, label }: { value: string; onChange: (value: string) => void; label: string }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => onChange(rating.toString())}
            className="focus:outline-none"
          >
            <Star
              className={`h-6 w-6 ${
                parseInt(value) >= rating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Interview Feedback</DialogTitle>
          <DialogDescription>
            Record feedback for {interview?.students?.name}'s interview
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="technical_rating"
              render={({ field }) => (
                <FormItem>
                  <RatingField
                    value={field.value || ""}
                    onChange={field.onChange}
                    label="Technical Skills"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="communication_rating"
              render={({ field }) => (
                <FormItem>
                  <RatingField
                    value={field.value || ""}
                    onChange={field.onChange}
                    label="Communication Skills"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="feedback"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Overall Feedback</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Provide detailed feedback about the candidate..." 
                      className="min-h-[120px] resize-none"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="recommendation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recommendation</FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} value={field.value}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="selected" id="selected" />
                        <Label htmlFor="selected" className="font-normal">
                          Select - Move forward with hiring
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="next_round" id="next_round" />
                        <Label htmlFor="next_round" className="font-normal">
                          Next Round - Schedule another interview
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="on_hold" id="on_hold" />
                        <Label htmlFor="on_hold" className="font-normal">
                          On Hold - Keep for future consideration
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="rejected" id="rejected" />
                        <Label htmlFor="rejected" className="font-normal">
                          Reject - Not suitable for this position
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Submit Feedback"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
