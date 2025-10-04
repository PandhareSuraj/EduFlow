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

function RoutesManagement() {
  const { data: routes = [] } = useQuery({
    queryKey: ["transport-routes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transport_routes")
        .select("*")
        .order("created_at", { ascending: false });
      
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
                  <TableCell>₹{route.fare}</TableCell>
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

const Transport = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [showRouteDialog, setShowRouteDialog] = useState(false);

  const { data: stats, refetch } = useQuery({
    queryKey: ["transport-stats"],
    queryFn: async () => {
      const { count: activeRoutes } = await supabase
        .from("transport_routes")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");
      
      const { count: activeBuses } = await supabase
        .from("buses")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      return {
        activeRoutes: activeRoutes || 0,
        activeBuses: activeBuses || 0,
      };
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
              Covering 45 stops
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
              2 in maintenance
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Passengers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">650</div>
            <p className="text-xs text-muted-foreground">
              92% attendance today
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On-Time Performance</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-xs text-muted-foreground">
              +2% from last week
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
                <CardTitle>Route Status</CardTitle>
                <CardDescription>Current status of all bus routes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-sm">Route A - City Center</span>
                    </div>
                    <Badge variant="secondary">On Time</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                      <span className="text-sm">Route B - Industrial Area</span>
                    </div>
                    <Badge variant="outline">5 min delay</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-sm">Route C - Residential</span>
                    </div>
                    <Badge variant="secondary">On Time</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Live Bus Tracking</CardTitle>
                <CardDescription>Real-time location of active buses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Bus KA-01-AB-1234</p>
                      <p className="text-xs text-muted-foreground">Route A - Stop 3/8</p>
                    </div>
                    <Badge variant="secondary">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                      Active
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Bus KA-01-AB-5678</p>
                      <p className="text-xs text-muted-foreground">Route B - Stop 5/12</p>
                    </div>
                    <Badge variant="secondary">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                      Active
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Bus KA-01-AB-9012</p>
                      <p className="text-xs text-muted-foreground">Route C - Depot</p>
                    </div>
                    <Badge variant="outline">
                      <div className="w-2 h-2 rounded-full bg-gray-400 mr-1"></div>
                      Parked
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="routes" className="space-y-4">
          <RoutesManagement />
        </TabsContent>

        <TabsContent value="buses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bus Fleet Management</CardTitle>
              <CardDescription>Manage buses, drivers, and vehicle maintenance</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Bus fleet management interface will be implemented here.</p>
            </CardContent>
          </Card>
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