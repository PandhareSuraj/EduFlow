import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, CheckCircle2, Clock, Users, Award } from 'lucide-react';
import { EDUFLOW_INTRO_VIDEO_ID } from '@/utils/youtubeUtils';

export function VideoWalkthrough() {
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Using centralized EduFlow intro video ID
  const videoId = EDUFLOW_INTRO_VIDEO_ID;

  const videoHighlights = [
    { icon: Clock, text: '5 minute overview', color: 'text-blue-500' },
    { icon: Users, text: 'Real institution demo', color: 'text-green-500' },
    { icon: Award, text: 'All features covered', color: 'text-purple-500' },
  ];

  const chapters = [
    { time: '0:00', title: 'Dashboard Overview', description: 'Navigate the intuitive main dashboard' },
    { time: '1:15', title: 'Student Management', description: 'Enroll and manage student records' },
    { time: '2:30', title: 'Fee Collection', description: 'Streamlined payment processing' },
    { time: '3:45', title: 'Attendance & Exams', description: 'Track attendance and manage examinations' },
    { time: '4:30', title: 'Reports & Analytics', description: 'Generate insights and reports' },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Play className="h-4 w-4" />
            Video Walkthrough
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            See EduFlow in Action
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Watch how EduFlow transforms institutional management with this comprehensive 
            walkthrough of our key features
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Video Player */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden border-0 shadow-elegant bg-card">
              <CardContent className="p-0">
                {/* Video Container with 16:9 Aspect Ratio */}
                <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-secondary/20">
                  {!isPlaying ? (
                    /* Thumbnail with Play Button */
                    <div className="absolute inset-0 flex items-center justify-center">
                      {/* Background Pattern */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
                      
                      {/* Mock Dashboard Preview */}
                      <div className="absolute inset-4 bg-background/90 rounded-lg shadow-lg overflow-hidden">
                        <div className="h-8 bg-muted flex items-center px-3 gap-2">
                          <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                            <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                          </div>
                          <div className="text-xs text-muted-foreground">EduFlow Demo</div>
                        </div>
                        <div className="p-4 grid grid-cols-3 gap-3">
                          <div className="col-span-2 h-20 bg-primary/10 rounded animate-pulse" />
                          <div className="h-20 bg-secondary/10 rounded animate-pulse" />
                          <div className="h-16 bg-muted rounded animate-pulse" />
                          <div className="h-16 bg-muted rounded animate-pulse" />
                          <div className="h-16 bg-muted rounded animate-pulse" />
                        </div>
                      </div>

                      {/* Play Button Overlay */}
                      <Button
                        size="lg"
                        onClick={() => setIsPlaying(true)}
                        className="absolute z-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full w-20 h-20 shadow-glow group"
                      >
                        <Play className="h-8 w-8 ml-1 group-hover:scale-110 transition-transform" fill="currentColor" />
                      </Button>

                      {/* Duration Badge */}
                      <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded text-sm font-medium">
                        5:00
                      </div>
                    </div>
                  ) : (
                    /* Embedded YouTube Video */
                    <iframe
                      src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
                      title="EduFlow Demo Video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full"
                    />
                  )}
                </div>

                {/* Video Info Bar */}
                <div className="p-4 bg-muted/30 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-6">
                    {videoHighlights.map((highlight, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <highlight.icon className={`h-4 w-4 ${highlight.color}`} />
                        <span className="text-muted-foreground">{highlight.text}</span>
                      </div>
                    ))}
                  </div>
                  {!isPlaying && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setIsPlaying(true)}
                      className="text-primary"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Watch Now
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Video Chapters */}
          <div className="lg:col-span-1">
            <Card className="h-full border-0 shadow-elegant">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Video Chapters
                </h3>
                <div className="space-y-3">
                  {chapters.map((chapter, i) => (
                    <button
                      key={i}
                      onClick={() => setIsPlaying(true)}
                      className="w-full text-left p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-1 rounded shrink-0">
                          {chapter.time}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm group-hover:text-primary transition-colors">
                            {chapter.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">
                            {chapter.description}
                          </p>
                        </div>
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground/30 shrink-0 mt-1" />
                      </div>
                    </button>
                  ))}
                </div>

                {/* CTA */}
                <div className="mt-6 pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-3">
                    Want a personalized demo for your institution?
                  </p>
                  <Button variant="outline" className="w-full" size="sm">
                    Schedule Live Demo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Key Takeaways */}
        <div className="mt-12 grid md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {[
            { label: 'Setup Time', value: '< 5 mins', icon: Clock },
            { label: 'Training Required', value: 'None', icon: Users },
            { label: 'Data Migration', value: 'Included', icon: CheckCircle2 },
            { label: 'Support', value: '24/7', icon: Award },
          ].map((item, i) => (
            <Card key={i} className="border-0 bg-muted/30">
              <CardContent className="p-4 text-center">
                <item.icon className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-lg font-bold">{item.value}</p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
