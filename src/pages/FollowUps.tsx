import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFollowUps } from '@/hooks/useFollowUps';
import { FollowUpCard } from '@/components/followup/FollowUpCard';
import { UnifiedFollowUpDialog } from '@/components/followup/UnifiedFollowUpDialog';
import { CreateFollowUpDialog } from '@/components/followup/CreateFollowUpDialog';
import { UnifiedFollowUp } from '@/types/followup';
import { Plus, Search, TrendingUp, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Loader2 } from 'lucide-react';

const FollowUps = () => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFollowUp, setSelectedFollowUp] = useState<UnifiedFollowUp | null>(null);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const { followUps, loading, stats, groups, refetch } = useFollowUps(
    statusFilter === 'all' ? undefined : statusFilter
  );

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleWhatsApp = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(`Hello ${name}, this is regarding your follow-up.`);
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  const handleUpdate = (followUp: UnifiedFollowUp) => {
    setSelectedFollowUp(followUp);
    setUpdateDialogOpen(true);
  };

  const filteredFollowUps = followUps.filter((f) =>
    f.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.contactPhone.includes(searchQuery) ||
    f.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="p-3 md:p-4 space-y-3 md:space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">Follow-ups</h1>
            <p className="text-sm text-muted-foreground">
              Manage all your follow-ups in one place
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Follow-up
          </Button>
        </div>

        {/* Stats Cards - Compact */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-destructive/10 rounded-md">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                </div>
                <div>
                  <p className="text-xl font-bold">{stats.overdue}</p>
                  <p className="text-xs text-muted-foreground">Overdue</p>
                </div>
              </div>
            </Card>

            <Card className="p-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-primary/10 rounded-md">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xl font-bold">{stats.today}</p>
                  <p className="text-xs text-muted-foreground">Today</p>
                </div>
              </div>
            </Card>

            <Card className="p-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-secondary/50 rounded-md">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xl font-bold">{stats.thisWeek}</p>
                  <p className="text-xs text-muted-foreground">This Week</p>
                </div>
              </div>
            </Card>

            <Card className="p-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-green-100 dark:bg-green-900/20 rounded-md">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-xl font-bold">{stats.byStatus.completed}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Filters - Compact */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, phone, or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[160px] h-9">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Follow-ups List - Compact */}
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : groups.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-sm text-muted-foreground">No follow-ups found</p>
          </Card>
        ) : (
          <Tabs defaultValue={groups[0]?.label || 'Today'} className="space-y-3">
            <TabsList className="w-full justify-start overflow-x-auto flex-nowrap h-9">
              {groups.map((group) => (
                <TabsTrigger key={group.label} value={group.label} className="whitespace-nowrap text-sm px-3">
                  {group.label} ({group.count})
                </TabsTrigger>
              ))}
            </TabsList>

            {groups.map((group) => (
              <TabsContent key={group.label} value={group.label} className="mt-3">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {group.items
                    .filter((f) =>
                      f.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      f.contactPhone.includes(searchQuery) ||
                      f.title.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((followUp) => (
                      <FollowUpCard
                        key={followUp.id}
                        followUp={followUp}
                        onUpdate={handleUpdate}
                        onCall={handleCall}
                        onWhatsApp={handleWhatsApp}
                      />
                    ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>

      {/* Dialogs */}
      <UnifiedFollowUpDialog
        open={updateDialogOpen}
        onOpenChange={setUpdateDialogOpen}
        followUp={selectedFollowUp}
        onSuccess={() => {
          refetch();
          setUpdateDialogOpen(false);
        }}
      />

      <CreateFollowUpDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={() => {
          refetch();
          setCreateDialogOpen(false);
        }}
      />
    </Layout>
  );
};

export default FollowUps;
