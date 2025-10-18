import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AcademicYearManagement } from '@/components/promotion/AcademicYearManagement';
import { PromotionConfigDialog } from '@/components/promotion/PromotionConfigDialog';
import { PromotionJobsList } from '@/components/promotion/PromotionJobsList';
import { PromotionValidation } from '@/components/promotion/PromotionValidation';
import { ArrowUpCircle, HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const StudentPromotion = () => {
  const [configDialogOpen, setConfigDialogOpen] = useState(false);

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-3xl font-bold">Student Promotion</h1>
              <p className="text-muted-foreground">
                Manage academic years and promote students to next year/semester
              </p>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-5 w-5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-sm">
                    <strong>Student Promotion System:</strong><br />
                    1. Create academic years in the Academic Years tab<br />
                    2. Click "Start Promotion" to configure promotion criteria<br />
                    3. Run a dry run first to preview results<br />
                    4. Execute promotion to update student records<br />
                    5. Use rollback within 24 hours if needed
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Button onClick={() => setConfigDialogOpen(true)} size="lg">
            <ArrowUpCircle className="mr-2 h-5 w-5" />
            Start Promotion
          </Button>
        </div>

        <PromotionValidation />

        <Tabs defaultValue="history">
          <TabsList>
            <TabsTrigger value="history">Promotion History</TabsTrigger>
            <TabsTrigger value="academic-years">Academic Years</TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="space-y-4">
            <PromotionJobsList />
          </TabsContent>

          <TabsContent value="academic-years">
            <AcademicYearManagement />
          </TabsContent>
        </Tabs>

        <PromotionConfigDialog
          open={configDialogOpen}
          onClose={() => setConfigDialogOpen(false)}
        />
      </div>
    </Layout>
  );
};

export default StudentPromotion;
