import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Calendar, Search, User, Clock, Database } from "lucide-react";
import { format } from "date-fns";

interface AuditLogEntry {
  id: string;
  table_name: string;
  record_id: string;
  action: string;
  old_values?: any;
  new_values?: any;
  user_id?: string;
  user_email?: string;
  college_id?: string;
  created_at: string;
}

interface AuditTrailViewerProps {
  onClose?: () => void;
}

export function AuditTrailViewer({ onClose }: AuditTrailViewerProps) {
  const { userRole } = useAuth();
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [tableFilter, setTableFilter] = useState<string>("all");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [userFilter, setUserFilter] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  // Only allow access for admins and super_admins
  if (!userRole || !['admin', 'super_admin'].includes(userRole)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Database className="w-5 h-5" />
            Access Denied
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Only administrators can view audit trails.</p>
        </CardContent>
      </Card>
    );
  }

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (tableFilter && tableFilter !== 'all') {
        query = query.eq('table_name', tableFilter);
      }

      if (actionFilter && actionFilter !== 'all') {
        query = query.eq('action', actionFilter);
      }

      if (dateFrom) {
        query = query.gte('created_at', dateFrom);
      }

      if (dateTo) {
        query = query.lte('created_at', dateTo);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching audit logs:', error);
        toast.error('Failed to fetch audit logs');
        return;
      }

      // Fetch user emails for the audit entries
      const logsWithEmails = await Promise.all(
        (data || []).map(async (log) => {
          if (log.user_id) {
            const { data: emailData } = await supabase.rpc('get_user_email_by_id', {
              user_uuid: log.user_id
            });
            return { 
              ...log, 
              user_email: emailData || 'Unknown User',
              created_at: log.created_at || new Date().toISOString(),
              college_id: log.college_id || '',
              user_id: log.user_id || ''
            };
          }
          return { 
            ...log, 
            user_email: 'System',
            created_at: log.created_at || new Date().toISOString(),
            college_id: log.college_id || '',
            user_id: log.user_id || ''
          };
        })
      );

      setAuditLogs(logsWithEmails as AuditLogEntry[]);
    } catch (error) {
      console.error('Error in fetchAuditLogs:', error);
      toast.error('Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [tableFilter, actionFilter, dateFrom, dateTo]);

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch = !searchTerm || 
      log.record_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.table_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesUser = !userFilter || 
      log.user_email?.toLowerCase().includes(userFilter.toLowerCase());

    return matchesSearch && matchesUser;
  });

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'INSERT': return 'bg-green-100 text-green-800 border-green-200';
      case 'UPDATE': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'DELETE': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTableName = (tableName: string) => {
    return tableName.replace(/public\./g, '').replace(/_/g, ' ').toUpperCase();
  };

  return (
    <Card className="w-full max-w-7xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Audit Trail - Data Modification Tracking
          </div>
          {onClose && (
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          )}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Track all database changes for dispute resolution and compliance. Shows who created, modified, or deleted records.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Search Records</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by ID, user, table..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Table</label>
            <Select value={tableFilter} onValueChange={setTableFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All tables" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All tables</SelectItem>
                <SelectItem value="students">Students</SelectItem>
                <SelectItem value="faculty">Faculty</SelectItem>
                <SelectItem value="courses">Courses</SelectItem>
                <SelectItem value="fee_payments">Fee Payments</SelectItem>
                <SelectItem value="attendance_records">Attendance</SelectItem>
                <SelectItem value="exams">Exams</SelectItem>
                <SelectItem value="results">Results</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Action</label>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All actions</SelectItem>
                <SelectItem value="INSERT">Created</SelectItem>
                <SelectItem value="UPDATE">Updated</SelectItem>
                <SelectItem value="DELETE">Deleted</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Date Range</label>
            <div className="flex gap-2">
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="text-xs"
              />
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>
        </div>

        <Button 
          onClick={fetchAuditLogs}
          disabled={loading}
          className="w-full sm:w-auto"
        >
          {loading ? 'Loading...' : 'Refresh Audit Logs'}
        </Button>

        {/* Results Summary */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>Showing {filteredLogs.length} audit entries</span>
          <Badge variant="outline" className="text-xs">
            {userRole === 'super_admin' ? 'System-wide Access' : 'College-specific Access'}
          </Badge>
        </div>

        {/* Audit Logs Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Time
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    User
                  </div>
                </TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Table</TableHead>
                <TableHead>Record ID</TableHead>
                <TableHead className="w-48">Changes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    {loading ? 'Loading audit logs...' : 'No audit logs found for the selected filters.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-xs">
                      <div className="flex flex-col">
                        <span>{format(new Date(log.created_at), 'MMM dd')}</span>
                        <span className="text-muted-foreground">
                          {format(new Date(log.created_at), 'HH:mm')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{log.user_email}</span>
                        <span className="text-xs text-muted-foreground truncate">
                          {log.user_id?.slice(0, 8)}...
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getActionBadgeColor(log.action)}>
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">
                        {formatTableName(log.table_name)}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {log.record_id}
                    </TableCell>
                    <TableCell>
                      <div className="text-xs space-y-1 max-w-48">
                        {log.action === 'INSERT' && log.new_values && (
                          <div className="text-green-700">
                            <span className="font-medium">Created:</span>
                            <div className="truncate">
                              {Object.keys(log.new_values).slice(0, 2).join(', ')}
                              {Object.keys(log.new_values).length > 2 && '...'}
                            </div>
                          </div>
                        )}
                        {log.action === 'UPDATE' && log.old_values && log.new_values && (
                          <div className="text-blue-700">
                            <span className="font-medium">Modified:</span>
                            <div className="truncate">
                              {Object.keys(log.new_values)
                                .filter(key => JSON.stringify(log.old_values[key]) !== JSON.stringify(log.new_values[key]))
                                .slice(0, 2)
                                .join(', ') || 'System fields'}
                              {Object.keys(log.new_values).length > 2 && '...'}
                            </div>
                          </div>
                        )}
                        {log.action === 'DELETE' && log.old_values && (
                          <div className="text-red-700">
                            <span className="font-medium">Deleted record</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="text-xs text-muted-foreground border-t pt-4">
          <p>
            <strong>Note:</strong> This audit trail shows all database modifications made by users. 
            Use this information for dispute resolution, compliance auditing, and tracking data changes. 
            All timestamps are in UTC. Only administrators can access this information.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}