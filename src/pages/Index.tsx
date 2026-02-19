import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  GraduationCap, Users, BookOpen, TrendingUp, LogIn, 
  CheckCircle2, BarChart3, Shield, Zap, Clock, Globe,
  Calendar, DollarSign, FileText, Award, Building2, Bus,
  Heart, UserCheck, ArrowRight, Sparkles, Play, Map, Menu, CalendarPlus, Phone
} from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import eduflowLogo from '@/assets/eduflow-logo.png';
import dashboardPreview from '@/assets/screenshots/dashboard-preview.png';
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
import { IntroVideoDialog } from '@/components/videos/IntroVideoDialog';
 import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';

export default function Index() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
   const { t } = useTranslation();
  const [statsCount, setStatsCount] = useState({ colleges: 0, students: 0, faculty: 0, uptime: 0 });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);

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

  // JSON-LD structured data for SEO
  useEffect(() => {
    const jsonLd = document.createElement('script');
    jsonLd.type = 'application/ld+json';
    jsonLd.textContent = JSON.stringify([
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'EduFlow',
        url: 'https://www.eduflow.mywebz.in',
        logo: 'https://www.eduflow.mywebz.in/icons/icon-512x512.png',
        description: 'EduFlow is a comprehensive college management software and education ERP platform for institutions in India.',
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'sales',
          availableLanguage: ['English', 'Hindi', 'Marathi']
        },
        sameAs: []
      },
      {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'EduFlow',
        alternateName: ['EduFlow ERP', 'EduFlow College Management', 'EduFlow Education ERP'],
        applicationCategory: 'BusinessApplication',
        applicationSubCategory: 'Education Management Software',
        operatingSystem: 'Web-based',
        url: 'https://www.eduflow.mywebz.in',
        description: 'Complete college management software and education ERP for managing students, faculty, fees, attendance, hostel, library, transport, exams, and placements.',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'INR',
          description: 'Free trial available with no setup fees'
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.8',
          ratingCount: '500',
          bestRating: '5'
        },
        featureList: [
          'Student Management System',
          'Faculty Management',
          'Fee Collection & Financial Management',
          'Attendance Tracking System',
          'Hostel Management Software',
          'Library Management System',
          'Transport Management',
          'Exam Management & Result Processing',
          'Placement Management',
          'Event Management',
          'Grievance Handling',
          'Inventory Management',
          'Multi-language Support (English, Hindi, Marathi)',
          'Role-based Access Control',
          'Export to Excel and PDF',
          'Mobile Responsive PWA',
          'Push Notifications',
          'Audit Trail'
        ]
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'EduFlow',
        url: 'https://www.eduflow.mywebz.in',
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://www.eduflow.mywebz.in/?q={search_term_string}',
          'query-input': 'required name=search_term_string'
        }
      }
    ]);
    document.head.appendChild(jsonLd);
    return () => { jsonLd.remove(); };
  }, []);

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
      {/* Skip Link for keyboard navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
      >
        Skip to main content
      </a>

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
              className="h-14 md:h-16 lg:h-20 w-auto animate-[fade-in_0.6s_ease-out,scale-in_0.5s_ease-out] hover:scale-105 hover:drop-shadow-[0_0_20px_rgba(59,130,246,0.6)] transition-all duration-300 cursor-pointer" 
            />
          </div>
          <div className="hidden sm:flex items-center gap-1 md:gap-2">
            <Button variant="ghost" onClick={() => scrollToSection('features')} className="text-sm">{t('common.features')}</Button>
            <Button variant="ghost" onClick={() => scrollToSection('pricing')} className="text-sm">{t('common.pricing')}</Button>
            <Button variant="ghost" onClick={() => scrollToSection('testimonials')} className="text-sm">{t('common.testimonials')}</Button>
            <Button variant="ghost" onClick={() => navigate('/product-tour')} className="text-sm">
              <Map className="mr-1.5 h-3.5 w-3.5" />
              {t('common.productTour')}
            </Button>
            <LanguageSwitcher />
            <InquiryFormDialog title={t('common.bookDemo')} description="Schedule a personalized demo with our team to see EduFlow in action.">
              <Button variant="outline" className="text-sm border-primary/50 hover:bg-primary/5">
                <CalendarPlus className="mr-1.5 h-3.5 w-3.5" />
                {t('common.bookDemo')}
              </Button>
            </InquiryFormDialog>
            <Button onClick={() => navigate('/auth')} className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity text-sm">
              <LogIn className="mr-1.5 h-3.5 w-3.5" />
              {t('common.signIn')}
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
                  className="h-14 w-auto mb-4" 
                />
                <Button 
                  variant="ghost" 
                  onClick={() => scrollToSection('features')} 
                  className="justify-start text-base"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  {t('common.features')}
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => scrollToSection('pricing')} 
                  className="justify-start text-base"
                >
                  <DollarSign className="mr-2 h-4 w-4" />
                  {t('common.pricing')}
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => scrollToSection('testimonials')} 
                  className="justify-start text-base"
                >
                  <Award className="mr-2 h-4 w-4" />
                  {t('common.testimonials')}
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => { navigate('/product-tour'); setMobileMenuOpen(false); }} 
                  className="justify-start text-base"
                >
                  <Map className="mr-2 h-4 w-4" />
                  {t('common.productTour')}
                </Button>
                <InquiryFormDialog title={t('common.bookDemo')} description="Schedule a personalized demo with our team to see EduFlow in action.">
                  <Button 
                    variant="outline" 
                    className="justify-start text-base border-primary/50"
                  >
                    <CalendarPlus className="mr-2 h-4 w-4" />
                    {t('common.bookDemo')}
                  </Button>
                </InquiryFormDialog>
                <div className="border-t my-2" />
                <Button 
                  onClick={() => { navigate('/auth'); setMobileMenuOpen(false); }} 
                  className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  {t('common.signIn')}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">{t('landing.hero.badge')}</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
              {t('landing.hero.title')}{" "}
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-pulse">
                {t('landing.hero.titleHighlight')}
              </span>
              {" "}{t('landing.hero.titleEnd')}
            </h1>
            
            <p className="text-xl text-muted-foreground leading-relaxed">
              {t('landing.hero.description')}
            </p>

            <div className="flex flex-wrap gap-4">
              <Button 
                size="lg" 
                onClick={() => navigate('/auth')}
                className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-all shadow-elegant hover:shadow-glow group"
              >
                {t('common.getStarted')}
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <InquiryFormDialog title="Book a Free Demo" description="Get a personalized walkthrough of EduFlow for your institution.">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-2 border-primary/50 hover:bg-primary/5 group"
                >
                  <CalendarPlus className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  Book a Free Demo
                </Button>
              </InquiryFormDialog>
              <Button 
                size="lg" 
                variant="ghost"
                onClick={() => setVideoModalOpen(true)}
                className="group"
              >
                <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                {t('common.watchDemo')}
              </Button>
            </div>

            {/* Stats Counter */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{statsCount.colleges}+</div>
                <div className="text-sm text-muted-foreground">{t('landing.hero.stats.institutions')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary">{statsCount.students.toLocaleString()}+</div>
                <div className="text-sm text-muted-foreground">{t('landing.hero.stats.students')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent">{statsCount.faculty.toLocaleString()}+</div>
                <div className="text-sm text-muted-foreground">{t('landing.hero.stats.faculty')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-success">{statsCount.uptime}%</div>
                <div className="text-sm text-muted-foreground">{t('landing.hero.stats.uptime')}</div>
              </div>
            </div>
          </div>

          {/* Hero Visual - Real Platform Screenshot */}
          <div className="relative animate-fade-in delay-300">
            <div className="relative rounded-2xl overflow-hidden shadow-glass border border-primary/10 bg-gradient-glass backdrop-blur-xl p-1">
              <div className="rounded-xl overflow-hidden bg-background">
                {/* Browser Chrome */}
                <div className="bg-muted p-2.5 flex items-center gap-2.5">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-destructive/60" />
                    <div className="w-3 h-3 rounded-full bg-warning/60" />
                    <div className="w-3 h-3 rounded-full bg-success/60" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="bg-background rounded-md px-4 py-1 text-xs text-muted-foreground">
                      app.eduflow.in/dashboard
                    </div>
                  </div>
                </div>
                <img 
                  src={dashboardPreview} 
                  alt="EduFlow Dashboard - Real platform screenshot showing student management, attendance tracking, and analytics"
                  loading="eager"
                  className="w-full h-auto object-cover"
                />
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
            {t('landing.features.title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('landing.features.subtitle')}
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

      {/* Mid-Page CTA Banner */}
      <section className="container mx-auto px-4 py-12">
        <div className="relative rounded-2xl bg-gradient-to-r from-primary/10 via-secondary/5 to-accent/10 border border-primary/20 p-8 md:p-12 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 blur-3xl -z-10" />
          <h3 className="text-2xl md:text-3xl font-bold mb-3">
            Still exploring? Let us show you around.
          </h3>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Get a quick callback from our team — we'll walk you through the features that matter most to your institution.
          </p>
          <InquiryFormDialog title="Request a Callback" description="Leave your details and our team will call you back within 24 hours.">
            <Button size="lg" className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 shadow-lg">
              <Phone className="mr-2 h-5 w-5" />
              Request a Callback
            </Button>
          </InquiryFormDialog>
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
              {t('landing.cta.title')}
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              {t('landing.cta.subtitle')}
            </p>
            <div className="flex flex-wrap gap-4 justify-center pt-6">
              <Button 
                size="lg" 
                onClick={() => navigate('/auth')}
                className="bg-white text-primary hover:bg-white/90 shadow-elegant group"
              >
                {t('common.startFreeTrial')}
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <InquiryFormDialog title="Schedule a Demo" description="Book a personalized demo and see how EduFlow can transform your institution.">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white/20 bg-white/10"
                >
                  <CalendarPlus className="mr-2 h-5 w-5" />
                  Schedule a Demo
                </Button>
              </InquiryFormDialog>
            </div>
          </CardContent>
        </Card>
      </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <img src={eduflowLogo} alt="EduFlow" loading="lazy" className="h-12 w-auto" />
              </div>
              <p className="text-sm text-muted-foreground">
                Complete education management solution for modern educational institutions.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="hover:text-primary cursor-pointer transition-colors" onClick={() => navigate('/product-tour')}>Product Tour</li>
                <li className="hover:text-primary cursor-pointer transition-colors" onClick={() => scrollToSection('pricing')}>Pricing</li>
                <li className="hover:text-primary cursor-pointer transition-colors" onClick={() => scrollToSection('features')}>Features</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="https://www.mywebz.in" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">About Us</a>
                </li>
                <li>
                  <a href="mailto:support@eduflow.mywebz.in" className="hover:text-primary transition-colors">Contact</a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="text-muted-foreground/60">Privacy Policy</li>
                <li className="text-muted-foreground/60">Terms of Service</li>
              </ul>
            </div>
          </div>

          <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} EduFlow Platform. Empowering Educational Institutions Worldwide. Built at myweb (<a href="https://www.mywebz.in" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline transition-colors">www.mywebz.in</a>)</p>
          </div>
        </div>
      </footer>

      {/* Floating Contact Button */}
      <FloatingContactButton />

      {/* Intro Video Modal */}
      <IntroVideoDialog open={videoModalOpen} onOpenChange={setVideoModalOpen} />
    </div>
  );
}
