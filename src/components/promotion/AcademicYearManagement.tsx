import { useState } from 'react';
import { Plus, Calendar, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAcademicYears } from '@/hooks/useAcademicYears';
import { AcademicYearDialog } from './AcademicYearDialog';
import { format } from 'date-fns';

export const AcademicYearManagement = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingYear, setEditingYear] = useState<any>(null);
  const { academicYears, isLoading, setCurrentYear } = useAcademicYears();

  const handleEdit = (year: any) => {
    setEditingYear(year);
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setEditingYear(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Academic Years</h2>
          <p className="text-muted-foreground">
            Manage academic years for student promotions
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Academic Year
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {academicYears?.map((year) => (
            <Card key={year.id} className="relative">
              {year.is_current && (
                <Badge className="absolute top-4 right-4" variant="default">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Current
                </Badge>
              )}
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {year.year_code}
                </CardTitle>
                <CardDescription>
                  {format(new Date(year.start_date), 'MMM d, yyyy')} -{' '}
                  {format(new Date(year.end_date), 'MMM d, yyyy')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(year)}
                  >
                    Edit
                  </Button>
                  {!year.is_current && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentYear(year.id)}
                    >
                      Set as Current
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AcademicYearDialog
        open={dialogOpen}
        onClose={handleClose}
        editingYear={editingYear}
      />
    </div>
  );
};
