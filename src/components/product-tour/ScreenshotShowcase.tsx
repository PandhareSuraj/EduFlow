import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, BookOpen, DollarSign, BarChart3, Library, Calendar,
  CheckCircle2, ArrowRight
} from 'lucide-react';

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
    color: 'from-purple-500 to-purple-600'
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
    color: 'from-blue-500 to-blue-600'
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
    color: 'from-green-500 to-green-600'
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
    color: 'from-amber-500 to-amber-600'
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
    color: 'from-teal-500 to-teal-600'
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
    color: 'from-pink-500 to-pink-600'
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

                {/* Screenshot Mockup */}
                <div className="lg:col-span-3 bg-card p-4 lg:p-8">
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
                    
                    {/* Mock Interface */}
                    <div className="p-6 space-y-4 min-h-[400px] animate-fade-in">
                      {/* Header Bar */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${activeScreen.color}`} />
                          <div>
                            <div className="h-4 w-32 bg-foreground/10 rounded" />
                            <div className="h-3 w-20 bg-foreground/5 rounded mt-1" />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <div className="h-8 w-20 bg-primary/20 rounded-lg" />
                          <div className="h-8 w-8 bg-muted rounded-lg" />
                        </div>
                      </div>

                      {/* Stats Row */}
                      <div className="grid grid-cols-4 gap-3">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="p-4 rounded-xl bg-muted/50">
                            <div className="h-3 w-12 bg-foreground/10 rounded mb-2" />
                            <div className="h-6 w-16 bg-primary/20 rounded" />
                          </div>
                        ))}
                      </div>

                      {/* Main Content */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2 h-48 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl p-4">
                          <div className="h-3 w-24 bg-foreground/10 rounded mb-4" />
                          <div className="space-y-2">
                            {[1, 2, 3, 4].map((i) => (
                              <div key={i} className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-muted" />
                                <div className="flex-1 h-3 bg-foreground/5 rounded" />
                                <div className="w-16 h-6 bg-primary/10 rounded" />
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="h-48 bg-muted/30 rounded-xl p-4">
                          <div className="h-3 w-16 bg-foreground/10 rounded mb-4" />
                          <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                              <div key={i} className="h-8 bg-foreground/5 rounded-lg" />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
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
