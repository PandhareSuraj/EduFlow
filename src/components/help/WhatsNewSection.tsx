import { format } from "date-fns";
import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { APP_CONFIG } from "@/config/appConfig";
import { cn } from "@/lib/utils";

export function WhatsNewSection() {
  const { whatsNew } = APP_CONFIG;

  return (
    <div className="space-y-6">
      {whatsNew.map((release, idx) => (
        <div
          key={idx}
          className={cn(
            "relative pl-6 pb-6",
            idx < whatsNew.length - 1 && "border-l border-border"
          )}
        >
          {/* Timeline dot */}
          <div className="absolute left-0 top-0 -translate-x-1/2 w-3 h-3 rounded-full bg-primary border-2 border-background" />

          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={idx === 0 ? "default" : "secondary"}>
                v{release.version}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {format(new Date(release.date), "MMM d, yyyy")}
              </span>
              {idx === 0 && (
                <Badge variant="outline" className="text-xs">
                  Latest
                </Badge>
              )}
            </div>

            <h4 className="font-medium text-sm">{release.title}</h4>

            <ul className="space-y-1">
              {release.changes.map((change, cIdx) => (
                <li
                  key={cIdx}
                  className="text-sm text-muted-foreground flex items-start gap-2"
                >
                  <Sparkles className="h-3 w-3 mt-1 text-primary flex-shrink-0" />
                  {change}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}
