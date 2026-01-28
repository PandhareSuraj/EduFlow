import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Calendar, LogIn, ArrowLeft, CheckCircle2, CalendarPlus } from 'lucide-react';

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
  description: 'Explore EduFlow\'s comprehensive education management platform. Interactive demos, feature walkthroughs, and ROI calculator to see how we can transform your institution.',
  url: 'https://www.eduflow.mywebz.in/product-tour',
  image: 'https://storage.googleapis.com/gpt-engineer-file-uploads/lAaVSYx4RVVmxIS64ld97TLZWug1/social-images/social-1760781174571-clg crm.JPG',
};

export default function ProductTourPage() {
  const navigate = useNavigate();

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
        featureList: [
          'Student Management',
          'Faculty Management',
          'Academic Planning',
          'Fee Collection',
          'Library Management',
          'Hostel Management',
          'Transport Management',
          'Exam Management'
        ]
      }
    });
    document.head.appendChild(jsonLd);

    // Cleanup on unmount
    return () => {
      document.title = originalTitle;
      metaTags.forEach(meta => meta.remove());
      jsonLd.remove();
      if (descriptionMeta && originalDescription) {
        descriptionMeta.content = originalDescription;
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </div>
          <img 
            src={eduflowLogo} 
            alt="EduFlow" 
            className="h-16 md:h-20 w-auto animate-[fade-in_0.6s_ease-out,scale-in_0.5s_ease-out] hover:scale-110 hover:drop-shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all duration-300 cursor-pointer" 
          />
          <div className="flex items-center gap-2">
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
        </div>
      </header>

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
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="border-2 border-white text-white hover:bg-white/20 bg-white/10 w-full"
                  >
                    <Calendar className="mr-2 h-5 w-5" />
                    Schedule a Demo Call
                  </Button>
                  <p className="text-center text-white/70 text-sm">
                    No credit card required • Setup in 5 minutes
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <img src={eduflowLogo} alt="EduFlow" className="h-6 w-auto" />
          </div>
          <p>© 2025 EduFlow Platform. Built at myweb (<a href="https://www.mywebz.in" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.mywebz.in</a>)</p>
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
