import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, GraduationCap, TrendingUp } from "lucide-react";

export function PlacementDrivesList() {
  const { data: drives } = useQuery({
    queryKey: ["placement-drives"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("placement_drives")
        .select("*, companies(name, logo_url)")
        .order("drive_date", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'ongoing': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isRegistrationOpen = (deadline: string) => {
    return new Date(deadline) > new Date();
  };

  return (
    <div className="space-y-4">
      {drives?.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No placement drives scheduled</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {drives?.map((drive: any) => (
          <Card key={drive.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{(drive as any).drive_name || 'Placement Drive'}</CardTitle>
                  <CardDescription>{drive.companies?.name}</CardDescription>
                </div>
                <Badge className={getStatusColor(drive.status)}>
                  {drive.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{new Date(drive.drive_date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{drive.venue}</span>
                </div>
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{drive.eligible_courses}</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span>Min CGPA: {drive.min_cgpa}</span>
                </div>
              </div>

              {drive.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">{drive.description}</p>
              )}

              <div className="flex items-center justify-between pt-2 border-t">
                <div className="text-sm text-muted-foreground">
                  Registration Deadline: {new Date(drive.registration_deadline).toLocaleDateString()}
                </div>
                {isRegistrationOpen(drive.registration_deadline) && drive.status === 'scheduled' && (
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    Open for Registration
                  </Badge>
                )}
              </div>

              {drive.registered_count !== undefined && (
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4" />
                  <span>{drive.registered_count} students registered</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
