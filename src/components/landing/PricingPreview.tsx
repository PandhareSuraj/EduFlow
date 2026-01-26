import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Sparkles, Building2, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";

const plans = [
  {
    name: "Starter",
    icon: Sparkles,
    price: "₹15,000",
    period: "/year",
    description: "Perfect for small institutions just getting started",
    features: [
      "Up to 500 students",
      "Basic attendance tracking",
      "Fee management",
      "Student & faculty profiles",
      "Email support",
      "Basic reports"
    ],
    popular: false,
    cta: "Start Free Trial"
  },
  {
    name: "Professional",
    icon: Building2,
    price: "₹45,000",
    period: "/year",
    description: "Ideal for growing institutions with advanced needs",
    features: [
      "Up to 2,000 students",
      "All Starter features",
      "Exam management",
      "Library management",
      "SMS notifications",
      "Advanced analytics",
      "Priority support",
      "Custom branding"
    ],
    popular: true,
    cta: "Start Free Trial"
  },
  {
    name: "Enterprise",
    icon: Crown,
    price: "Custom",
    period: "",
    description: "For large institutions requiring full customization",
    features: [
      "Unlimited students",
      "All Professional features",
      "Multi-campus support",
      "Hostel & transport",
      "Placement module",
      "API access",
      "Dedicated account manager",
      "On-premise option available"
    ],
    popular: false,
    cta: "Contact Sales"
  }
];

export function PricingPreview() {
  const navigate = useNavigate();

  return (
    <section className="container mx-auto px-4 py-20">
      <div className="text-center mb-16 space-y-4">
        <p className="text-sm font-medium text-primary uppercase tracking-wider">
          Simple Pricing
        </p>
        <h2 className="text-3xl md:text-5xl font-bold">
          Plans That Grow with You
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Start free, upgrade when you need. No hidden fees, cancel anytime.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan, i) => (
          <Card 
            key={i} 
            className={`relative bg-card/50 backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 ${
              plan.popular 
                ? "border-primary shadow-glow scale-105 md:scale-110" 
                : "border-primary/10 hover:border-primary/30"
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-primary to-secondary text-white text-sm font-medium rounded-full">
                Most Popular
              </div>
            )}

            <CardHeader className="text-center pb-2">
              <div className={`p-3 rounded-xl w-fit mx-auto mb-4 ${
                plan.popular 
                  ? "bg-gradient-to-br from-primary to-secondary" 
                  : "bg-primary/10"
              }`}>
                <plan.icon className={`h-8 w-8 ${plan.popular ? "text-white" : "text-primary"}`} />
              </div>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription className="text-base">{plan.description}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="text-center">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>

              <ul className="space-y-3">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button 
                onClick={() => navigate('/auth')}
                className={`w-full ${
                  plan.popular 
                    ? "bg-gradient-to-r from-primary to-secondary hover:opacity-90" 
                    : ""
                }`}
                variant={plan.popular ? "default" : "outline"}
              >
                {plan.cta}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-center text-muted-foreground mt-8">
        All plans include 14-day free trial. No credit card required.
      </p>
    </section>
  );
}
