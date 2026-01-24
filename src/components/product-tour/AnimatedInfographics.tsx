import { useState, useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  UserPlus, Upload, Settings, Rocket,
  Users, BookOpen, DollarSign, BarChart3,
  CheckCircle2
} from 'lucide-react';

const processSteps = [
  { 
    number: 1, 
    icon: UserPlus, 
    title: 'Sign Up', 
    description: 'Create your institution account in 2 minutes',
    color: 'from-blue-500 to-blue-600'
  },
  { 
    number: 2, 
    icon: Upload, 
    title: 'Import Data', 
    description: 'Bulk upload students, faculty via Excel',
    color: 'from-green-500 to-green-600'
  },
  { 
    number: 3, 
    icon: Settings, 
    title: 'Configure', 
    description: 'Set up courses, fees, and workflows',
    color: 'from-amber-500 to-amber-600'
  },
  { 
    number: 4, 
    icon: Rocket, 
    title: 'Go Live!', 
    description: 'Start managing your institution',
    color: 'from-purple-500 to-purple-600'
  }
];

const moduleStats = [
  { icon: Users, label: 'Students', value: 100, color: 'bg-blue-500' },
  { icon: BookOpen, label: 'Academics', value: 100, color: 'bg-green-500' },
  { icon: DollarSign, label: 'Finance', value: 100, color: 'bg-amber-500' },
  { icon: BarChart3, label: 'Analytics', value: 100, color: 'bg-purple-500' }
];

function AnimatedProgressBar({ value, color, delay }: { value: number; color: string; delay: number }) {
  const [width, setWidth] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setWidth(value), delay);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [value, delay]);

  return (
    <div ref={ref} className="h-3 bg-muted rounded-full overflow-hidden">
      <div 
        className={`h-full ${color} transition-all duration-1000 ease-out rounded-full`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

export function AnimatedInfographics() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep(prev => (prev + 1) % processSteps.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">How It Works</Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Up & Running in 4 Simple Steps
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get started with EduFlow in minutes, not months
          </p>
        </div>

        {/* Animated Timeline */}
        <div className="max-w-5xl mx-auto mb-20">
          <div className="relative">
            {/* Connection Line */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-muted -translate-y-1/2 z-0">
              <div 
                className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                style={{ width: `${((activeStep + 1) / processSteps.length) * 100}%` }}
              />
            </div>

            {/* Steps */}
            <div className="grid md:grid-cols-4 gap-8 relative z-10">
              {processSteps.map((step, index) => (
                <div 
                  key={step.number}
                  className={`text-center transition-all duration-500 ${
                    index <= activeStep ? 'opacity-100 scale-100' : 'opacity-50 scale-95'
                  }`}
                >
                  <div 
                    className={`w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg transition-all duration-300 ${
                      index === activeStep ? 'ring-4 ring-primary/30 scale-110' : ''
                    }`}
                  >
                    {index < activeStep ? (
                      <CheckCircle2 className="h-10 w-10 text-white" />
                    ) : (
                      <step.icon className="h-10 w-10 text-white" />
                    )}
                  </div>
                  <div className="bg-card rounded-xl p-4 shadow-sm border">
                    <div className="text-sm font-bold text-primary mb-1">Step {step.number}</div>
                    <h4 className="font-bold mb-1">{step.title}</h4>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Module Coverage */}
        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">Complete Module Coverage</h3>
              <p className="text-muted-foreground">All features included in every plan - no hidden modules</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {moduleStats.map((stat, index) => (
                <div key={stat.label} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg ${stat.color} flex items-center justify-center`}>
                        <stat.icon className="h-4 w-4 text-white" />
                      </div>
                      <span className="font-medium">{stat.label}</span>
                    </div>
                    <span className="text-sm font-bold text-primary">{stat.value}%</span>
                  </div>
                  <AnimatedProgressBar value={stat.value} color={stat.color} delay={index * 200} />
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 bg-primary/5 rounded-xl text-center">
              <p className="text-sm text-muted-foreground">
                <span className="font-bold text-primary">100% Feature Access</span> - Every module, every feature, available from day one
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
