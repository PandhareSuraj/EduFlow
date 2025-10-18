import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AcademicYearManagement } from '@/components/promotion/AcademicYearManagement';
import { PromotionConfigDialog } from '@/components/promotion/PromotionConfigDialog';
import { PromotionJobsList } from '@/components/promotion/PromotionJobsList';
import { ArrowUpCircle } from 'lucide-react';

const StudentPromotion = () => {
  const [configDialogOpen, setConfigDialogOpen] = useState(false);

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Student Promotion</h1>
            <p className="text-muted-foreground">
              Manage academic years and promote students to next year/semester
            </p>
          </div>
          <Button onClick={() => setConfigDialogOpen(true)}>
            <ArrowUpCircle className="mr-2 h-4 w-4" />
            Start Promotion
          </Button>
        </div>

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
