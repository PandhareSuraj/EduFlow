import { 
  FileText, Clock, AlertTriangle, Search, 
  Smartphone, Fingerprint, CreditCard, Zap,
  X, Check, ArrowRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const painPoints = [
  { icon: FileText, text: 'Paper-based admission forms', detail: 'Prone to errors, lost documents' },
  { icon: Clock, text: 'Hours spent on attendance', detail: 'Manual registers, calculation errors' },
  { icon: AlertTriangle, text: 'Fee collection chaos', detail: 'Missed payments, wrong receipts' },
  { icon: Search, text: 'Finding student records', detail: 'Searching through files for hours' }
];

const solutions = [
  { icon: Smartphone, text: 'Digital admissions', metric: '95% faster', detail: 'Online forms with auto-verification' },
  { icon: Fingerprint, text: 'One-tap attendance', metric: '100% accurate', detail: 'Biometric & mobile marking' },
  { icon: CreditCard, text: 'Instant payments', metric: 'Zero errors', detail: 'Multiple gateways, auto receipts' },
  { icon: Zap, text: 'Instant search', metric: '<1 second', detail: 'Find any record instantly' }
];

export function ProblemSolutionSection() {
  return (
    <section className="py-20 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">The Transformation</Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            From Chaos to Clarity
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            See how EduFlow transforms institutional operations
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-0 rounded-3xl overflow-hidden shadow-2xl max-w-6xl mx-auto">
          {/* BEFORE Section */}
          <div className="bg-gradient-to-br from-destructive/90 to-destructive p-8 md:p-12 text-destructive-foreground relative">
            <div className="absolute top-4 right-4 opacity-10">
              <X className="h-32 w-32" />
            </div>
            
            <Badge className="bg-destructive-foreground/20 text-destructive-foreground mb-6">
              Before EduFlow
            </Badge>
            
            <h3 className="text-2xl md:text-3xl font-bold mb-2">
              Manual, Error-Prone
            </h3>
            <p className="text-destructive-foreground/80 mb-8">
              Outdated processes holding your institution back
            </p>
            
            <div className="space-y-4">
              {painPoints.map((point, i) => (
                <div 
                  key={i}
                  className="flex items-start gap-4 p-4 rounded-xl bg-destructive-foreground/10 backdrop-blur animate-slide-up-fade"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-destructive-foreground/20 flex items-center justify-center">
                    <point.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold flex items-center gap-2">
                      <X className="h-4 w-4 text-destructive-foreground/70" />
                      {point.text}
                    </div>
                    <p className="text-sm text-destructive-foreground/70">{point.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AFTER Section */}
          <div className="bg-gradient-to-br from-success to-success/90 p-8 md:p-12 text-success-foreground relative">
            <div className="absolute top-4 right-4 opacity-10">
              <Check className="h-32 w-32" />
            </div>
            
            <Badge className="bg-success-foreground/20 text-success-foreground mb-6">
              With EduFlow
            </Badge>
            
            <h3 className="text-2xl md:text-3xl font-bold mb-2">
              Automated, Accurate
            </h3>
            <p className="text-success-foreground/80 mb-8">
              Modern systems for modern institutions
            </p>
            
            <div className="space-y-4">
              {solutions.map((solution, i) => (
                <div 
                  key={i}
                  className="flex items-start gap-4 p-4 rounded-xl bg-success-foreground/10 backdrop-blur animate-slide-up-fade"
                  style={{ animationDelay: `${0.2 + i * 0.1}s` }}
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-success-foreground/20 flex items-center justify-center">
                    <solution.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Check className="h-4 w-4" />
                        {solution.text}
                      </span>
                      <Badge className="bg-success-foreground text-success text-xs">
                        {solution.metric}
                      </Badge>
                    </div>
                    <p className="text-sm text-success-foreground/70">{solution.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Transformation Arrow (Mobile) */}
        <div className="flex justify-center -mt-4 lg:hidden">
          <div className="bg-primary text-primary-foreground p-3 rounded-full shadow-lg">
            <ArrowRight className="h-6 w-6 rotate-90" />
          </div>
        </div>
      </div>
    </section>
  );
}
