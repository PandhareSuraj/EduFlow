import { Mail, Phone, MessageCircle, BookOpen, Video, Bug, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { APP_CONFIG } from "@/config/appConfig";

export function SupportSection() {
  const { supportEmail, supportPhone, documentationUrl } = APP_CONFIG;

  const supportOptions = [
    {
      icon: Mail,
      title: "Email Support",
      description: "Get help via email within 24 hours",
      action: () => window.open(`mailto:${supportEmail}`, '_blank'),
      actionLabel: "Send Email",
    },
    {
      icon: Phone,
      title: "Phone Support",
      description: supportPhone,
      action: () => window.open(`tel:${supportPhone.replace(/[^0-9+]/g, '')}`, '_blank'),
      actionLabel: "Call Now",
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Chat with our support team",
      action: () => {
        // Placeholder for live chat integration
        console.log("Open live chat");
      },
      actionLabel: "Start Chat",
      disabled: true,
      comingSoon: true,
    },
  ];

  const resources = [
    {
      icon: BookOpen,
      title: "Documentation",
      description: "Browse our comprehensive guides",
      action: () => window.open(documentationUrl, '_blank'),
    },
    {
      icon: Video,
      title: "Video Tutorials",
      description: "Watch step-by-step tutorials",
      action: () => window.open('/product-tour', '_blank'),
    },
    {
      icon: Bug,
      title: "Report a Bug",
      description: "Help us improve EduFlow",
      action: () => window.open(`mailto:${supportEmail}?subject=Bug Report: [Brief Description]`, '_blank'),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Contact Support */}
      <div>
        <h4 className="font-medium text-sm text-muted-foreground mb-3">
          Contact Support
        </h4>
        <div className="space-y-3">
          {supportOptions.map((option, idx) => (
            <Card key={idx} className="relative">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <option.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h5 className="font-medium text-sm">{option.title}</h5>
                      {option.comingSoon && (
                        <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                          Coming Soon
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {option.description}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={option.action}
                    disabled={option.disabled}
                    className="flex-shrink-0"
                  >
                    {option.actionLabel}
                    <ExternalLink className="ml-1.5 h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Resources */}
      <div>
        <h4 className="font-medium text-sm text-muted-foreground mb-3">
          Resources
        </h4>
        <div className="grid gap-3">
          {resources.map((resource, idx) => (
            <button
              key={idx}
              onClick={resource.action}
              className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent hover:text-accent-foreground transition-colors text-left"
            >
              <resource.icon className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{resource.title}</p>
                <p className="text-xs text-muted-foreground">
                  {resource.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Support Hours */}
      <div className="pt-4 border-t">
        <p className="text-xs text-muted-foreground text-center">
          Support hours: Monday - Friday, 9:00 AM - 6:00 PM IST
        </p>
      </div>
    </div>
  );
}
