import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, BookOpen, DollarSign, BarChart3, Library, Calendar,
  CheckCircle2, ArrowRight
} from 'lucide-react';

// Import screenshots
import dashboardPreview from '@/assets/screenshots/dashboard-preview.png';
import studentsPreview from '@/assets/screenshots/students-preview.png';
import academicsPreview from '@/assets/screenshots/academics-preview.png';
import financePreview from '@/assets/screenshots/finance-preview.png';
import libraryPreview from '@/assets/screenshots/library-preview.png';
import eventsPreview from '@/assets/screenshots/events-preview.png';

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
    screenshot: dashboardPreview
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
    screenshot: studentsPreview
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
    screenshot: academicsPreview
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
    screenshot: financePreview
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
    screenshot: libraryPreview
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
    screenshot: eventsPreview
  }
];

export function ScreenshotShowcase() {
  const [activeTab, setActiveTab] = useState('dashboard');
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
            Click through to explore EduFlow's powerful features
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {screenshots.map((screen) => (
            <Button
              key={screen.id}
              variant={activeTab === screen.id ? 'default' : 'outline'}
              className={`gap-2 ${activeTab === screen.id ? 'shadow-lg' : ''}`}
              onClick={() => setActiveTab(screen.id)}
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
                    {activeScreen.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
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
                    
                    {/* Real Screenshot */}
                    <div className="relative overflow-hidden">
                      <img 
                        src={activeScreen.screenshot} 
                        alt={`${activeScreen.title} - EduFlow Screenshot`}
                        className="w-full h-auto object-cover animate-fade-in"
                        key={activeScreen.id}
                      />
                      
                      {/* Gradient overlay for polish */}
                      <div className="absolute inset-0 bg-gradient-to-t from-background/20 via-transparent to-transparent pointer-events-none" />
                    </div>
                  </div>
                  
                  {/* Feature highlights below screenshot */}
                  <div className="mt-4 flex flex-wrap gap-2 justify-center">
                    {activeScreen.features.slice(0, 3).map((feature, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
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
