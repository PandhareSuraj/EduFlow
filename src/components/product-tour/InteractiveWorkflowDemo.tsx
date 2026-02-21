import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  UserPlus, ClipboardCheck, BookOpen, BarChart3,
  ArrowRight, ArrowLeft, CheckCircle2, Play, Pause
} from 'lucide-react';
import dashboardPreview from '@/assets/screenshots/dashboard-preview.png';

const workflowSteps = [
  {
    id: 1,
    title: "Student Admission Journey",
    subtitle: "Enquiry to Enrollment",
    icon: UserPlus,
    color: "from-blue-500 to-blue-600",
    description: "Streamline your admission process with a complete digital workflow",
    stages: [
      { name: "Enquiry Received", status: "complete", detail: "Online form submission with auto-verification" },
      { name: "Document Verification", status: "complete", detail: "AI-powered document scanning and validation" },
      { name: "Fee Payment", status: "complete", detail: "Multiple payment gateways with instant receipts" },
      { name: "Enrollment Complete", status: "active", detail: "Auto-generated ID cards and credentials" }
    ],
    metrics: { time: "70%", accuracy: "99.5%", satisfaction: "95%" }
  },
  {
    id: 2,
    title: "Academic Management",
    subtitle: "Courses, Attendance & Exams",
    icon: BookOpen,
    color: "from-green-500 to-green-600",
    description: "Manage your entire academic lifecycle in one unified platform",
    stages: [
      { name: "Course Assignment", status: "complete", detail: "Smart faculty-course mapping with load balancing" },
      { name: "Daily Attendance", status: "complete", detail: "Mobile app with biometric & GPS verification" },
      { name: "Exam Scheduling", status: "active", detail: "Conflict-free scheduling with room optimization" },
      { name: "Result Processing", status: "pending", detail: "Automated grading with analytics" }
    ],
    metrics: { time: "60%", accuracy: "99.8%", satisfaction: "92%" }
  },
  {
    id: 3,
    title: "Financial Operations",
    subtitle: "Fee Collection & Reports",
    icon: ClipboardCheck,
    color: "from-amber-500 to-amber-600",
    description: "Complete financial management with real-time tracking and reporting",
    stages: [
      { name: "Fee Structure Setup", status: "complete", detail: "Flexible fee heads with installment plans" },
      { name: "Payment Collection", status: "complete", detail: "Online/offline payments with SMS alerts" },
      { name: "Receipt Generation", status: "active", detail: "Instant digital receipts with print option" },
      { name: "Financial Reports", status: "pending", detail: "Daily, monthly, yearly analytics" }
    ],
    metrics: { time: "80%", accuracy: "100%", satisfaction: "97%" }
  },
  {
    id: 4,
    title: "Analytics & Insights",
    subtitle: "Data-Driven Decisions",
    icon: BarChart3,
    color: "from-purple-500 to-purple-600",
    description: "Transform your institution with powerful analytics and insights",
    stages: [
      { name: "Data Collection", status: "complete", detail: "Automated data aggregation across modules" },
      { name: "Trend Analysis", status: "complete", detail: "ML-powered pattern recognition" },
      { name: "Report Generation", status: "active", detail: "Custom dashboards and scheduled reports" },
      { name: "Actionable Insights", status: "pending", detail: "AI recommendations for improvement" }
    ],
    metrics: { time: "90%", accuracy: "99%", satisfaction: "94%" }
  }
];

export function InteractiveWorkflowDemo() {
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [autoPlayProgress, setAutoPlayProgress] = useState(0);

  const currentStep = workflowSteps[activeStep];
  const progress = ((activeStep + 1) / workflowSteps.length) * 100;

  // Auto-play functionality with useEffect
  useEffect(() => {
    if (!isPlaying) {
      setAutoPlayProgress(0);
      return;
    }

    // Progress bar animation
    const progressInterval = setInterval(() => {
      setAutoPlayProgress(prev => {
        if (prev >= 100) return 0;
        return prev + 2; // 50 steps over 3 seconds
      });
    }, 60);

    // Step transition every 3 seconds
    const stepInterval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setActiveStep((prev) => (prev + 1) % workflowSteps.length);
        setIsTransitioning(false);
        setAutoPlayProgress(0);
      }, 200);
    }, 3000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
    };
  }, [isPlaying]);

  const changeStep = (newStep: number) => {
    setIsTransitioning(true);
    setIsPlaying(false);
    setTimeout(() => {
      setActiveStep(newStep);
      setIsTransitioning(false);
    }, 200);
  };

  const nextStep = () => changeStep((activeStep + 1) % workflowSteps.length);
  const prevStep = () => changeStep((activeStep - 1 + workflowSteps.length) % workflowSteps.length);

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">Interactive Demo</Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            See EduFlow in Action
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience the seamless workflows that power modern educational institutions
          </p>
        </div>

        {/* Step Navigation */}
        <div className="flex justify-center gap-2 mb-8">
          {workflowSteps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => setActiveStep(index)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                activeStep === index
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              <step.icon className="h-4 w-4" />
              <span className="hidden md:inline text-sm font-medium">{step.title}</span>
            </button>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <span>Step {activeStep + 1} of {workflowSteps.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
        </div>

        {/* Main Content */}
        <Card className="max-w-5xl mx-auto overflow-hidden border-0 shadow-glow relative">
          {/* Auto-play progress bar */}
          {isPlaying && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-muted z-10">
              <div 
                className="h-full bg-primary transition-all duration-100 ease-linear"
                style={{ width: `${autoPlayProgress}%` }}
              />
            </div>
          )}
          
          <div className={`h-2 bg-gradient-to-r ${currentStep.color}`} />
          <CardContent className={`p-8 transition-all duration-300 ${
            isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
          }`}>
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left: Workflow Visualization */}
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-2xl bg-gradient-to-br ${currentStep.color} transition-all duration-500`}>
                    <currentStep.icon className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{currentStep.title}</h3>
                    <p className="text-muted-foreground">{currentStep.subtitle}</p>
                  </div>
                </div>

                <p className="text-lg">{currentStep.description}</p>

                {/* Stages with staggered animation */}
                <div className="space-y-4">
                  {currentStep.stages.map((stage, index) => (
                    <div
                      key={index}
                      className={`flex items-start gap-4 p-4 rounded-xl transition-all duration-300 animate-fade-in ${
                        stage.status === 'active'
                          ? 'bg-primary/10 border-2 border-primary shadow-lg'
                          : stage.status === 'complete'
                          ? 'bg-muted'
                          : 'bg-muted/50 opacity-60'
                      }`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                        stage.status === 'complete'
                          ? 'bg-green-500 text-white'
                          : stage.status === 'active'
                          ? 'bg-primary text-primary-foreground animate-pulse ring-4 ring-primary/30'
                          : 'bg-muted-foreground/30 text-muted-foreground'
                      }`}>
                        {stage.status === 'complete' ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          <span className="text-sm font-bold">{index + 1}</span>
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold">{stage.name}</h4>
                        <p className="text-sm text-muted-foreground">{stage.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Metrics & Actions */}
              <div className="space-y-6">
                <Card className="bg-gradient-to-br from-primary/5 to-secondary/5">
                  <CardContent className="p-6">
                    <h4 className="font-semibold mb-4">Key Improvements</h4>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm">Time Saved</span>
                          <span className="font-bold text-primary">{currentStep.metrics.time}</span>
                        </div>
                        <Progress value={parseInt(currentStep.metrics.time)} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm">Accuracy Rate</span>
                          <span className="font-bold text-green-500">{currentStep.metrics.accuracy}</span>
                        </div>
                        <Progress value={parseFloat(currentStep.metrics.accuracy)} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm">User Satisfaction</span>
                          <span className="font-bold text-amber-500">{currentStep.metrics.satisfaction}</span>
                        </div>
                        <Progress value={parseInt(currentStep.metrics.satisfaction)} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Mock Interface Preview */}
                <Card className="overflow-hidden">
                  <div className="bg-muted p-2 flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-amber-400" />
                      <div className="w-3 h-3 rounded-full bg-green-400" />
                    </div>
                    <span className="text-xs text-muted-foreground ml-2">EduFlow Dashboard</span>
                  </div>
                  <CardContent className="p-0 bg-card">
                    <img 
                      src={dashboardPreview} 
                      alt="EduFlow Dashboard Preview" 
                      className="w-full h-auto object-cover"
                      loading="lazy"
                    />
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t">
              <Button variant="outline" onClick={prevStep}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="ghost"
                onClick={() => setIsPlaying(!isPlaying)}
                className="gap-2"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isPlaying ? 'Pause' : 'Auto-play'}
              </Button>
              <Button onClick={nextStep}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
