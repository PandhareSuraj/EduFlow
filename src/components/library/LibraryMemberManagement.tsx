import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, RefreshCw } from 'lucide-react';
import { useLibraryData } from '@/hooks/useLibraryData';
import { format } from 'date-fns';

export function LibraryMemberManagement() {
  const { libraryMembers, autoCreateMembers, isCreatingMembers, loading } = useLibraryData();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Library Members ({libraryMembers?.length || 0})
          </CardTitle>
          <Button 
            onClick={() => autoCreateMembers()}
            disabled={isCreatingMembers}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isCreatingMembers ? 'animate-spin' : ''}`} />
            {isCreatingMembers ? 'Creating...' : 'Auto-Create Members'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {libraryMembers?.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Library Members</h3>
            <p className="text-muted-foreground mb-4">
              Create library memberships for your students and faculty to start issuing books.
            </p>
            <Button onClick={() => autoCreateMembers()} disabled={isCreatingMembers}>
              <Plus className="h-4 w-4 mr-2" />
              Create Members from Students/Faculty
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member Name</TableHead>
                <TableHead>Membership Number</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Max Books</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Member Since</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {libraryMembers?.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">
                    {member.member_name || 'Unknown'}
                  </TableCell>
                  <TableCell>{member.membership_number}</TableCell>
                  <TableCell>
                    <Badge variant={member.member_type === 'faculty' ? 'default' : 'secondary'}>
                      {member.member_type}
                    </Badge>
                  </TableCell>
                  <TableCell>{member.member_email || 'N/A'}</TableCell>
                  <TableCell>{member.max_books}</TableCell>
                  <TableCell>
                    <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                      {member.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(member.membership_start_date || member.created_at), 'PPP')}
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