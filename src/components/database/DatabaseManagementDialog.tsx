import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { RoleGuard } from '@/components/permissions/RoleGuard';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  AlertTriangle, 
  Database, 
  Download, 
  FileText, 
  Trash2,
  Users,
  BookOpen,
  GraduationCap,
  ClipboardList,
  DollarSign,
  Package,
  MessageCircle
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface College {
  id: string;
  name: string;
  code: string;
  status: string;
}

interface DataAnalysis {
  students: number;
  faculty: number;
  courses: number;
  exams: number;
  attendance_records: number;
  fee_records: number;
  library_books: number;
  inventory_items: number;
  enquiries: number;
  total_records: number;
}

interface DatabaseManagementDialogProps {
  trigger?: React.ReactNode;
}

const MODULE_OPTIONS = [
  { id: 'students', label: 'Students & Documents', icon: Users, description: 'Student records and uploaded documents' },
  { id: 'faculty', label: 'Faculty & Schedules', icon: GraduationCap, description: 'Faculty records and class schedules' },
  { id: 'courses', label: 'Courses & Subjects', icon: BookOpen, description: 'Course and subject information' },
  { id: 'exams', label: 'Exams & Results', icon: ClipboardList, description: 'Examination and result data' },
  { id: 'attendance', label: 'Attendance Records', icon: FileText, description: 'All attendance sessions and records' },
  { id: 'fees', label: 'Fee Management', icon: DollarSign, description: 'Fee structures, payments, and installments' },
  { id: 'library', label: 'Library System', icon: BookOpen, description: 'Books, issues, fines, and members' },
  { id: 'inventory', label: 'Inventory Management', icon: Package, description: 'Items, transactions, and suppliers' },
  { id: 'enquiries', label: 'Enquiries', icon: MessageCircle, description: 'Student enquiry records' },
];

export function DatabaseManagementDialog({ trigger }: DatabaseManagementDialogProps) {
  const [open, setOpen] = useState(false);
  const [colleges, setColleges] = useState<College[]>([]);
  const [selectedCollegeId, setSelectedCollegeId] = useState<string>('');
  const [dataAnalysis, setDataAnalysis] = useState<DataAnalysis | null>(null);
  const [selectedModules, setSelectedModules] = useState<string[]>(['all']);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [exportData, setExportData] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchColleges();
    }
  }, [open]);

  const fetchColleges = async () => {
    try {
      const { data, error } = await supabase
        .from('colleges')
        .select('id, name, code, status')
        .eq('status', 'active')
        .order('name');

      if (error) throw error;
      setColleges(data || []);
    } catch (error) {
      console.error('Error fetching colleges:', error);
      toast({
        title: "Error",
        description: "Failed to fetch colleges",
        variant: "destructive",
      });
    }
  };

  const analyzeCollegeData = async () => {
    if (!selectedCollegeId) {
      toast({
        title: "Error",
        description: "Please select a college first",
        variant: "destructive",
      });
      return;
    }

    setAnalyzing(true);
    try {
      const { data, error } = await supabase.rpc('analyze_college_data', {
        college_uuid: selectedCollegeId
      });

      if (error) throw error;
      setDataAnalysis(data as unknown as DataAnalysis);
    } catch (error) {
      console.error('Error analyzing data:', error);
      toast({
        title: "Error",
        description: "Failed to analyze college data",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const exportCollegeData = async () => {
    if (!selectedCollegeId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('export_college_data', {
        college_uuid: selectedCollegeId
      });

      if (error) throw error;
      
      const exportResult = data as any;
      setExportData(exportResult);
      
      // Download as JSON file
      const blob = new Blob([JSON.stringify(exportResult, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `college-backup-${exportResult.college?.code || 'unknown'}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "College data exported successfully",
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "Error",
        description: "Failed to export college data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const cleanCollegeData = async () => {
    if (!selectedCollegeId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('clean-college-data', {
        body: {
          collegeId: selectedCollegeId,
          modules: selectedModules,
        },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `College data cleaned successfully. ${data.deleted_counts.students + data.deleted_counts.faculty + data.deleted_counts.courses} records deleted.`,
      });

      // Refresh analysis
      setDataAnalysis(null);
      setShowConfirmDialog(false);
      analyzeCollegeData();
    } catch (error) {
      console.error('Error cleaning data:', error);
      toast({
        title: "Error",
        description: "Failed to clean college data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleModuleToggle = (moduleId: string, checked: boolean) => {
    if (moduleId === 'all') {
      setSelectedModules(checked ? ['all'] : []);
    } else {
      setSelectedModules(prev => {
        const filtered = prev.filter(m => m !== 'all');
        if (checked) {
          return [...filtered, moduleId];
        } else {
          return filtered.filter(m => m !== moduleId);
        }
      });
    }
  };

  const selectedCollege = colleges.find(c => c.id === selectedCollegeId);

  return (
    <RoleGuard allowedRoles={['super_admin']}>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger || (
            <Button variant="outline" className="gap-2">
              <Database className="h-4 w-4" />
              Database Management
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Management
            </DialogTitle>
            <DialogDescription>
              Manage college data with safety checks and backup options. Only super administrators can access this feature.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* College Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Select College</label>
              <Select value={selectedCollegeId} onValueChange={setSelectedCollegeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a college to manage" />
                </SelectTrigger>
                <SelectContent>
                  {colleges.map((college) => (
                    <SelectItem key={college.id} value={college.id}>
                      {college.name} ({college.code})
                      <Badge variant="secondary" className="ml-2">
                        {college.status}
                      </Badge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCollegeId && (
              <>
                {/* Analysis Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Data Analysis
                    </CardTitle>
                    <CardDescription>
                      Review current data before making any changes
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2 mb-4">
                      <Button 
                        onClick={analyzeCollegeData} 
                        disabled={analyzing}
                        variant="outline"
                      >
                        {analyzing ? "Analyzing..." : "Analyze Data"}
                      </Button>
                      {dataAnalysis && (
                        <Button 
                          onClick={exportCollegeData} 
                          disabled={loading}
                          variant="outline"
                          className="gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Export Backup
                        </Button>
                      )}
                    </div>

                    {dataAnalysis && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {MODULE_OPTIONS.map((module) => {
                          const count = dataAnalysis[module.id as keyof DataAnalysis] as number;
                          return (
                            <div key={module.id} className="p-3 border rounded-lg">
                              <div className="flex items-center gap-2 mb-1">
                                <module.icon className="h-4 w-4" />
                                <span className="font-medium text-sm">{module.label}</span>
                              </div>
                              <div className="text-2xl font-bold text-primary">
                                {count.toLocaleString()}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Module Selection */}
                {dataAnalysis && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Trash2 className="h-4 w-4" />
                        Select Modules to Clean
                      </CardTitle>
                      <CardDescription>
                        Choose which data modules to clean. User accounts will be preserved.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="all"
                            checked={selectedModules.includes('all')}
                            onCheckedChange={(checked) => handleModuleToggle('all', checked as boolean)}
                          />
                          <label htmlFor="all" className="font-medium">
                            Clean All Data (Recommended for fresh start)
                          </label>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {MODULE_OPTIONS.map((module) => (
                            <div key={module.id} className="flex items-start space-x-2">
                              <Checkbox
                                id={module.id}
                                checked={selectedModules.includes(module.id) || selectedModules.includes('all')}
                                onCheckedChange={(checked) => handleModuleToggle(module.id, checked as boolean)}
                                disabled={selectedModules.includes('all')}
                              />
                              <div>
                                <label htmlFor={module.id} className="font-medium flex items-center gap-2">
                                  <module.icon className="h-4 w-4" />
                                  {module.label}
                                </label>
                                <p className="text-sm text-muted-foreground">
                                  {module.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <h4 className="font-medium text-yellow-800">Important Notes</h4>
                              <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                                <li>• User accounts will be preserved</li>
                                <li>• College structure will remain intact</li>
                                <li>• This action cannot be undone</li>
                                <li>• Export backup before cleaning</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <Button 
                          onClick={() => setShowConfirmDialog(true)}
                          disabled={selectedModules.length === 0 || loading}
                          variant="destructive"
                          className="w-full gap-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          Clean Selected Data
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>

          {/* Confirmation Dialog */}
          <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Confirm Data Cleaning
                </AlertDialogTitle>
                <AlertDialogDescription className="space-y-2">
                  <p>You are about to permanently delete data from:</p>
                  <p className="font-medium">{selectedCollege?.name} ({selectedCollege?.code})</p>
                  <p className="font-medium">
                    Modules: {selectedModules.includes('all') ? 'All Data' : selectedModules.join(', ')}
                  </p>
                  <p className="text-destructive font-medium">
                    This action cannot be undone. Make sure you have exported a backup.
                  </p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={cleanCollegeData}
                  disabled={loading}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  {loading ? "Cleaning..." : "Yes, Clean Data"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DialogContent>
      </Dialog>
    </RoleGuard>
  );
}