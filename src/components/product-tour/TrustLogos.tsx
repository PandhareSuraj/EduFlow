import { Building2 } from 'lucide-react';

// Mock institution logos - in production these would be real logos
const institutions = [
  'KK Patil College',
  'St. Mary\'s University',
  'National Institute of Technology',
  'Delhi Public School',
  'Christ University',
  'Manipal Academy',
  'Amity University',
  'VIT Vellore',
  'BITS Pilani',
  'IIM Bangalore',
  'Symbiosis International',
  'Lovely Professional University'
];

export function TrustLogos() {
  return (
    <section className="py-12 border-y bg-muted/30 overflow-hidden">
      <div className="container mx-auto px-4 mb-8">
        <p className="text-center text-muted-foreground">
          Trusted by <span className="text-primary font-semibold">500+</span> leading educational institutions across India
        </p>
      </div>
      
      {/* Infinite Scroll Container */}
      <div className="relative">
        <div className="flex animate-scroll-x">
          {/* First set */}
          {institutions.map((name, i) => (
            <div 
              key={`first-${i}`}
              className="flex-shrink-0 mx-8 flex items-center gap-3 px-6 py-3 bg-card rounded-lg border opacity-70 hover:opacity-100 transition-opacity"
            >
              <Building2 className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium whitespace-nowrap">{name}</span>
            </div>
          ))}
          {/* Duplicate for seamless loop */}
          {institutions.map((name, i) => (
            <div 
              key={`second-${i}`}
              className="flex-shrink-0 mx-8 flex items-center gap-3 px-6 py-3 bg-card rounded-lg border opacity-70 hover:opacity-100 transition-opacity"
            >
              <Building2 className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium whitespace-nowrap">{name}</span>
            </div>
          ))}
        </div>
        
        {/* Gradient Masks */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />
      </div>
    </section>
  );
}
