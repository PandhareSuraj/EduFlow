import { useState } from "react";
import { Plus, Building2, Users, AlertCircle, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddHostelAllocationDialog } from "@/components/forms/AddHostelAllocationDialog";
import { AddHostelRoomDialog } from "@/components/forms/AddHostelRoomDialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCollege } from "@/contexts/CollegeContext";

function RoomsManagement({ onAddRoom, collegeId }: { onAddRoom: () => void; collegeId?: string }) {
  const { data: rooms = [] } = useQuery({
    queryKey: ["hostel-rooms", collegeId],
    queryFn: async () => {
      if (!collegeId) return [];
      
      const { data, error } = await supabase
        .from("hostel_rooms")
        .select("*")
        .eq("college_id", collegeId)
        .order("room_number");
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!collegeId,
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Room Management</CardTitle>
          <CardDescription>View and manage hostel rooms</CardDescription>
        </div>
        <Button onClick={onAddRoom}>
          <Plus className="mr-2 h-4 w-4" />
          Add Room
        </Button>
      </CardHeader>
      <CardContent>
        {rooms.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No rooms added yet. Click "Add Room" to create your first room.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Room Number</TableHead>
                <TableHead>Building</TableHead>
                <TableHead>Floor</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Occupied</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rooms.map((room: any) => (
                <TableRow key={room.id}>
                  <TableCell className="font-medium">{room.room_number}</TableCell>
                  <TableCell>{room.building}</TableCell>
                  <TableCell>{room.floor}</TableCell>
                  <TableCell className="capitalize">{room.room_type}</TableCell>
                  <TableCell>{room.capacity}</TableCell>
                  <TableCell>{room.occupied_beds || 0}</TableCell>
                  <TableCell>
                    <Badge variant={room.status === "available" ? "secondary" : room.status === "occupied" ? "default" : "outline"}>
                      {room.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

const Hostel = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [showAllocationDialog, setShowAllocationDialog] = useState(false);
  const [showRoomDialog, setShowRoomDialog] = useState(false);
  const { college } = useCollege();

  const { data: stats, refetch } = useQuery({
    queryKey: ["hostel-stats", college?.id],
    queryFn: async () => {
      if (!college?.id) return { totalRooms: 0, occupiedRooms: 0, pendingComplaints: 0 };
      
      const { count: totalRooms } = await supabase
        .from("hostel_rooms")
        .select("*", { count: "exact", head: true })
        .eq("college_id", college.id);
      
      const { count: occupiedRooms } = await supabase
        .from("hostel_allocations")
        .select("*", { count: "exact", head: true })
        .eq("status", "active")
        .eq("college_id", college.id);
      
      const { count: pendingComplaints } = await supabase
        .from("hostel_complaints")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending")
        .eq("college_id", college.id);

      return {
        totalRooms: totalRooms || 0,
        occupiedRooms: occupiedRooms || 0,
        pendingComplaints: pendingComplaints || 0,
      };
    },
    enabled: !!college?.id,
  });

  const { data: buildingStats = [] } = useQuery({
    queryKey: ["hostel-building-stats", college?.id],
    queryFn: async () => {
      if (!college?.id) return [];
      const { data, error } = await supabase
        .from("hostel_rooms")
        .select("building, status, capacity, occupied_beds")
        .eq("college_id", college.id);
      if (error) throw error;
      
      const buildings: Record<string, { total: number; occupied: number }> = {};
      (data || []).forEach((room: any) => {
        const b = room.building || "Unknown";
        if (!buildings[b]) buildings[b] = { total: 0, occupied: 0 };
        buildings[b].total++;
        buildings[b].occupied += room.occupied_beds || 0;
      });
      return Object.entries(buildings).map(([name, s]) => ({ name, ...s }));
    },
    enabled: !!college?.id,
  });

  const { data: recentComplaints = [] } = useQuery({
    queryKey: ["hostel-recent-complaints", college?.id],
    queryFn: async () => {
      if (!college?.id) return [];
      const { data, error } = await supabase
        .from("hostel_complaints")
        .select("*")
        .eq("college_id", college.id)
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data || [];
    },
    enabled: !!college?.id,
  });

  const { data: allocations = [] } = useQuery({
    queryKey: ["hostel-allocations", college?.id],
    queryFn: async () => {
      if (!college?.id) return [];
      const { data, error } = await supabase
        .from("hostel_allocations")
        .select("*, students(name, student_id), hostel_rooms(room_number, building)")
        .eq("college_id", college.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!college?.id,
  });

  const { data: complaints = [] } = useQuery({
    queryKey: ["hostel-complaints", college?.id],
    queryFn: async () => {
      if (!college?.id) return [];
      const { data, error } = await supabase
        .from("hostel_complaints")
        .select("*, students(name, student_id), hostel_rooms(room_number, building)")
        .eq("college_id", college.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!college?.id,
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

      <AddHostelRoomDialog
        open={showRoomDialog}
        onOpenChange={setShowRoomDialog}
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
              Across {buildingStats.length} building{buildingStats.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupied Rooms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.occupiedRooms || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.totalRooms ? `${Math.round((stats.occupiedRooms / stats.totalRooms) * 100)}% occupancy rate` : 'No rooms yet'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Complaints</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingComplaints || 0}</div>
            <p className="text-xs text-muted-foreground">
              Requires attention
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Allocations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allocations.filter((a: any) => a.status === 'active').length}</div>
            <p className="text-xs text-muted-foreground">
              Currently assigned
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
                  {buildingStats.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No buildings configured yet.</p>
                  ) : (
                    buildingStats.map((b: any) => (
                      <div key={b.name} className="flex items-center justify-between">
                        <span className="text-sm">{b.name} ({b.total} rooms)</span>
                        <Badge variant="secondary">{b.occupied} occupied</Badge>
                      </div>
                    ))
                  )}
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
                  {recentComplaints.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No complaints recorded.</p>
                  ) : (
                    recentComplaints.map((c: any) => (
                      <div key={c.id} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{c.complaint_type || 'General'}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(c.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={c.priority === 'urgent' ? 'destructive' : c.priority === 'high' ? 'destructive' : 'secondary'}>
                          {c.status}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rooms" className="space-y-4">
          <RoomsManagement onAddRoom={() => setShowRoomDialog(true)} collegeId={college?.id} />
        </TabsContent>

        <TabsContent value="allocations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Student Allocations</CardTitle>
              <CardDescription>Manage room assignments and student check-ins</CardDescription>
            </CardHeader>
            <CardContent>
              {allocations.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No allocations found. Click "New Allocation" to assign a room.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Building</TableHead>
                      <TableHead>Allocation Date</TableHead>
                      <TableHead>Fee (₹)</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allocations.map((alloc: any) => (
                      <TableRow key={alloc.id}>
                        <TableCell className="font-medium">
                          {alloc.students?.name || 'N/A'}
                          <span className="text-xs text-muted-foreground ml-1">({alloc.students?.student_id})</span>
                        </TableCell>
                        <TableCell>{alloc.hostel_rooms?.room_number || 'N/A'}</TableCell>
                        <TableCell>{alloc.hostel_rooms?.building || 'N/A'}</TableCell>
                        <TableCell>{new Date(alloc.allocation_date).toLocaleDateString()}</TableCell>
                        <TableCell>₹{alloc.room_fee?.toLocaleString() || 0}</TableCell>
                        <TableCell>
                          <Badge variant={alloc.status === 'active' ? 'default' : 'outline'}>
                            {alloc.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
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
              {complaints.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No complaints recorded.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {complaints.map((c: any) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">{c.students?.name || 'N/A'}</TableCell>
                        <TableCell>{c.hostel_rooms?.room_number || 'N/A'}</TableCell>
                        <TableCell className="capitalize">{c.complaint_type || 'General'}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{c.description || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={c.priority === 'urgent' || c.priority === 'high' ? 'destructive' : 'secondary'}>
                            {c.priority || 'normal'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={c.status === 'resolved' ? 'default' : 'outline'}>
                            {c.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(c.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Hostel;
