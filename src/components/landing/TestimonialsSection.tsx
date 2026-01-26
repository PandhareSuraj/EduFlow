import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Quote, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const testimonials = [
  {
    quote: "EduFlow transformed our administrative processes. What used to take days now takes hours. The fee collection module alone saved us countless hours of manual work.",
    author: "Dr. Rajesh Kumar",
    role: "Principal",
    institution: "Delhi Public School, Mumbai",
    metrics: "60% reduction in admin work",
    rating: 5
  },
  {
    quote: "The attendance tracking and parent communication features have significantly improved our student engagement. Parents love the real-time updates.",
    author: "Prof. Sunita Sharma",
    role: "Director",
    institution: "St. Xavier's College, Bangalore",
    metrics: "45% increase in parent engagement",
    rating: 5
  },
  {
    quote: "We migrated from three different systems to EduFlow. The unified platform has streamlined everything from admissions to examinations.",
    author: "Mr. Anil Patel",
    role: "Administrator",
    institution: "Gujarat Engineering College",
    metrics: "Saved ₹5L annually in software costs",
    rating: 5
  },
  {
    quote: "The placement module helped us achieve our best placement season ever. Tracking student applications and company interactions is now effortless.",
    author: "Dr. Priya Menon",
    role: "Placement Officer",
    institution: "IIT Training Institute, Chennai",
    metrics: "85% placement rate achieved",
    rating: 5
  }
];

export function TestimonialsSection() {
  const [current, setCurrent] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  const next = () => {
    setIsAutoPlaying(false);
    setCurrent((prev) => (prev + 1) % testimonials.length);
  };

  const prev = () => {
    setIsAutoPlaying(false);
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="container mx-auto px-4 py-20 bg-muted/30">
      <div className="text-center mb-16 space-y-4">
        <p className="text-sm font-medium text-primary uppercase tracking-wider">
          Success Stories
        </p>
        <h2 className="text-3xl md:text-5xl font-bold">
          Trusted by Leading Institutions
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          See how EduFlow is transforming education management across India
        </p>
      </div>

      <div className="max-w-4xl mx-auto relative">
        <Card className="bg-card/50 backdrop-blur-sm border-primary/10 overflow-hidden">
          <CardContent className="p-8 md:p-12">
            <Quote className="h-12 w-12 text-primary/20 mb-6" />
            
            <div className="space-y-6">
              <p className="text-xl md:text-2xl leading-relaxed text-foreground/90">
                "{testimonials[current].quote}"
              </p>

              <div className="flex items-center gap-1">
                {[...Array(testimonials[current].rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 border-t">
                <div>
                  <p className="font-bold text-lg">{testimonials[current].author}</p>
                  <p className="text-muted-foreground">{testimonials[current].role}</p>
                  <p className="text-sm text-primary">{testimonials[current].institution}</p>
                </div>
                <div className="px-4 py-2 bg-primary/10 rounded-full text-primary font-medium text-sm">
                  {testimonials[current].metrics}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <Button variant="outline" size="icon" onClick={prev} className="rounded-full">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          <div className="flex gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => { setIsAutoPlaying(false); setCurrent(i); }}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === current ? "bg-primary w-6" : "bg-primary/30"
                }`}
              />
            ))}
          </div>

          <Button variant="outline" size="icon" onClick={next} className="rounded-full">
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}
