-- Add follow-up management fields to student_fees table
ALTER TABLE public.student_fees 
ADD COLUMN next_follow_up_date date,
ADD COLUMN last_follow_up_date date,
ADD COLUMN follow_up_count integer DEFAULT 0,
ADD COLUMN follow_up_status text DEFAULT 'pending' CHECK (follow_up_status IN ('pending', 'contacted', 'promised', 'escalated', 'no_response')),
ADD COLUMN promised_payment_date date,
ADD COLUMN follow_up_notes text,
ADD COLUMN priority_level text DEFAULT 'normal' CHECK (priority_level IN ('low', 'normal', 'high', 'urgent')),
ADD COLUMN collection_stage text DEFAULT 'reminder' CHECK (collection_stage IN ('reminder', 'notice', 'final_notice', 'legal'));

-- Update existing records to set initial follow-up dates for overdue fees
UPDATE public.student_fees 
SET next_follow_up_date = CURRENT_DATE + INTERVAL '1 day',
    priority_level = CASE 
        WHEN due_date < CURRENT_DATE - INTERVAL '30 days' THEN 'urgent'
        WHEN due_date < CURRENT_DATE - INTERVAL '15 days' THEN 'high'
        WHEN due_date < CURRENT_DATE - INTERVAL '7 days' THEN 'normal'
        ELSE 'low'
    END,
    collection_stage = CASE 
        WHEN due_date < CURRENT_DATE - INTERVAL '60 days' THEN 'legal'
        WHEN due_date < CURRENT_DATE - INTERVAL '30 days' THEN 'final_notice'
        WHEN due_date < CURRENT_DATE - INTERVAL '15 days' THEN 'notice'
        ELSE 'reminder'
    END
WHERE status IN ('pending', 'partial') AND due_date < CURRENT_DATE;

-- Create function to automatically update follow-up dates
CREATE OR REPLACE FUNCTION public.update_follow_up_dates()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
    -- When a payment is made, update follow-up status and dates
    IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
        IF NEW.status = 'paid' THEN
            NEW.follow_up_status := 'completed';
            NEW.next_follow_up_date := NULL;
        ELSIF NEW.status = 'partial' AND OLD.status = 'pending' THEN
            NEW.follow_up_status := 'contacted';
            NEW.next_follow_up_date := CURRENT_DATE + INTERVAL '7 days';
        END IF;
    END IF;
    
    -- Auto-escalate overdue fees
    IF NEW.status IN ('pending', 'partial') AND NEW.due_date < CURRENT_DATE THEN
        NEW.priority_level := CASE 
            WHEN NEW.due_date < CURRENT_DATE - INTERVAL '60 days' THEN 'urgent'
            WHEN NEW.due_date < CURRENT_DATE - INTERVAL '30 days' THEN 'high'
            WHEN NEW.due_date < CURRENT_DATE - INTERVAL '15 days' THEN 'normal'
            ELSE 'low'
        END;
        
        NEW.collection_stage := CASE 
            WHEN NEW.due_date < CURRENT_DATE - INTERVAL '90 days' THEN 'legal'
            WHEN NEW.due_date < CURRENT_DATE - INTERVAL '60 days' THEN 'final_notice'
            WHEN NEW.due_date < CURRENT_DATE - INTERVAL '30 days' THEN 'notice'
            ELSE 'reminder'
        END;
    END IF;
    
    RETURN NEW;
END;
$function$;

-- Create trigger for follow-up management
CREATE TRIGGER update_student_fees_follow_up
    BEFORE UPDATE ON public.student_fees
    FOR EACH ROW
    EXECUTE FUNCTION public.update_follow_up_dates();