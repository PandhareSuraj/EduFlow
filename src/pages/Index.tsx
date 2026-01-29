import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  GraduationCap, Users, BookOpen, TrendingUp, LogIn, 
  CheckCircle2, BarChart3, Shield, Zap, Clock, Globe,
  Calendar, DollarSign, FileText, Award, Building2, Bus,
  Heart, UserCheck, ArrowRight, Sparkles, Play, Map, Menu, CalendarPlus
} from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import eduflowLogo from '@/assets/eduflow-logo.png';
import { 
  IntegrationLogos, 
  HowItWorks, 
  TestimonialsSection, 
  PricingPreview, 
  MobileShowcase, 
  SecurityBadges,
  AwardsRecognition 
} from '@/components/landing';
import { FloatingContactButton, InquiryFormDialog } from '@/components/lead-generation';

export default function Index() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [statsCount, setStatsCount] = useState({ colleges: 0, students: 0, faculty: 0, uptime: 0 });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    // Animate counters
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;
    
    const targets = { colleges: 500, students: 50000, faculty: 5000, uptime: 99.9 };
    let step = 0;

    const timer = setInterval(() => {
      step++;
      setStatsCount({
        colleges: Math.floor((targets.colleges * step) / steps),
        students: Math.floor((targets.students * step) / steps),
        faculty: Math.floor((targets.faculty * step) / steps),
        uptime: parseFloat(((targets.uptime * step) / steps).toFixed(1))
      });

      if (step >= steps) clearInterval(timer);
    }, interval);

    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img 
              src={eduflowLogo} 
              alt="EduFlow - Education Management Platform" 
              loading="eager"
              className="h-10 md:h-12 lg:h-14 w-auto animate-[fade-in_0.6s_ease-out,scale-in_0.5s_ease-out] hover:scale-105 hover:drop-shadow-[0_0_20px_rgba(59,130,246,0.6)] transition-all duration-300 cursor-pointer" 
            />
          </div>
          <div className="hidden sm:flex items-center gap-1 md:gap-2">
            <Button variant="ghost" onClick={() => scrollToSection('features')} className="text-sm">
              Features
            </Button>
            <Button variant="ghost" onClick={() => scrollToSection('pricing')} className="text-sm">
              Pricing
            </Button>
            <Button variant="ghost" onClick={() => scrollToSection('testimonials')} className="text-sm">
              Testimonials
            </Button>
            <Button variant="ghost" onClick={() => navigate('/product-tour')} className="text-sm">
              <Map className="mr-1.5 h-3.5 w-3.5" />
              Product Tour
            </Button>
            <InquiryFormDialog title="Book a Demo" description="Schedule a personalized demo with our team to see EduFlow in action.">
              <Button variant="outline" className="text-sm border-primary/50 hover:bg-primary/5">
                <CalendarPlus className="mr-1.5 h-3.5 w-3.5" />
                Book Demo
              </Button>
            </InquiryFormDialog>
            <Button onClick={() => navigate('/auth')} className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity text-sm">
              <LogIn className="mr-1.5 h-3.5 w-3.5" />
              Sign In
            </Button>
          </div>

          {/* Mobile Hamburger Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="sm:hidden">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] bg-background">
              <div className="flex flex-col gap-4 mt-8">
                <img 
                  src={eduflowLogo} 
                  alt="EduFlow" 
                  loading="lazy"
                  className="h-10 w-auto mb-4" 
                />
                <Button 
                  variant="ghost" 
                  onClick={() => scrollToSection('features')} 
                  className="justify-start text-base"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Features
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => scrollToSection('pricing')} 
                  className="justify-start text-base"
                >
                  <DollarSign className="mr-2 h-4 w-4" />
                  Pricing
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => scrollToSection('testimonials')} 
                  className="justify-start text-base"
                >
                  <Award className="mr-2 h-4 w-4" />
                  Testimonials
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => { navigate('/product-tour'); setMobileMenuOpen(false); }} 
                  className="justify-start text-base"
                >
                  <Map className="mr-2 h-4 w-4" />
                  Product Tour
                </Button>
                <InquiryFormDialog title="Book a Demo" description="Schedule a personalized demo with our team to see EduFlow in action.">
                  <Button 
                    variant="outline" 
                    className="justify-start text-base border-primary/50"
                  >
                    <CalendarPlus className="mr-2 h-4 w-4" />
                    Book Demo
                  </Button>
                </InquiryFormDialog>
                <div className="border-t my-2" />
                <Button 
                  onClick={() => { navigate('/auth'); setMobileMenuOpen(false); }} 
                  className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Complete Education Management Solution</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
              Transform Your{" "}
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-pulse">
                Institution
              </span>
              {" "}Digitally
            </h1>
            
            <p className="text-xl text-muted-foreground leading-relaxed">
              EduFlow is a powerful education management platform designed for institutions of all types. 
              Manage students, faculty, academics, finances, and operations seamlessly.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button 
                size="lg" 
                onClick={() => navigate('/auth')}
                className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-all shadow-elegant hover:shadow-glow group"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate('/product-tour')}
                className="border-2 hover:bg-primary/5 group"
              >
                <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                Watch Demo
              </Button>
            </div>

            {/* Stats Counter */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{statsCount.colleges}+</div>
                <div className="text-sm text-muted-foreground">Institutions</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary">{statsCount.students.toLocaleString()}+</div>
                <div className="text-sm text-muted-foreground">Students</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent">{statsCount.faculty.toLocaleString()}+</div>
                <div className="text-sm text-muted-foreground">Faculty</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-success">{statsCount.uptime}%</div>
                <div className="text-sm text-muted-foreground">Uptime</div>
              </div>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="relative animate-fade-in delay-300">
            <div className="relative rounded-2xl overflow-hidden shadow-glass border border-primary/10 bg-gradient-glass backdrop-blur-xl p-1">
              <div className="rounded-xl overflow-hidden bg-gradient-to-br from-primary/5 to-secondary/5 p-8">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: Users, label: "Students", color: "primary" },
                    { icon: BookOpen, label: "Academics", color: "secondary" },
                    { icon: DollarSign, label: "Finances", color: "success" },
                    { icon: Calendar, label: "Events", color: "warning" }
                  ].map((item, i) => (
                    <Card key={i} className="bg-card/50 backdrop-blur-sm hover:scale-105 transition-transform cursor-pointer">
                      <CardContent className="p-6 text-center">
                        <div className={`p-3 bg-${item.color}/10 rounded-full w-fit mx-auto mb-3`}>
                          {item.label === "Finances" ? (
                            <span className={`text-2xl font-bold text-${item.color}`}>₹</span>
                          ) : (
                            <item.icon className={`h-6 w-6 text-${item.color}`} />
                          )}
                        </div>
                        <p className="font-medium">{item.label}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/20 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-secondary/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
          </div>
        </div>
      </section>

      {/* Integration Partners */}
      <IntegrationLogos />

      {/* Core Features */}
      <section id="features" className="container mx-auto px-4 py-20 bg-muted/30 scroll-mt-20">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold">
            Everything Your Institution Needs
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive modules designed for modern educational management
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: Users,
              title: "Student Management",
              description: "Complete student lifecycle from admission to alumni. Track records, attendance, and performance.",
              features: ["Admission Management", "Profile Management", "Attendance Tracking", "Progress Reports"]
            },
            {
              icon: BookOpen,
              title: "Academic Excellence",
              description: "Manage courses, curriculum, examinations, and results with ease and precision.",
              features: ["Course Management", "Exam Scheduling", "Result Processing", "Faculty Assignment"]
            },
            {
              icon: DollarSign,
              title: "Financial Management",
              description: "Handle fees, payments, expenses, and generate comprehensive financial reports.",
              features: ["Fee Collection", "Payment Processing", "Expense Tracking", "Financial Reports"]
            },
            {
              icon: Building2,
              title: "Hostel Management",
              description: "Manage hostel rooms, allocations, complaints, and maintain student accommodation.",
              features: ["Room Allocation", "Occupancy Tracking", "Complaint Management", "Inventory Control"]
            },
            {
              icon: Bus,
              title: "Transport System",
              description: "Organize routes, track buses, manage drivers, and ensure safe student transportation.",
              features: ["Route Management", "Vehicle Tracking", "Driver Management", "Student Assignments"]
            },
            {
              icon: BookOpen,
              title: "Library System",
              description: "Comprehensive library management with book inventory, issue/return, and digital cataloging.",
              features: ["Book Management", "Issue/Return", "Member Management", "Digital Catalog"]
            },
            {
              icon: Calendar,
              title: "Event Management",
              description: "Plan, organize, and track institutional events, seminars, and activities seamlessly.",
              features: ["Event Scheduling", "Registration", "Attendance", "Photo Gallery"]
            },
            {
              icon: Award,
              title: "Placement & Career",
              description: "Connect students with opportunities, track placements, and maintain industry relationships.",
              features: ["Company Database", "Placement Drives", "Student Profiles", "Success Tracking"]
            },
            {
              icon: Heart,
              title: "Grievance Handling",
              description: "Efficient system to receive, track, and resolve student and staff grievances.",
              features: ["Anonymous Reporting", "Status Tracking", "Priority Management", "Resolution Reports"]
            }
          ].map((feature, i) => (
            <Card 
              key={i} 
              className="group bg-card/50 backdrop-blur-sm hover:shadow-glow transition-all duration-300 hover:-translate-y-2 border-primary/10"
            >
              <CardHeader>
                <div className="p-3 bg-gradient-to-br from-primary to-secondary rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                  {feature.title === "Financial Management" ? (
                    <span className="text-3xl font-bold text-white">₹</span>
                  ) : (
                    <feature.icon className="h-8 w-8 text-white" />
                  )}
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {feature.features.map((item, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <HowItWorks />

      {/* Institution Types */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold">
            Built for All Institution Types
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Flexible and adaptable to your institution's unique requirements
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { emoji: "🏥", title: "Medical Colleges", desc: "Patient management, clinical rotations, equipment tracking" },
            { emoji: "⚙️", title: "Engineering", desc: "Lab management, projects, industry partnerships" },
            { emoji: "🎨", title: "Arts & Sciences", desc: "Cultural events, research, diverse programs" },
            { emoji: "💼", title: "Commerce", desc: "Business simulations, internships, career guidance" },
            { emoji: "🎓", title: "Universities", desc: "Multi-department coordination, large-scale operations" },
            { emoji: "🏫", title: "K-12 Schools", desc: "Age-appropriate features, parent communication" },
            { emoji: "💻", title: "Technical Institutes", desc: "Skill development, certification programs" },
            { emoji: "🌍", title: "International", desc: "Multi-language, diverse curricula support" }
          ].map((type, i) => (
            <Card 
              key={i}
              className="text-center hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 cursor-pointer group bg-gradient-glass backdrop-blur-sm border-primary/10"
            >
              <CardContent className="p-8">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{type.emoji}</div>
                <h3 className="font-bold text-lg mb-2">{type.title}</h3>
                <p className="text-sm text-muted-foreground">{type.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="scroll-mt-20">
        <TestimonialsSection />
      </section>

      {/* Awards & Recognition */}
      <AwardsRecognition />

      {/* Why Choose Us */}
      <section className="container mx-auto px-4 py-20 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold">
              Why Institutions Choose EduFlow
            </h2>
            <p className="text-xl text-muted-foreground">
              Experience the difference with our advanced features
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              { icon: Zap, title: "Lightning Fast", desc: "Optimized performance for thousands of concurrent users" },
              { icon: Shield, title: "Secure & Compliant", desc: "Enterprise-grade security with data encryption" },
              { icon: Clock, title: "24/7 Support", desc: "Round-the-clock assistance from our expert team" },
              { icon: Globe, title: "Cloud-Based", desc: "Access from anywhere, anytime, on any device" },
              { icon: BarChart3, title: "Advanced Analytics", desc: "Data-driven insights for better decision making" },
              { icon: UserCheck, title: "Easy to Use", desc: "Intuitive interface requiring minimal training" }
            ].map((item, i) => (
              <div key={i} className="flex gap-4 items-start group">
                <div className="p-3 bg-gradient-to-br from-primary to-secondary rounded-xl flex-shrink-0 group-hover:scale-110 transition-transform">
                  <item.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section id="pricing" className="scroll-mt-20">
        <PricingPreview />
      </section>

      {/* Mobile Showcase */}
      <MobileShowcase />

      {/* Security Badges */}
      <SecurityBadges />

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="bg-gradient-to-br from-primary via-secondary to-accent text-white border-0 shadow-glow">
          <CardContent className="p-12 md:p-16 text-center space-y-6">
            <h2 className="text-3xl md:text-5xl font-bold">
              Ready to Transform Your Institution?
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Join hundreds of institutions already using EduFlow to streamline their operations
            </p>
            <div className="flex flex-wrap gap-4 justify-center pt-6">
              <Button 
                size="lg" 
                onClick={() => navigate('/auth')}
                className="bg-white text-primary hover:bg-white/90 shadow-elegant group"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate('/product-tour')}
                className="border-2 border-white text-white hover:bg-white/20 bg-white/10"
              >
                Take Product Tour
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <img src={eduflowLogo} alt="EduFlow" loading="lazy" className="h-8 w-auto" />
              </div>
              <p className="text-sm text-muted-foreground">
                Complete education management solution for modern educational institutions.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="hover:text-primary cursor-pointer transition-colors" onClick={() => navigate('/product-tour')}>Product Tour</li>
                <li className="hover:text-primary cursor-pointer transition-colors">Pricing</li>
                <li className="hover:text-primary cursor-pointer transition-colors">Security</li>
                <li className="hover:text-primary cursor-pointer transition-colors">Roadmap</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="hover:text-primary cursor-pointer transition-colors">About Us</li>
                <li className="hover:text-primary cursor-pointer transition-colors">Careers</li>
                <li className="hover:text-primary cursor-pointer transition-colors">Blog</li>
                <li className="hover:text-primary cursor-pointer transition-colors">Contact</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="hover:text-primary cursor-pointer transition-colors">Privacy Policy</li>
                <li className="hover:text-primary cursor-pointer transition-colors">Terms of Service</li>
                <li className="hover:text-primary cursor-pointer transition-colors">Cookie Policy</li>
                <li className="hover:text-primary cursor-pointer transition-colors">GDPR</li>
              </ul>
            </div>
          </div>

          <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© 2025 EduFlow Platform. Empowering Educational Institutions Worldwide. Built at myweb (<a href="https://www.mywebz.in" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline transition-colors">www.mywebz.in</a>)</p>
            <div className="flex gap-4">
              <span className="hover:text-primary cursor-pointer transition-colors">Twitter</span>
              <span className="hover:text-primary cursor-pointer transition-colors">LinkedIn</span>
              <span className="hover:text-primary cursor-pointer transition-colors">Facebook</span>
              <span className="hover:text-primary cursor-pointer transition-colors">Instagram</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Contact Button */}
      <FloatingContactButton />
    </div>
  );
}
