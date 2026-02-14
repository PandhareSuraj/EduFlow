import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Calendar, Sparkles, Users, Building2, Award, Clock, Video } from 'lucide-react';
import { useState, useEffect } from 'react';
import { IntroVideoDialog } from '@/components/videos/IntroVideoDialog';
import { InquiryFormDialog } from '@/components/lead-generation';
const stats = [
  { icon: Building2, value: 500, suffix: '+', label: 'Institutions' },
  { icon: Users, value: 50000, suffix: '+', label: 'Students Managed' },
  { icon: Award, value: 99.9, suffix: '%', label: 'Uptime' },
  { icon: Clock, value: 24, suffix: '/7', label: 'Support' }
];

function AnimatedCounter({ value, suffix, duration = 2000 }: { value: number; suffix: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (hasAnimated) return;
    
    const startTime = Date.now();
    const endValue = value;
    
    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      setCount(Math.floor(endValue * easeOut));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setHasAnimated(true);
      }
    };
    
    const timer = setTimeout(() => {
      requestAnimationFrame(animate);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [value, duration, hasAnimated]);

  return (
    <span>
      {count.toLocaleString()}{suffix}
    </span>
  );
}

export function HeroSection3D() {
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  return (
    <section className="relative overflow-hidden py-20 md:py-32 min-h-[90vh] flex items-center">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/30 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary/5 to-transparent rounded-full" />
        
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text Content */}
          <div className="text-center lg:text-left">
            <Badge variant="outline" className="mb-6 animate-fade-in">
              <Sparkles className="h-3 w-3 mr-1" />
              Interactive Product Tour
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-slide-up-fade">
              Transform Your{" "}
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Institution
              </span>
              {" "}with EduFlow
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 animate-slide-up-fade" style={{ animationDelay: '0.1s' }}>
              Experience the complete education management platform that powers 500+ institutions. 
              See live workflows, real screenshots, and calculate your ROI.
            </p>

            <div className="flex flex-wrap gap-4 justify-center lg:justify-start animate-slide-up-fade" style={{ animationDelay: '0.2s' }}>
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 shadow-lg group"
                onClick={() => document.getElementById('workflow-demo')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                Start Interactive Demo
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => setVideoModalOpen(true)}
                className="border-2 group"
              >
                <Video className="mr-2 h-5 w-5" />
                Watch Video
              </Button>
              <InquiryFormDialog title="Schedule a Live Demo" description="Get a personalized walkthrough of EduFlow for your institution.">
                <Button 
                  size="lg" 
                  variant="ghost"
                  className="group"
                >
                  <Calendar className="mr-2 h-5 w-5" />
                  Schedule Live Demo
                </Button>
              </InquiryFormDialog>
            </div>
          </div>

          {/* Right: 3D Floating Device Mockups */}
          <div className="relative h-[400px] md:h-[500px] hidden lg:block">
            {/* Main Laptop Mockup */}
            <div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] animate-float"
              style={{ perspective: '1000px' }}
            >
              <div 
                className="relative rounded-xl border-4 border-foreground/10 shadow-2xl overflow-hidden bg-card"
                style={{ transform: 'rotateY(-5deg) rotateX(5deg)' }}
              >
                {/* Browser Chrome */}
                <div className="bg-muted p-2 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 text-center">
                    <span className="text-xs text-muted-foreground">EduFlow Dashboard</span>
                  </div>
                </div>
                
                {/* Dashboard Preview */}
                <div className="p-4 bg-background space-y-3">
                  <div className="flex gap-2">
                    <div className="h-8 w-24 bg-primary/20 rounded animate-pulse" />
                    <div className="h-8 flex-1 bg-muted rounded" />
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary/50" />
                    </div>
                    <div className="h-16 bg-secondary/10 rounded-lg flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-secondary/50" />
                    </div>
                    <div className="h-16 bg-accent/10 rounded-lg flex items-center justify-center">
                      <Award className="h-6 w-6 text-accent/50" />
                    </div>
                    <div className="h-16 bg-success/10 rounded-lg flex items-center justify-center">
                      <Clock className="h-6 w-6 text-success/50" />
                    </div>
                  </div>
                  <div className="h-24 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg" />
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-12 bg-muted rounded" />
                    <div className="h-12 bg-muted rounded" />
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Cards */}
            <div className="absolute top-10 right-0 w-40 p-3 bg-card rounded-xl shadow-lg border animate-float-slow">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                  <Users className="h-4 w-4 text-green-500" />
                </div>
                <span className="text-xs font-medium">New Admission</span>
              </div>
              <div className="text-lg font-bold">+12 Today</div>
            </div>

            <div className="absolute bottom-10 left-0 w-44 p-3 bg-card rounded-xl shadow-lg border animate-float-delayed">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                  <Award className="h-4 w-4 text-primary" />
                </div>
                <span className="text-xs font-medium">Fee Collected</span>
              </div>
              <div className="text-lg font-bold text-primary">₹2.5L</div>
            </div>
          </div>
        </div>

        {/* Animated Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto">
          {stats.map((stat, i) => (
            <div 
              key={i} 
              className="text-center p-6 rounded-2xl bg-card/50 backdrop-blur border animate-pop-in"
              style={{ animationDelay: `${0.3 + i * 0.1}s` }}
            >
              <stat.icon className="h-8 w-8 mx-auto mb-3 text-primary" />
              <div className="text-3xl font-bold text-primary">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Intro Video Modal */}
      <IntroVideoDialog open={videoModalOpen} onOpenChange={setVideoModalOpen} />
    </section>
  );
}
