import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ArrowRight, Calendar, LogIn, ArrowLeft, CheckCircle2, CalendarPlus, Menu } from 'lucide-react';

// Import all product tour components
import { HeroSection3D } from '@/components/product-tour/HeroSection3D';
import { TrustLogos } from '@/components/product-tour/TrustLogos';
import { ProblemSolutionSection } from '@/components/product-tour/ProblemSolutionSection';
import { ScreenshotShowcase } from '@/components/product-tour/ScreenshotShowcase';
import { AnimatedInfographics } from '@/components/product-tour/AnimatedInfographics';
import { InteractiveWorkflowDemo } from '@/components/product-tour/InteractiveWorkflowDemo';
import { VideoWalkthrough } from '@/components/product-tour/VideoWalkthrough';
import { FeatureExplorer } from '@/components/product-tour/FeatureExplorer';
import { ROICalculator } from '@/components/product-tour/ROICalculator';
import { TestimonialCarousel } from '@/components/product-tour/TestimonialCarousel';
import { FAQSection } from '@/components/product-tour/FAQSection';
import eduflowLogo from '@/assets/eduflow-logo.png';
import { FloatingContactButton, InquiryFormDialog } from '@/components/lead-generation';

// SEO metadata for the Product Tour page
const PAGE_META = {
  title: 'Product Tour - EduFlow | See How It Works',
  description: 'Interactive demos, feature walkthroughs and ROI calculator for EduFlow\'s education management platform.',
  url: 'https://www.eduflow.mywebz.in/product-tour',
  image: 'https://storage.googleapis.com/gpt-engineer-file-uploads/lAaVSYx4RVVmxIS64ld97TLZWug1/social-images/social-1760781174571-clg crm.JPG',
};

export default function ProductTourPage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Set up meta tags and JSON-LD structured data
  useEffect(() => {
    // Update document title
    const originalTitle = document.title;
    document.title = PAGE_META.title;

    // Create and append meta tags
    const metaTags: HTMLMetaElement[] = [];
    const createMeta = (property: string, content: string, isName = false) => {
      const meta = document.createElement('meta');
      if (isName) {
        meta.name = property;
      } else {
        meta.setAttribute('property', property);
      }
      meta.content = content;
      document.head.appendChild(meta);
      metaTags.push(meta);
    };

    // Open Graph tags
    createMeta('og:title', PAGE_META.title);
    createMeta('og:description', PAGE_META.description);
    createMeta('og:url', PAGE_META.url);
    createMeta('og:image', PAGE_META.image);
    createMeta('og:type', 'website');
    createMeta('og:site_name', 'EduFlow');

    // Twitter Card tags
    createMeta('twitter:card', 'summary_large_image', true);
    createMeta('twitter:title', PAGE_META.title, true);
    createMeta('twitter:description', PAGE_META.description, true);
    createMeta('twitter:image', PAGE_META.image, true);

    // Update meta description
    let descriptionMeta = document.querySelector('meta[name="description"]') as HTMLMetaElement;
    const originalDescription = descriptionMeta?.content;
    if (descriptionMeta) {
      descriptionMeta.content = PAGE_META.description;
    }

    // Create JSON-LD structured data
    const jsonLd = document.createElement('script');
    jsonLd.type = 'application/ld+json';
    jsonLd.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: PAGE_META.title,
      description: PAGE_META.description,
      url: PAGE_META.url,
      image: PAGE_META.image,
      publisher: {
        '@type': 'Organization',
        name: 'EduFlow',
        logo: {
          '@type': 'ImageObject',
          url: 'https://www.eduflow.mywebz.in/icons/icon-512x512.png'
        }
      },
      mainEntity: {
        '@type': 'SoftwareApplication',
        name: 'EduFlow',
        applicationCategory: 'Education Management Software',
        operatingSystem: 'Web-based',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'INR',
          description: 'Free trial available'
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.8',
          ratingCount: '500',
          bestRating: '5'
        },
        alternateName: ['College ERP', 'School Management Software', 'Education ERP India', 'College Management System', 'Student Information System'],
        featureList: [
          'Student Management System',
          'Faculty Management',
          'Academic Planning & Curriculum Management',
          'Fee Collection & Financial Management',
          'Attendance Tracking System',
          'Library Management System',
          'Hostel Management Software',
          'Transport Management',
          'Exam Management & Result Processing',
          'Placement Management',
          'Event Management',
          'Grievance Handling',
          'Multi-language Support',
          'Mobile Responsive PWA'
        ]
      }
    });
    document.head.appendChild(jsonLd);

    // BreadcrumbList structured data
    const breadcrumbLd = document.createElement('script');
    breadcrumbLd.type = 'application/ld+json';
    breadcrumbLd.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.eduflow.mywebz.in/' },
        { '@type': 'ListItem', position: 2, name: 'Product Tour', item: 'https://www.eduflow.mywebz.in/product-tour' }
      ]
    });
    document.head.appendChild(breadcrumbLd);

    // Cleanup on unmount
    return () => {
      document.title = originalTitle;
      metaTags.forEach(meta => meta.remove());
      jsonLd.remove();
      breadcrumbLd.remove();
      if (descriptionMeta && originalDescription) {
        descriptionMeta.content = originalDescription;
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Skip Link for keyboard navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
      >
        Skip to main content
      </a>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-xs sm:text-sm">
              <ArrowLeft className="mr-1 sm:mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Back to Home</span>
              <span className="sm:hidden">Home</span>
            </Button>
          </div>
          <img 
            src={eduflowLogo} 
            alt="EduFlow - Education Management Platform" 
            loading="eager"
            className="h-12 sm:h-16 md:h-20 w-auto hover:scale-105 transition-all duration-300 cursor-pointer" 
          />
          {/* Desktop buttons */}
          <div className="hidden sm:flex items-center gap-2">
            <InquiryFormDialog title="Book a Demo" description="Schedule a personalized demo with our team to see EduFlow in action.">
              <Button variant="outline" className="border-primary/50 hover:bg-primary/5">
                <CalendarPlus className="mr-2 h-4 w-4" />
                Book Demo
              </Button>
            </InquiryFormDialog>
            <Button onClick={() => navigate('/auth')} className="bg-gradient-to-r from-primary to-secondary hover:opacity-90">
              <LogIn className="mr-2 h-4 w-4" />
              Sign In
            </Button>
          </div>
          {/* Mobile hamburger */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="sm:hidden">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] bg-background">
              <div className="flex flex-col gap-4 mt-8">
                <img src={eduflowLogo} alt="EduFlow" loading="lazy" className="h-14 w-auto mb-4" />
                <InquiryFormDialog title="Book a Demo" description="Schedule a personalized demo with our team to see EduFlow in action.">
                  <Button variant="outline" className="justify-start border-primary/50">
                    <CalendarPlus className="mr-2 h-4 w-4" />
                    Book Demo
                  </Button>
                </InquiryFormDialog>
                <Button onClick={() => { navigate('/auth'); setMobileMenuOpen(false); }} className="bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content">
        {/* 1. Hero Section with 3D Elements */}
        <HeroSection3D />

      {/* 2. Trust Logos Banner */}
      <TrustLogos />

      {/* 3. Problem vs Solution */}
      <ProblemSolutionSection />

      {/* 4. Screenshot Showcase */}
      <ScreenshotShowcase />

      {/* 5. Video Walkthrough */}
      <VideoWalkthrough />

      {/* 6. How It Works - Animated Timeline */}

      {/* 5. How It Works - Animated Timeline */}
      <AnimatedInfographics />

      {/* 6. Interactive Workflow Demo */}
      <div id="workflow-demo">
        <InteractiveWorkflowDemo />
      </div>

      {/* 7. Feature Explorer */}
      <FeatureExplorer />

      {/* 8. ROI Calculator */}
      <ROICalculator />

      {/* 9. Testimonials */}
      <TestimonialCarousel />

      {/* 10. FAQ Section */}
      <FAQSection />

      {/* 11. Final CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="bg-gradient-to-br from-primary via-secondary to-accent text-white border-0 shadow-glow max-w-5xl mx-auto overflow-hidden">
            <CardContent className="p-12 md:p-16">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    Ready to Transform Your Institution?
                  </h2>
                  <p className="text-white/90 mb-6">
                    Join 500+ educational institutions already using EduFlow to streamline 
                    their operations and focus on what matters most - student success.
                  </p>
                  <ul className="space-y-3 mb-8">
                    {[
                      'No setup fees or hidden charges',
                      'Free onboarding and training',
                      '24/7 dedicated support',
                      '30-day money-back guarantee'
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-white" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-col gap-4">
                  <Button 
                    size="lg" 
                    onClick={() => navigate('/auth')}
                    className="bg-white text-primary hover:bg-white/90 shadow-elegant group w-full"
                  >
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <InquiryFormDialog title="Schedule a Demo Call" description="Fill out the form and our team will schedule a personalized demo for your institution.">
                    <Button 
                      size="lg" 
                      variant="outline"
                      className="border-2 border-white text-white hover:bg-white/20 bg-white/10 w-full"
                    >
                      <Calendar className="mr-2 h-5 w-5" />
                      Schedule a Demo Call
                    </Button>
                  </InquiryFormDialog>
                  <p className="text-center text-white/70 text-sm">
                    No credit card required • Setup in 5 minutes
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <img src={eduflowLogo} alt="EduFlow" loading="lazy" className="h-10 w-auto" />
          </div>
          <p>© {new Date().getFullYear()} EduFlow Platform. Built at myweb (<a href="https://www.mywebz.in" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.mywebz.in</a>)</p>
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </div>
      </footer>

      {/* Floating Contact Button */}
      <FloatingContactButton />
    </div>
  );
}
