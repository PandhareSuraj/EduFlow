import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ContextualHelpTooltipProps {
  title: string;
  description: string;
  steps?: string[];
  learnMoreLink?: string;
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
}

export function ContextualHelpTooltip({
  title,
  description,
  steps,
  learnMoreLink,
  side = "right",
  className,
}: ContextualHelpTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={`inline-flex items-center justify-center rounded-full w-5 h-5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors ${className}`}
            aria-label={`Help: ${title}`}
          >
            <HelpCircle className="h-4 w-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-xs p-4" sideOffset={8}>
          <div className="space-y-2">
            <p className="font-medium text-sm">{title}</p>
            <p className="text-xs text-muted-foreground">{description}</p>

            {steps && steps.length > 0 && (
              <ol className="text-xs text-muted-foreground list-decimal list-inside space-y-1 mt-2">
                {steps.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ol>
            )}

            {learnMoreLink && (
              <a
                href={learnMoreLink}
                className="text-xs text-primary hover:underline block mt-2"
                target="_blank"
                rel="noopener noreferrer"
              >
                Learn more →
              </a>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
