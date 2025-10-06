import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Calendar, TrendingUp, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function PlacementsList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: placements } = useQuery({
    queryKey: ["student-placements", statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("student_placements")
        .select(`
          *,
          students(id, name, email, courses(name)),
          job_postings(title, companies(name))
        `)
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const filteredPlacements = placements?.filter(placement =>
    placement.students?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    placement.position_title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'offer_extended': return 'bg-blue-100 text-blue-800';
      case 'offer_accepted': return 'bg-green-100 text-green-800';
      case 'joined': return 'bg-purple-100 text-purple-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <Input
          placeholder="Search by student or position..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="offer_extended">Offer Extended</SelectItem>
            <SelectItem value="offer_accepted">Offer Accepted</SelectItem>
            <SelectItem value="joined">Joined</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredPlacements?.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No placements found</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {filteredPlacements?.map((placement: any) => (
          <Card key={placement.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{placement.students?.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{placement.students?.courses?.name}</p>
                </div>
                <Badge className={getStatusColor(placement.status)}>
                  {placement.status.replace('_', ' ')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{placement.position_title}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>at {placement.job_postings?.companies?.name}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span>₹{placement.package_amount} LPA</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{new Date(placement.joining_date).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="pt-2 border-t">
                <Badge variant="outline">{placement.placement_type}</Badge>
              </div>

              {placement.offer_letter_url && (
                <Button size="sm" variant="outline" className="w-full" asChild>
                  <a href={placement.offer_letter_url} target="_blank" rel="noopener noreferrer">
                    View Offer Letter
                  </a>
                </Button>
              )}

              <p className="text-xs text-muted-foreground">
                Placed on {new Date(placement.created_at).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
