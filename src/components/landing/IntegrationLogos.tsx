import { Card, CardContent } from "@/components/ui/card";

const integrations = [
  { name: "Tally", icon: "📊", desc: "Accounting" },
  { name: "Razorpay", icon: "💳", desc: "Payments" },
  { name: "Google Workspace", icon: "📧", desc: "Collaboration" },
  { name: "WhatsApp", icon: "💬", desc: "Communication" },
  { name: "SMS Gateway", icon: "📱", desc: "Notifications" },
  { name: "Zoom", icon: "🎥", desc: "Virtual Classes" },
  { name: "Microsoft 365", icon: "📁", desc: "Productivity" },
  { name: "Biometric", icon: "👆", desc: "Attendance" },
];

export function IntegrationLogos() {
  return (
    <section className="container mx-auto px-4 py-16 border-b">
      <div className="text-center mb-10 space-y-3">
        <p className="text-sm font-medium text-primary uppercase tracking-wider">
          Seamless Integrations
        </p>
        <h2 className="text-2xl md:text-3xl font-bold">
          Connects with Tools You Already Use
        </h2>
      </div>

      <div className="relative overflow-hidden">
        <div className="flex animate-[scroll_30s_linear_infinite] gap-6">
          {[...integrations, ...integrations].map((integration, i) => (
            <Card 
              key={i} 
              className="flex-shrink-0 w-40 bg-card/50 backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-colors group"
            >
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">
                  {integration.icon}
                </div>
                <p className="font-medium text-sm">{integration.name}</p>
                <p className="text-xs text-muted-foreground">{integration.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
