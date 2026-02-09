'use client';

import { useEffect, useState } from 'react';
import { RequestTable } from '@/components/requests/RequestTable';
import type { ApiTravelCardRequest } from '@/lib/types/request';
import { Button } from '@/components/ui/button';
import { Download, RefreshCcw, AlertTriangle } from 'lucide-react';
import { getOperationsHeadCards } from '@/lib/services/operations-service';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function OpsHeadPendingPage() {
  const [escalatedRequests, setEscalatedRequests] = useState<ApiTravelCardRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getOperationsHeadCards(0, 100);
      setEscalatedRequests(data.content);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load escalated requests');
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
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Escalated Requests</h1>
              <p className="text-slate-600 mt-1">
                Review and make final decisions on requests escalated by operations
              </p>
            </div>
          </div>
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

      {escalatedRequests.length === 0 ? (
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No Escalated Requests</h3>
          <p className="text-slate-600">There are no requests requiring your attention at this time.</p>
        </div>
      ) : (
        <RequestTable requests={escalatedRequests} onRefresh={loadData} />
      )}
    </div>
  );
}
