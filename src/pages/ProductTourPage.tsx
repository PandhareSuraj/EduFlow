import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, Play, Calendar, LogIn, ArrowLeft, 
  Sparkles, CheckCircle2
} from 'lucide-react';
import { InteractiveWorkflowDemo } from '@/components/product-tour/InteractiveWorkflowDemo';
import { FeatureExplorer } from '@/components/product-tour/FeatureExplorer';
import { ROICalculator } from '@/components/product-tour/ROICalculator';
import eduflowLogo from '@/assets/eduflow-logo.png';

export default function ProductTourPage() {
  const navigate = useNavigate();

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
          <Button onClick={() => navigate('/auth')} className="bg-gradient-to-r from-primary to-secondary hover:opacity-90">
            <LogIn className="mr-2 h-4 w-4" />
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        {/* Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="container mx-auto px-4 text-center">
          <Badge variant="outline" className="mb-6">
            <Sparkles className="h-3 w-3 mr-1" />
            Interactive Product Tour
          </Badge>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
            Experience{" "}
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              EduFlow
            </span>
            {" "}in Action
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
            Take a guided tour through our powerful education management platform. 
            See how EduFlow transforms institutional operations with intelligent automation.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 shadow-elegant group"
              onClick={() => document.getElementById('workflow-demo')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Play className="mr-2 h-5 w-5" />
              Start Interactive Demo
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/auth')}
              className="border-2 group"
            >
              <Calendar className="mr-2 h-5 w-5" />
              Schedule Live Demo
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto">
            {[
              { value: '15min', label: 'Tour Duration' },
              { value: '9+', label: 'Modules Covered' },
              { value: '50+', label: 'Features Showcased' },
              { value: '100%', label: 'Free Access' }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Workflow Demo */}
      <div id="workflow-demo">
        <InteractiveWorkflowDemo />
      </div>

      {/* Feature Explorer */}
      <FeatureExplorer />

      {/* ROI Calculator */}
      <ROICalculator />

      {/* Final CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="bg-gradient-to-br from-primary via-secondary to-accent text-white border-0 shadow-glow max-w-5xl mx-auto">
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
    </div>
  );
}
