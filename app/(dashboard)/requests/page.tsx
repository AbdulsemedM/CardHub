'use client';

import { useEffect, useState } from 'react';
import { RequestTable } from '@/components/requests/RequestTable';
import type { ApiTravelCardRequest } from '@/lib/types/request';
import { Button } from '@/components/ui/button';
import { Download, RefreshCcw } from 'lucide-react';
import { getPendingBranchReviews, getBranchCards } from '@/lib/services/branch-service';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function RequestsPage() {
  const [pendingRequests, setPendingRequests] = useState<ApiTravelCardRequest[]>([]);
  const [allRequests, setAllRequests] = useState<ApiTravelCardRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [pending, all] = await Promise.all([
        getPendingBranchReviews(),
        getBranchCards(0, 100).then(res => res.content),
      ]);
      setPendingRequests(pending);
      setAllRequests(all);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Branch Reviews</h1>
          <p className="text-slate-600 mt-1">
            Review and approve travel card requests for your branch.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="border-slate-200 text-slate-700 hover:bg-slate-50"
            onClick={loadData}
          >
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="pending">
            Pending Reviews ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="all">
            All My Reviews ({allRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <RequestTable requests={pendingRequests} onRefresh={loadData} />
        </TabsContent>

        <TabsContent value="all" className="mt-6">
          <RequestTable requests={allRequests} onRefresh={loadData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}










