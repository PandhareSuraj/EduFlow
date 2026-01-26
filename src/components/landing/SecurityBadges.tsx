import { Shield, Lock, Server, CheckCircle, Globe, FileCheck } from "lucide-react";

const securityFeatures = [
  {
    icon: Lock,
    title: "256-bit SSL Encryption",
    desc: "All data transmitted is encrypted end-to-end"
  },
  {
    icon: Server,
    title: "Data Center in India",
    desc: "Your data stays within Indian borders"
  },
  {
    icon: Shield,
    title: "SOC 2 Compliant",
    desc: "Enterprise-grade security controls"
  },
  {
    icon: FileCheck,
    title: "GDPR Ready",
    desc: "Full compliance with data protection laws"
  },
  {
    icon: Globe,
    title: "99.9% Uptime SLA",
    desc: "Guaranteed availability with redundancy"
  },
  {
    icon: CheckCircle,
    title: "Daily Backups",
    desc: "Automated backups with instant recovery"
  }
];

const certifications = [
  { name: "ISO 27001", icon: "🏅" },
  { name: "SSL Secured", icon: "🔒" },
  { name: "GDPR", icon: "🇪🇺" },
  { name: "Made in India", icon: "🇮🇳" },
];

export function SecurityBadges() {
  return (
    <section className="container mx-auto px-4 py-20">
      <div className="text-center mb-16 space-y-4">
        <p className="text-sm font-medium text-primary uppercase tracking-wider">
          Security First
        </p>
        <h2 className="text-3xl md:text-5xl font-bold">
          Your Data is Safe with Us
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Enterprise-grade security protecting sensitive student and institutional data
        </p>
      </div>

      {/* Security Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {securityFeatures.map((feature, i) => (
          <div 
            key={i} 
            className="flex gap-4 p-6 bg-card/50 backdrop-blur-sm rounded-xl border border-primary/10 hover:border-primary/30 transition-colors group"
          >
            <div className="p-3 bg-gradient-to-br from-primary to-secondary rounded-xl h-fit group-hover:scale-110 transition-transform">
              <feature.icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Certification Badges */}
      <div className="flex flex-wrap justify-center gap-6">
        {certifications.map((cert, i) => (
          <div 
            key={i}
            className="flex items-center gap-3 px-6 py-3 bg-muted/50 rounded-full border border-primary/10 hover:border-primary/30 transition-colors"
          >
            <span className="text-2xl">{cert.icon}</span>
            <span className="font-medium">{cert.name}</span>
          </div>
        ))}
      </div>

      {/* Trust Statement */}
      <div className="mt-12 text-center">
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Trusted by 500+ educational institutions across India. 
          All data is stored in secure Indian data centers with regular third-party security audits.
        </p>
      </div>
    </section>
  );
}
