import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, BookOpen, DollarSign, BarChart3, Library, Calendar,
  CheckCircle2, ArrowRight, Sparkles
} from 'lucide-react';

// Import screenshots
import dashboardPreview from '@/assets/screenshots/dashboard-preview.png';
import studentsPreview from '@/assets/screenshots/students-preview.png';
import academicsPreview from '@/assets/screenshots/academics-preview.png';
import financePreview from '@/assets/screenshots/finance-preview.png';
import libraryPreview from '@/assets/screenshots/library-preview.png';
import eventsPreview from '@/assets/screenshots/events-preview.png';

interface Hotspot {
  id: string;
  x: number; // percentage from left
  y: number; // percentage from top
  label: string;
  description: string;
}

const screenshots = [
  {
    id: 'dashboard',
    tab: 'Dashboard',
    icon: BarChart3,
    title: 'Command Center for Your Institution',
    description: 'Get a bird\'s eye view of everything happening at your institution. Real-time stats, pending tasks, and quick actions - all in one place.',
    features: [
      'Live student count & attendance',
      'Fee collection status',
      'Today\'s schedule',
      'Quick action buttons'
    ],
    color: 'from-purple-500 to-purple-600',
    screenshot: dashboardPreview,
    hotspots: [
      { id: 'stats', x: 15, y: 20, label: 'Live Statistics', description: 'Real-time student count, attendance rate, and fee collection status' },
      { id: 'charts', x: 50, y: 45, label: 'Analytics Charts', description: 'Visual breakdown of trends and performance metrics' },
      { id: 'actions', x: 85, y: 25, label: 'Quick Actions', description: 'One-click access to common tasks like adding students or collecting fees' },
      { id: 'calendar', x: 80, y: 70, label: 'Today\'s Schedule', description: 'Upcoming classes, events, and important deadlines' },
    ] as Hotspot[]
  },
  {
    id: 'students',
    tab: 'Students',
    icon: Users,
    title: 'Complete Student Management',
    description: 'Manage every aspect of student data from admission to alumni. Searchable, filterable, exportable.',
    features: [
      'Digital admission forms',
      'Document management',
      'Academic history',
      'Parent portal access'
    ],
    color: 'from-blue-500 to-blue-600',
    screenshot: studentsPreview,
    hotspots: [
      { id: 'search', x: 30, y: 15, label: 'Smart Search', description: 'Find any student instantly with intelligent search and filters' },
      { id: 'profile', x: 20, y: 50, label: 'Student Profiles', description: 'Complete student information including photo, documents, and history' },
      { id: 'actions', x: 85, y: 35, label: 'Bulk Actions', description: 'Export data, send notifications, or update multiple records at once' },
      { id: 'status', x: 70, y: 65, label: 'Status Indicators', description: 'Visual cues for fee status, attendance, and academic standing' },
    ] as Hotspot[]
  },
  {
    id: 'academics',
    tab: 'Academics',
    icon: BookOpen,
    title: 'Academic Excellence Tools',
    description: 'Courses, attendance, exams, and results - streamlined for efficiency and accuracy.',
    features: [
      'Course & subject mapping',
      'One-tap attendance',
      'Exam scheduling',
      'Auto grade calculation'
    ],
    color: 'from-green-500 to-green-600',
    screenshot: academicsPreview,
    hotspots: [
      { id: 'courses', x: 25, y: 30, label: 'Course Management', description: 'Create and manage courses with subject mappings and faculty assignments' },
      { id: 'attendance', x: 60, y: 25, label: 'Attendance Tracking', description: 'Mark attendance with one tap, view reports, and set alerts' },
      { id: 'exams', x: 45, y: 60, label: 'Exam Scheduler', description: 'Schedule exams, assign rooms, and notify students automatically' },
      { id: 'grades', x: 80, y: 50, label: 'Grade Calculator', description: 'Automatic grade calculation with customizable grading schemes' },
    ] as Hotspot[]
  },
  {
    id: 'finance',
    tab: 'Finance',
    icon: DollarSign,
    title: 'Financial Operations Hub',
    description: 'Fee collection, receipts, defaulter tracking, and comprehensive financial reports.',
    features: [
      'Multiple payment modes',
      'Instant digital receipts',
      'Installment plans',
      'GST compliance'
    ],
    color: 'from-amber-500 to-amber-600',
    screenshot: financePreview,
    hotspots: [
      { id: 'collection', x: 20, y: 35, label: 'Fee Collection', description: 'Accept payments via cash, card, UPI, or online banking' },
      { id: 'receipts', x: 55, y: 25, label: 'Digital Receipts', description: 'Auto-generate and send receipts via SMS, email, or WhatsApp' },
      { id: 'defaulters', x: 75, y: 55, label: 'Defaulter Tracking', description: 'Identify and follow up with students who have pending fees' },
      { id: 'reports', x: 40, y: 75, label: 'Financial Reports', description: 'Collection summaries, tax reports, and audit-ready statements' },
    ] as Hotspot[]
  },
  {
    id: 'library',
    tab: 'Library',
    icon: Library,
    title: 'Digital Library System',
    description: 'Complete library management with catalog, circulation, fines, and member management.',
    features: [
      'Book cataloging',
      'Issue/return tracking',
      'Fine management',
      'Low stock alerts'
    ],
    color: 'from-teal-500 to-teal-600',
    screenshot: libraryPreview,
    hotspots: [
      { id: 'catalog', x: 25, y: 30, label: 'Book Catalog', description: 'Searchable database with ISBN lookup and cover images' },
      { id: 'circulation', x: 60, y: 40, label: 'Circulation Desk', description: 'Issue and return books with barcode scanning support' },
      { id: 'members', x: 80, y: 25, label: 'Member Cards', description: 'Generate library cards with QR codes for easy identification' },
      { id: 'fines', x: 45, y: 70, label: 'Fine Calculator', description: 'Automatic fine calculation with grace period settings' },
    ] as Hotspot[]
  },
  {
    id: 'events',
    tab: 'Events',
    icon: Calendar,
    title: 'Event & Calendar Management',
    description: 'Plan, organize, and track all institutional events and activities.',
    features: [
      'Event scheduling',
      'Attendance tracking',
      'Certificate generation',
      'Photo galleries'
    ],
    color: 'from-pink-500 to-pink-600',
    screenshot: eventsPreview,
    hotspots: [
      { id: 'calendar', x: 30, y: 35, label: 'Event Calendar', description: 'Visual calendar with drag-and-drop event scheduling' },
      { id: 'registration', x: 70, y: 30, label: 'Registration', description: 'Online registration forms with seat limits and waitlists' },
      { id: 'certificates', x: 50, y: 65, label: 'Certificates', description: 'Generate and distribute participation certificates automatically' },
      { id: 'gallery', x: 85, y: 55, label: 'Photo Gallery', description: 'Upload and share event photos with students and parents' },
    ] as Hotspot[]
  }
];

interface HotspotMarkerProps {
  hotspot: Hotspot;
  isActive: boolean;
  onHover: (id: string | null) => void;
}

function HotspotMarker({ hotspot, isActive, onHover }: HotspotMarkerProps) {
  return (
    <div
      className="absolute z-10 group cursor-pointer"
      style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
      onMouseEnter={() => onHover(hotspot.id)}
      onMouseLeave={() => onHover(null)}
    >
      {/* Pulse Animation */}
      <div className="absolute -inset-2">
        <div className="w-8 h-8 rounded-full bg-primary/30 animate-ping" />
      </div>
      
      {/* Hotspot Dot */}
      <div className={`relative w-4 h-4 rounded-full transition-all duration-300 ${
        isActive 
          ? 'bg-primary scale-150 shadow-glow' 
          : 'bg-primary/80 hover:scale-125'
      }`}>
        <Sparkles className="absolute -top-0.5 -left-0.5 w-5 h-5 text-white" />
      </div>

      {/* Tooltip */}
      <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-3 transition-all duration-300 pointer-events-none ${
        isActive 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-2'
      }`}>
        <div className="bg-popover text-popover-foreground border shadow-lg rounded-lg p-3 min-w-[200px] max-w-[280px]">
          <div className="font-semibold text-sm mb-1">{hotspot.label}</div>
          <p className="text-xs text-muted-foreground leading-relaxed">{hotspot.description}</p>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
            <div className="border-8 border-transparent border-t-popover" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ScreenshotShowcase() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const activeScreen = screenshots.find(s => s.id === activeTab)!;

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">Platform Preview</Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            See Every Module in Action
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Hover over the hotspots to explore EduFlow's powerful features
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {screenshots.map((screen) => (
            <Button
              key={screen.id}
              variant={activeTab === screen.id ? 'default' : 'outline'}
              className={`gap-2 ${activeTab === screen.id ? 'shadow-lg' : ''}`}
              onClick={() => {
                setActiveTab(screen.id);
                setActiveHotspot(null);
              }}
            >
              <screen.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{screen.tab}</span>
            </Button>
          ))}
        </div>

        {/* Main Display */}
        <div className="max-w-6xl mx-auto">
          <Card className="overflow-hidden border-0 shadow-2xl">
            <div className={`h-2 bg-gradient-to-r ${activeScreen.color}`} />
            <CardContent className="p-0">
              <div className="grid lg:grid-cols-5 gap-0">
                {/* Info Panel */}
                <div className="lg:col-span-2 p-8 bg-muted/30">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${activeScreen.color} flex items-center justify-center mb-6`}>
                    <activeScreen.icon className="h-8 w-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-4">{activeScreen.title}</h3>
                  <p className="text-muted-foreground mb-6">{activeScreen.description}</p>
                  
                  <div className="space-y-3">
                    {activeScreen.features.map((feature, i) => {
                      const hotspot = activeScreen.hotspots[i];
                      const isHighlighted = hotspot && activeHotspot === hotspot.id;
                      return (
                        <div 
                          key={i} 
                          className={`flex items-center gap-3 p-2 rounded-lg transition-all duration-300 ${
                            isHighlighted ? 'bg-primary/10 scale-105' : ''
                          }`}
                          onMouseEnter={() => hotspot && setActiveHotspot(hotspot.id)}
                          onMouseLeave={() => setActiveHotspot(null)}
                        >
                          <CheckCircle2 className={`h-5 w-5 flex-shrink-0 transition-colors ${
                            isHighlighted ? 'text-primary' : 'text-primary/70'
                          }`} />
                          <span className="text-sm">{feature}</span>
                        </div>
                      );
                    })}
                  </div>

                  <Button className="mt-8 group" variant="outline">
                    Learn More
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>

                {/* Screenshot Display */}
                <div className="lg:col-span-3 bg-card p-4 lg:p-6">
                  <div className="rounded-xl border shadow-lg overflow-hidden bg-background">
                    {/* Browser Chrome */}
                    <div className="bg-muted p-3 flex items-center gap-3">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-400" />
                        <div className="w-3 h-3 rounded-full bg-amber-400" />
                        <div className="w-3 h-3 rounded-full bg-green-400" />
                      </div>
                      <div className="flex-1 flex justify-center">
                        <div className="bg-background rounded-lg px-4 py-1 text-xs text-muted-foreground">
                          app.eduflow.in/{activeScreen.id}
                        </div>
                      </div>
                    </div>
                    
                    {/* Screenshot with Hotspots */}
                    <div className="relative overflow-hidden">
                      <img 
                        src={activeScreen.screenshot} 
                        alt={`${activeScreen.title} - EduFlow Screenshot`}
                        className="w-full h-auto object-cover animate-fade-in"
                        key={activeScreen.id}
                      />
                      
                      {/* Hotspot Markers */}
                      {activeScreen.hotspots.map((hotspot) => (
                        <HotspotMarker
                          key={hotspot.id}
                          hotspot={hotspot}
                          isActive={activeHotspot === hotspot.id}
                          onHover={setActiveHotspot}
                        />
                      ))}
                      
                      {/* Gradient overlay for polish */}
                      <div className="absolute inset-0 bg-gradient-to-t from-background/20 via-transparent to-transparent pointer-events-none" />
                    </div>
                  </div>
                  
                  {/* Hotspot hint */}
                  <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                    <span>Hover over the glowing dots to explore features</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}