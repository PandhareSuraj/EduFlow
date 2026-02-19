import { Card, CardContent } from "@/components/ui/card";
import { Smartphone, Bell, Wifi, WifiOff, MapPin, Camera, Calendar, CreditCard } from "lucide-react";
import dashboardPreview from '@/assets/screenshots/dashboard-preview.png';

const mobileFeatures = [
  { icon: Bell, title: "Push Notifications", desc: "Instant alerts for fees, attendance, exams" },
  { icon: WifiOff, title: "Offline Mode", desc: "Works without internet, syncs when connected" },
  { icon: MapPin, title: "GPS Attendance", desc: "Location-verified attendance marking" },
  { icon: Camera, title: "Document Scan", desc: "Scan and upload documents instantly" },
  { icon: Calendar, title: "Schedule View", desc: "View timetables and upcoming events" },
  { icon: CreditCard, title: "Quick Payments", desc: "Pay fees via UPI, cards, or net banking" },
];

export function MobileShowcase() {
  return (
    <section className="container mx-auto px-4 py-20 bg-muted/30">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        {/* Content */}
        <div className="space-y-8">
          <div className="space-y-4">
            <p className="text-sm font-medium text-primary uppercase tracking-wider">
              Mobile First
            </p>
            <h2 className="text-3xl md:text-5xl font-bold">
              Manage On the Go
            </h2>
            <p className="text-xl text-muted-foreground">
              Access EduFlow from any device. Our responsive design and mobile apps ensure you're always connected.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {mobileFeatures.map((feature, i) => (
              <div key={i} className="flex gap-3 items-start group">
                <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* App Store Badges */}
          <div className="flex flex-wrap gap-4">
            <div className="relative px-6 py-3 bg-black/70 text-white rounded-xl flex items-center gap-3 opacity-70">
              <div className="text-2xl">🍎</div>
              <div>
                <p className="text-xs text-gray-400">Download on the</p>
                <p className="font-semibold">App Store</p>
              </div>
              <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full">Coming Soon</span>
            </div>
            <div className="relative px-6 py-3 bg-black/70 text-white rounded-xl flex items-center gap-3 opacity-70">
              <div className="text-2xl">▶️</div>
              <div>
                <p className="text-xs text-gray-400">Get it on</p>
                <p className="font-semibold">Google Play</p>
              </div>
              <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full">Coming Soon</span>
            </div>
          </div>
        </div>

        {/* Phone Mockup */}
        <div className="relative flex justify-center">
          <div className="relative">
            {/* Phone Frame */}
            <div className="relative w-72 h-[580px] bg-gray-900 rounded-[3rem] p-3 shadow-2xl">
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-gray-900 rounded-b-2xl z-10"></div>
              
              {/* Screen */}
              <div className="w-full h-full bg-background rounded-[2.5rem] overflow-hidden">
                {/* Status Bar */}
                <div className="flex justify-between items-center px-6 py-2 text-xs bg-muted/50">
                  <span>9:41</span>
                  <div className="flex gap-1">
                    <Wifi className="h-3 w-3" />
                    <span>100%</span>
                  </div>
                </div>

                {/* Real Platform Screenshot */}
                <img 
                  src={dashboardPreview} 
                  alt="EduFlow mobile view - Real platform screenshot"
                  loading="lazy"
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 p-3 bg-card rounded-xl shadow-lg animate-bounce">
              <Bell className="h-6 w-6 text-primary" />
            </div>
            <div className="absolute -bottom-4 -left-4 p-3 bg-card rounded-xl shadow-lg animate-pulse">
              <div className="text-green-500 font-bold text-sm">✓ Synced</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
