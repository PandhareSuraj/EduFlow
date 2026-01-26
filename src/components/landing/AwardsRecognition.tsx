import { Award, Star, Trophy, Medal, Newspaper, Tv } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const awards = [
  {
    icon: Trophy,
    title: "Best EdTech Solution 2024",
    organization: "Education Technology Awards",
    year: "2024"
  },
  {
    icon: Award,
    title: "Innovation in Education",
    organization: "India Education Summit",
    year: "2024"
  },
  {
    icon: Medal,
    title: "Top 10 ERP Solutions",
    organization: "EdTech Review",
    year: "2023"
  },
  {
    icon: Star,
    title: "Customer Excellence Award",
    organization: "SaaS India Awards",
    year: "2023"
  }
];

const mediaLogos = [
  { name: "Economic Times", icon: Newspaper },
  { name: "YourStory", icon: Tv },
  { name: "Inc42", icon: Newspaper },
  { name: "TechCircle", icon: Tv },
  { name: "Education World", icon: Newspaper },
  { name: "Entrepreneur India", icon: Tv }
];

export function AwardsRecognition() {
  return (
    <section className="container mx-auto px-4 py-20">
      <div className="text-center mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-warning/10 rounded-full border border-warning/20 mx-auto">
          <Trophy className="h-4 w-4 text-warning" />
          <span className="text-sm font-medium text-warning">Award Winning Platform</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-bold">
          Awards & Recognition
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Recognized by industry leaders for excellence in educational technology
        </p>
      </div>

      {/* Awards Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {awards.map((award, i) => (
          <Card 
            key={i}
            className="group bg-gradient-glass backdrop-blur-sm border-primary/10 hover:border-warning/30 transition-all duration-300 hover:-translate-y-2 hover:shadow-glow"
          >
            <CardContent className="p-6 text-center space-y-4">
              <div className="relative mx-auto w-fit">
                <div className="p-4 bg-gradient-to-br from-warning/20 to-warning/5 rounded-full group-hover:scale-110 transition-transform">
                  <award.icon className="h-8 w-8 text-warning" />
                </div>
                <div className="absolute -top-1 -right-1 bg-warning text-warning-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                  {award.year}
                </div>
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight mb-1">{award.title}</h3>
                <p className="text-sm text-muted-foreground">{award.organization}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Media Mentions */}
      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold text-muted-foreground">As Featured In</h3>
      </div>
      
      <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
        {mediaLogos.map((media, i) => (
          <div 
            key={i}
            className="group flex items-center gap-2 px-6 py-3 bg-muted/50 rounded-lg hover:bg-primary/10 transition-all duration-300 cursor-pointer"
          >
            <media.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
              {media.name}
            </span>
          </div>
        ))}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 pt-8 border-t border-border">
        {[
          { value: "15+", label: "Industry Awards" },
          { value: "50+", label: "Media Features" },
          { value: "4.9/5", label: "Customer Rating" },
          { value: "#1", label: "Rated Edu CRM" }
        ].map((stat, i) => (
          <div key={i} className="text-center">
            <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              {stat.value}
            </div>
            <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
