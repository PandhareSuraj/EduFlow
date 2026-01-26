import { Settings, Upload, Rocket, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: Settings,
    title: "Sign Up & Configure",
    description: "Create your account, add your institution details, and customize settings to match your workflow.",
    step: "01"
  },
  {
    icon: Upload,
    title: "Import Your Data",
    description: "Easily migrate existing student, faculty, and academic data using our Excel import tools.",
    step: "02"
  },
  {
    icon: Rocket,
    title: "Go Live in 24 Hours",
    description: "Start managing your institution digitally with full support from our onboarding team.",
    step: "03"
  }
];

export function HowItWorks() {
  return (
    <section className="container mx-auto px-4 py-20">
      <div className="text-center mb-16 space-y-4">
        <p className="text-sm font-medium text-primary uppercase tracking-wider">
          Simple Onboarding
        </p>
        <h2 className="text-3xl md:text-5xl font-bold">
          Get Started in 3 Easy Steps
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          From signup to going live, we make the transition seamless
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 relative">
        {/* Connection Lines - Desktop Only */}
        <div className="hidden md:block absolute top-24 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-primary via-secondary to-accent"></div>

        {steps.map((step, i) => (
          <div key={i} className="relative group">
            <div className="text-center space-y-6">
              {/* Step Number */}
              <div className="relative inline-block">
                <div className="absolute -top-2 -right-2 text-5xl font-bold text-primary/10 group-hover:text-primary/20 transition-colors">
                  {step.step}
                </div>
                <div className="relative p-6 bg-gradient-to-br from-primary to-secondary rounded-2xl w-fit mx-auto group-hover:scale-110 transition-transform shadow-glow">
                  <step.icon className="h-10 w-10 text-white" />
                </div>
              </div>

              {/* Content */}
              <div className="space-y-3">
                <h3 className="text-xl font-bold">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>

            {/* Arrow - Mobile Only */}
            {i < steps.length - 1 && (
              <div className="md:hidden flex justify-center my-6">
                <ArrowRight className="h-6 w-6 text-primary rotate-90" />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
