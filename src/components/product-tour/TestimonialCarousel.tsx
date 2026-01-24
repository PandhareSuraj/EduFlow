import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const testimonials = [
  {
    quote: "EduFlow transformed our admission process. What used to take weeks now happens in days. Our staff can finally focus on students instead of paperwork.",
    author: "Dr. Rajesh Kumar",
    role: "Principal",
    institution: "KK Patil College of Nursing",
    rating: 5,
    metric: "70% time saved in admissions"
  },
  {
    quote: "The fee management module alone saved us lakhs in collection errors. Real-time tracking means we never miss a payment anymore.",
    author: "Mrs. Sunita Deshpande",
    role: "Administrative Head",
    institution: "St. Mary's Higher Secondary",
    rating: 5,
    metric: "₹15L saved in first year"
  },
  {
    quote: "Finally, a system that actually works for Indian institutions. The support team understands our unique challenges and delivers solutions that make sense.",
    author: "Prof. Amit Sharma",
    role: "Director",
    institution: "National Institute of Technology",
    rating: 5,
    metric: "99.9% system uptime"
  },
  {
    quote: "From attendance to results, everything is now digitized. Parents love the transparency and we love the efficiency. Best decision we made.",
    author: "Dr. Priya Menon",
    role: "Vice Principal",
    institution: "Delhi Public School",
    rating: 5,
    metric: "4.8/5 parent satisfaction"
  }
];

export function TestimonialCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goTo = (index: number) => {
    setActiveIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const prev = () => goTo((activeIndex - 1 + testimonials.length) % testimonials.length);
  const next = () => goTo((activeIndex + 1) % testimonials.length);

  return (
    <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            <Star className="h-3 w-3 mr-1 fill-primary text-primary" />
            Customer Stories
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Loved by 500+ Institutions
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            See what educators across India are saying about EduFlow
          </p>
        </div>

        <div className="max-w-4xl mx-auto relative">
          {/* Main Testimonial Card */}
          <Card className="border-0 shadow-2xl overflow-hidden">
            <CardContent className="p-0">
              <div className="grid md:grid-cols-5">
                {/* Quote Section */}
                <div className="md:col-span-3 p-8 md:p-12 relative">
                  <Quote className="absolute top-6 left-6 h-12 w-12 text-primary/10" />
                  
                  <div className="relative z-10">
                    {/* Rating */}
                    <div className="flex gap-1 mb-6">
                      {[...Array(testimonials[activeIndex].rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                      ))}
                    </div>

                    {/* Quote */}
                    <blockquote className="text-lg md:text-xl mb-8 leading-relaxed">
                      "{testimonials[activeIndex].quote}"
                    </blockquote>

                    {/* Author */}
                    <div>
                      <div className="font-bold text-lg">{testimonials[activeIndex].author}</div>
                      <div className="text-muted-foreground">{testimonials[activeIndex].role}</div>
                      <div className="text-primary font-medium">{testimonials[activeIndex].institution}</div>
                    </div>
                  </div>
                </div>

                {/* Metric Section */}
                <div className="md:col-span-2 bg-gradient-to-br from-primary to-secondary p-8 md:p-12 flex flex-col justify-center text-primary-foreground">
                  <div className="text-center">
                    <div className="text-sm uppercase tracking-wider mb-2 opacity-80">Key Result</div>
                    <div className="text-2xl md:text-3xl font-bold">
                      {testimonials[activeIndex].metric}
                    </div>
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
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goTo(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    index === activeIndex 
                      ? 'bg-primary w-8' 
                      : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  }`}
                />
              ))}
            </div>

            <Button variant="outline" size="icon" onClick={next} className="rounded-full">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
