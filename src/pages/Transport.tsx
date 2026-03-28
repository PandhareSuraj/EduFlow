import { useState } from "react";
import { Plus, MapPin, Bus, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddTransportRouteDialog } from "@/components/forms/AddTransportRouteDialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCollege } from "@/contexts/CollegeContext";

function RoutesManagement({ collegeId }: { collegeId?: string }) {
  const { data: routes = [] } = useQuery({
    queryKey: ["transport-routes", collegeId],
    queryFn: async () => {
      let query = supabase
        .from("transport_routes")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (collegeId) query = query.eq("college_id", collegeId);
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Routes & Bus Stops</CardTitle>
        <CardDescription>Manage bus routes and stop locations</CardDescription>
      </CardHeader>
      <CardContent>
        {routes.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No routes added yet. Click "Add Route" to create your first route.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Route Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Start - End</TableHead>
                <TableHead>Distance</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Fare</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {routes.map((route: any) => (
                <TableRow key={route.id}>
                  <TableCell className="font-medium">{route.route_name}</TableCell>
                  <TableCell>{route.route_code}</TableCell>
                  <TableCell className="text-sm">
                    {route.starting_point} → {route.ending_point}
                  </TableCell>
                  <TableCell>{route.distance} km</TableCell>
                  <TableCell>{route.duration} min</TableCell>
                  <TableCell>₹{route.base_fare}</TableCell>
                  <TableCell>
                    <Badge variant={route.status === "active" ? "secondary" : "outline"}>
                      {route.status}
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

function BusFleetManagement({ collegeId }: { collegeId?: string }) {
  const { data: buses = [] } = useQuery({
    queryKey: ["bus-fleet", collegeId],
    queryFn: async () => {
      let query = supabase
        .from("buses")
        .select("*, transport_routes(route_name)")
        .order("bus_number");
      
      if (collegeId) query = query.eq("college_id", collegeId);
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bus Fleet Management</CardTitle>
        <CardDescription>Manage buses, drivers, and vehicle maintenance</CardDescription>
      </CardHeader>
      <CardContent>
        {buses.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No buses registered yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bus Number</TableHead>
                <TableHead>Registration</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {buses.map((bus: any) => (
                <TableRow key={bus.id}>
                  <TableCell className="font-medium">{bus.bus_number}</TableCell>
                  <TableCell>{bus.registration_number || '-'}</TableCell>
                  <TableCell>{bus.transport_routes?.route_name || 'Unassigned'}</TableCell>
                  <TableCell>{bus.driver_name || '-'}</TableCell>
                  <TableCell>{bus.driver_phone || '-'}</TableCell>
                  <TableCell>{bus.capacity}</TableCell>
                  <TableCell className="capitalize">{bus.vehicle_type || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={bus.status === "active" ? "secondary" : "outline"}>
                      {bus.status}
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

const Transport = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [showRouteDialog, setShowRouteDialog] = useState(false);
  const { college } = useCollege();

  const { data: stats, refetch } = useQuery({
    queryKey: ["transport-stats", college?.id],
    queryFn: async () => {
      let routeQuery = supabase
        .from("transport_routes")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");
      
      let busQuery = supabase
        .from("buses")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      if (college?.id) {
        routeQuery = routeQuery.eq("college_id", college.id);
        busQuery = busQuery.eq("college_id", college.id);
      }

      const { count: activeRoutes } = await routeQuery;
      const { count: activeBuses } = await busQuery;

      return {
        activeRoutes: activeRoutes || 0,
        activeBuses: activeBuses || 0,
      };
    },
  });

  const { data: recentRoutes = [] } = useQuery({
    queryKey: ["transport-overview-routes", college?.id],
    queryFn: async () => {
      let query = supabase
        .from("transport_routes")
        .select("route_name, status")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(5);
      
      if (college?.id) query = query.eq("college_id", college.id);
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const { data: recentBuses = [] } = useQuery({
    queryKey: ["transport-overview-buses", college?.id],
    queryFn: async () => {
      let query = supabase
        .from("buses")
        .select("bus_number, registration_number, status, transport_routes(route_name)")
        .order("created_at", { ascending: false })
        .limit(5);
      
      if (college?.id) query = query.eq("college_id", college.id);
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transport Management</h1>
          <p className="text-muted-foreground">
            Manage bus routes, GPS tracking, student attendance, and transport subscriptions
          </p>
        </div>
        <Button onClick={() => setShowRouteDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Route
        </Button>
      </div>

      <AddTransportRouteDialog
        open={showRouteDialog}
        onOpenChange={setShowRouteDialog}
        onSuccess={refetch}
      />

      {/* Quick Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Routes</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeRoutes || 0}</div>
            <p className="text-xs text-muted-foreground">
              Active routes
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Buses</CardTitle>
            <Bus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeBuses || 0}</div>
            <p className="text-xs text-muted-foreground">
              Registered buses
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Passengers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">N/A</div>
            <p className="text-xs text-muted-foreground">
              Coming soon
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On-Time Performance</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">N/A</div>
            <p className="text-xs text-muted-foreground">
              Coming soon
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="routes">Routes & Stops</TabsTrigger>
          <TabsTrigger value="buses">Bus Fleet</TabsTrigger>
          <TabsTrigger value="tracking">GPS Tracking</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Active Routes</CardTitle>
                <CardDescription>Current status of bus routes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentRoutes.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No routes configured yet.</p>
                  ) : (
                    recentRoutes.map((route: any, i: number) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-primary"></div>
                          <span className="text-sm">{route.route_name}</span>
                        </div>
                        <Badge variant="secondary">{route.status}</Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bus Fleet</CardTitle>
                <CardDescription>Registered buses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentBuses.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No buses registered yet.</p>
                  ) : (
                    recentBuses.map((bus: any) => (
                      <div key={bus.bus_number} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Bus {bus.bus_number}</p>
                          <p className="text-xs text-muted-foreground">
                            {(bus as any).transport_routes?.route_name || 'Unassigned'}
                          </p>
                        </div>
                        <Badge variant={bus.status === 'active' ? 'secondary' : 'outline'}>
                          {bus.status}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="routes" className="space-y-4">
          <RoutesManagement collegeId={college?.id} />
        </TabsContent>

        <TabsContent value="buses" className="space-y-4">
          <BusFleetManagement collegeId={college?.id} />
        </TabsContent>

        <TabsContent value="tracking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>GPS Tracking Dashboard</CardTitle>
              <CardDescription>Real-time GPS tracking and route monitoring</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">GPS tracking interface will be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Student Attendance</CardTitle>
              <CardDescription>Track daily bus attendance and passenger counts</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Attendance tracking interface will be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transport Subscriptions</CardTitle>
              <CardDescription>Manage student transport subscriptions and fees</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Subscription management interface will be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Transport;
