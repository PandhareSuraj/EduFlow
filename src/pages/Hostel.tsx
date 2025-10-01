import { useState } from "react";
import { Plus, Building2, Users, AlertCircle, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddHostelAllocationDialog } from "@/components/forms/AddHostelAllocationDialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const Hostel = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [showAllocationDialog, setShowAllocationDialog] = useState(false);

  const { data: stats, refetch } = useQuery({
    queryKey: ["hostel-stats"],
    queryFn: async () => {
      const { count: totalRooms } = await supabase
        .from("hostel_rooms")
        .select("*", { count: "exact", head: true });
      
      const { count: occupiedRooms } = await supabase
        .from("hostel_allocations")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");
      
      const { count: pendingComplaints } = await supabase
        .from("hostel_complaints")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      return {
        totalRooms: totalRooms || 0,
        occupiedRooms: occupiedRooms || 0,
        pendingComplaints: pendingComplaints || 0,
      };
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hostel Management</h1>
          <p className="text-muted-foreground">
            Manage hostel rooms, allocations, mess facilities, and student complaints
          </p>
        </div>
        <Button onClick={() => setShowAllocationDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Allocation
        </Button>
      </div>

      <AddHostelAllocationDialog
        open={showAllocationDialog}
        onOpenChange={setShowAllocationDialog}
        onSuccess={refetch}
      />

      {/* Quick Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalRooms || 0}</div>
            <p className="text-xs text-muted-foreground">
              Across 3 buildings
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupied Rooms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">95</div>
            <p className="text-xs text-muted-foreground">
              79% occupancy rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Complaints</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              2 urgent, 6 medium
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹4,75,000</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="rooms">Rooms</TabsTrigger>
          <TabsTrigger value="allocations">Allocations</TabsTrigger>
          <TabsTrigger value="mess">Mess Management</TabsTrigger>
          <TabsTrigger value="complaints">Complaints</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Room Availability</CardTitle>
                <CardDescription>Current room status across all buildings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Building A (40 rooms)</span>
                    <Badge variant="secondary">32 occupied</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Building B (45 rooms)</span>
                    <Badge variant="secondary">38 occupied</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Building C (35 rooms)</span>
                    <Badge variant="secondary">25 occupied</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Complaints</CardTitle>
                <CardDescription>Latest hostel complaints and issues</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Room A-101 - Plumbing</p>
                      <p className="text-xs text-muted-foreground">2 hours ago</p>
                    </div>
                    <Badge variant="destructive">Urgent</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Room B-205 - Electrical</p>
                      <p className="text-xs text-muted-foreground">5 hours ago</p>
                    </div>
                    <Badge variant="secondary">Medium</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Common Area - Cleaning</p>
                      <p className="text-xs text-muted-foreground">1 day ago</p>
                    </div>
                    <Badge variant="outline">Low</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rooms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Room Management</CardTitle>
              <CardDescription>View and manage hostel rooms</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Room management interface will be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="allocations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Student Allocations</CardTitle>
              <CardDescription>Manage room assignments and student check-ins</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Allocation management interface will be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mess" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mess Management</CardTitle>
              <CardDescription>Manage meal plans and attendance</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Mess management interface will be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="complaints" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Complaint Management</CardTitle>
              <CardDescription>Handle hostel complaints and maintenance requests</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Complaint management interface will be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Hostel;