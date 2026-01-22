import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, BookOpen, DollarSign, Building2, Bus, Library,
  Calendar, Award, Heart, FileText, Bell, Shield,
  ChevronDown, ChevronUp, CheckCircle2, Sparkles
} from 'lucide-react';

const features = [
  {
    id: 'students',
    icon: Users,
    title: 'Student Management',
    tagline: 'Complete student lifecycle management',
    color: 'from-blue-500 to-blue-600',
    description: 'From admission to alumni, manage every aspect of student data with powerful tools and automation.',
    capabilities: [
      'Digital admission forms with document upload',
      'Comprehensive student profiles with photo gallery',
      'Academic history and grade tracking',
      'Parent portal for real-time updates',
      'Bulk import/export via Excel',
      'Advanced search and filters',
      'ID card generation with QR codes',
      'Student promotion and transfers'
    ],
    stats: { students: '50,000+', institutions: '500+' }
  },
  {
    id: 'academics',
    icon: BookOpen,
    title: 'Academic Excellence',
    tagline: 'Curriculum & examination management',
    color: 'from-green-500 to-green-600',
    description: 'Design courses, schedule exams, and process results with intelligent automation and analytics.',
    capabilities: [
      'Course creation with credit mapping',
      'Faculty-subject assignment',
      'Automatic timetable generation',
      'Online & offline exam management',
      'MCQ test creation with auto-grading',
      'Result processing with grade calculations',
      'Academic calendar management',
      'Syllabus tracking and completion'
    ],
    stats: { courses: '10,000+', exams: '1M+' }
  },
  {
    id: 'finance',
    icon: DollarSign,
    title: 'Financial Management',
    tagline: 'Complete fee & payment handling',
    color: 'from-amber-500 to-amber-600',
    description: 'Streamline fee collection, generate receipts, and maintain comprehensive financial records.',
    capabilities: [
      'Flexible fee structure configuration',
      'Multiple payment gateway integration',
      'Installment plans and due date tracking',
      'Automatic receipt generation',
      'Defaulter reports and follow-ups',
      'Scholarship and discount management',
      'Financial dashboards and reports',
      'GST and tax compliance'
    ],
    stats: { transactions: '₹100Cr+', collections: '99.5%' }
  },
  {
    id: 'hostel',
    icon: Building2,
    title: 'Hostel Management',
    tagline: 'Accommodation & facilities',
    color: 'from-purple-500 to-purple-600',
    description: 'Manage hostel rooms, allocations, mess, and maintain complete resident records.',
    capabilities: [
      'Room allocation with bed management',
      'Occupancy tracking and waitlists',
      'Mess management and meal planning',
      'Complaint registration and tracking',
      'Visitor log management',
      'Hostel fee integration',
      'Inventory and asset tracking',
      'Night attendance and security'
    ],
    stats: { rooms: '5,000+', residents: '20,000+' }
  },
  {
    id: 'transport',
    icon: Bus,
    title: 'Transport System',
    tagline: 'Route & vehicle management',
    color: 'from-red-500 to-red-600',
    description: 'Organize transport routes, track vehicles, and ensure safe student commute.',
    capabilities: [
      'Route planning and optimization',
      'Vehicle and driver management',
      'Student-route assignment',
      'GPS tracking integration',
      'Transport fee management',
      'Pick-up/drop-off notifications',
      'Driver attendance and logs',
      'Maintenance scheduling'
    ],
    stats: { routes: '1,000+', vehicles: '2,500+' }
  },
  {
    id: 'library',
    icon: Library,
    title: 'Library System',
    tagline: 'Book inventory & circulation',
    color: 'from-teal-500 to-teal-600',
    description: 'Comprehensive library management with digital catalog, circulation, and member management.',
    capabilities: [
      'Book cataloging with ISBN lookup',
      'Issue/return with barcode scanning',
      'Fine calculation and collection',
      'Member management (students/faculty)',
      'Digital library integration',
      'Reservation and hold system',
      'Low stock alerts',
      'Reading analytics and reports'
    ],
    stats: { books: '500K+', transactions: '2M+' }
  },
  {
    id: 'events',
    icon: Calendar,
    title: 'Event Management',
    tagline: 'Institutional activities',
    color: 'from-pink-500 to-pink-600',
    description: 'Plan, organize, and track all institutional events, seminars, and activities.',
    capabilities: [
      'Event scheduling and calendar',
      'Online registration and ticketing',
      'Attendance tracking',
      'Resource and venue booking',
      'Budget management',
      'Photo and video galleries',
      'Certificate generation',
      'Event analytics'
    ],
    stats: { events: '10,000+', participants: '1M+' }
  },
  {
    id: 'placements',
    icon: Award,
    title: 'Placement & Career',
    tagline: 'Industry connect & jobs',
    color: 'from-indigo-500 to-indigo-600',
    description: 'Connect students with opportunities and track placement success.',
    capabilities: [
      'Company database management',
      'Placement drive scheduling',
      'Student profile showcasing',
      'Interview scheduling',
      'Offer letter management',
      'Placement statistics',
      'Alumni network',
      'Career counseling'
    ],
    stats: { placements: '25,000+', companies: '500+' }
  },
  {
    id: 'grievances',
    icon: Heart,
    title: 'Grievance Handling',
    tagline: 'Issue resolution system',
    color: 'from-orange-500 to-orange-600',
    description: 'Efficient grievance management with anonymous reporting and resolution tracking.',
    capabilities: [
      'Anonymous complaint submission',
      'Category-based routing',
      'Priority assignment',
      'Status tracking',
      'Resolution timeline',
      'Escalation workflow',
      'Feedback collection',
      'Analytics dashboard'
    ],
    stats: { resolved: '99%', avgTime: '48hrs' }
  }
];

export function FeatureExplorer() {
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null);

  const toggleFeature = (id: string) => {
    setExpandedFeature(expandedFeature === id ? null : id);
  };

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            <Sparkles className="h-3 w-3 mr-1" />
            Comprehensive Features
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Explore Every Feature
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Click on any module to discover its complete capabilities
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const isExpanded = expandedFeature === feature.id;
            
            return (
              <Card 
                key={feature.id}
                className={`cursor-pointer transition-all duration-300 overflow-hidden ${
                  isExpanded ? 'lg:col-span-2 row-span-2 shadow-glow' : 'hover:shadow-elegant hover:-translate-y-1'
                }`}
                onClick={() => toggleFeature(feature.id)}
              >
                <div className={`h-1 bg-gradient-to-r ${feature.color}`} />
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.color}`}>
                        <feature.icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{feature.tagline}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="flex-shrink-0">
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <p className="text-muted-foreground mb-4">{feature.description}</p>
                  
                  {isExpanded && (
                    <div className="space-y-6 animate-fade-in">
                      <div>
                        <h4 className="font-semibold mb-3">Key Capabilities</h4>
                        <div className="grid sm:grid-cols-2 gap-2">
                          {feature.capabilities.map((cap, index) => (
                            <div key={index} className="flex items-start gap-2 text-sm">
                              <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                              <span>{cap}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex gap-4 pt-4 border-t">
                        {Object.entries(feature.stats).map(([key, value]) => (
                          <div key={key} className="text-center">
                            <div className="text-2xl font-bold text-primary">{value}</div>
                            <div className="text-xs text-muted-foreground capitalize">{key}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {!isExpanded && (
                    <div className="flex gap-2 flex-wrap">
                      {feature.capabilities.slice(0, 3).map((cap, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {cap.split(' ').slice(0, 2).join(' ')}...
                        </Badge>
                      ))}
                      <Badge variant="outline" className="text-xs">
                        +{feature.capabilities.length - 3} more
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
