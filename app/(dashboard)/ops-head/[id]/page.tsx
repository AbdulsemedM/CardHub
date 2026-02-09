'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { toast } from 'sonner';
import { ArrowLeft, Check, X, User, Mail, Phone, MapPin, Calendar, DollarSign, AlertTriangle, Shield } from 'lucide-react';
import Link from 'next/link';
import type { ApiRequestDetail } from '@/lib/types/request';
import { getOperationsRequestDetail, submitOperationsReview, getOperationsReviewHistory } from '@/lib/services/operations-service';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function OpsHeadDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [request, setRequest] = useState<ApiRequestDetail | null>(null);
  const [reviewHistory, setReviewHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reviewDecision, setReviewDecision] = useState<'APPROVED' | 'REJECTED' | null>(null);
  const [formData, setFormData] = useState({
    complianceNotes: '',
    rejectionReason: '',
  });

  useEffect(() => {
    loadData();
  }, [resolvedParams.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const travelCardId = parseInt(resolvedParams.id);
      const [requestData, history] = await Promise.all([
        getOperationsRequestDetail(travelCardId),
        getOperationsReviewHistory(travelCardId),
      ]);
      setRequest(requestData);
      setReviewHistory(history);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load request details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!reviewDecision) {
      toast.error('Please select approve or reject');
      return;
    }

    if (reviewDecision === 'REJECTED' && !formData.rejectionReason) {
      toast.error('Please enter rejection reason');
      return;
    }

    setSubmitting(true);

    try {
      await submitOperationsReview({
        travelCardId: parseInt(resolvedParams.id),
        reviewStatus: reviewDecision,
        amlCheck: reviewDecision === 'APPROVED',
        sanctionsCheck: reviewDecision === 'APPROVED',
        travelPolicyCompliance: reviewDecision === 'APPROVED',
        complianceNotes: reviewDecision === 'APPROVED' ? formData.complianceNotes : undefined,
        rejectionReason: reviewDecision === 'REJECTED' ? formData.rejectionReason : undefined,
      });

      toast.success(`Request ${reviewDecision.toLowerCase()} successfully`);
      router.push('/ops-head/pending');
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit final decision');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-slate-900 mb-2">Request not found</h2>
        <Link href="/ops-head/pending">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Escalated Requests
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/ops-head/pending">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Final Decision</h1>
            <p className="text-slate-600 mt-1">Travel Card Request #{request.travelCardId}</p>
          </div>
        </div>
        <Badge className="text-sm py-2 px-4 bg-orange-100 text-orange-700">
          Escalated
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Applicant Information */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Applicant Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-600">Full Name</p>
                  <p className="font-medium">{request.applicantName}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-600">Email</p>
                  <p className="font-medium">{request.applicantEmail}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-600">Phone</p>
                  <p className="font-medium">{request.applicantPhone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-600">Destination</p>
                  <p className="font-medium">{request.destination}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Travel Details */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Travel Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-600">Travel Date</p>
                  <p className="font-medium">{new Date(request.travelDate).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-600">Return Date</p>
                  <p className="font-medium">{new Date(request.returnDate).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-600">Requested Amount</p>
                  <p className="font-medium text-lg">${request.requestedAmount.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Review History */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Review Chain</h2>
            <div className="space-y-4">
              {/* Branch Review */}
              {request.branchReview && (
                <div className="flex gap-4 pb-4 border-b">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold">Branch Review</h3>
                      <span className="text-sm text-slate-500">
                        {new Date(request.branchReview.reviewedAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">
                      Reviewed by {request.branchReview.reviewedBy}
                    </p>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Approved
                    </Badge>
                    {request.branchReview.recommendedAmount && (
                      <p className="text-sm mt-2">
                        <span className="text-slate-600">Recommended Amount:</span>{' '}
                        <span className="font-semibold">${request.branchReview.recommendedAmount.toLocaleString()}</span>
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Operations Review (Escalation) */}
              {request.operationsReview && (
                <div className="flex gap-4 pb-4 border-b">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold">Operations Review</h3>
                      <span className="text-sm text-slate-500">
                        {new Date(request.operationsReview.reviewedAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">
                      Reviewed by {request.operationsReview.reviewedBy}
                    </p>
                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                      Escalated
                    </Badge>
                    {request.operationsReview.complianceNotes && (
                      <p className="text-sm mt-2 text-slate-700">
                        {request.operationsReview.complianceNotes}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Awaiting Final Decision */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Final Decision</h3>
                  <p className="text-sm text-slate-600 mt-1">Awaiting your review and decision</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Decision Panel */}
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Final Decision</h2>
            </div>
            
            <div className="space-y-4">
              {/* Decision Buttons */}
              <div className="grid grid-cols-1 gap-3">
                <Button
                  variant={reviewDecision === 'APPROVED' ? 'default' : 'outline'}
                  className={`h-auto py-4 ${reviewDecision === 'APPROVED' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                  onClick={() => setReviewDecision('APPROVED')}
                >
                  <Check className="h-5 w-5 mr-2" />
                  <div className="text-left">
                    <div className="font-semibold">Approve</div>
                    <div className="text-xs opacity-90">Grant final approval</div>
                  </div>
                </Button>
                <Button
                  variant={reviewDecision === 'REJECTED' ? 'default' : 'outline'}
                  className={`h-auto py-4 ${reviewDecision === 'REJECTED' ? 'bg-red-600 hover:bg-red-700' : ''}`}
                  onClick={() => setReviewDecision('REJECTED')}
                >
                  <X className="h-5 w-5 mr-2" />
                  <div className="text-left">
                    <div className="font-semibold">Reject</div>
                    <div className="text-xs opacity-90">Deny the request</div>
                  </div>
                </Button>
              </div>

              {reviewDecision === 'APPROVED' && (
                <div className="space-y-2 pt-4 border-t">
                  <Label htmlFor="complianceNotes">Final Notes (Optional)</Label>
                  <Textarea
                    id="complianceNotes"
                    placeholder="Add any final notes or conditions"
                    rows={4}
                    value={formData.complianceNotes}
                    onChange={(e) => setFormData({ ...formData, complianceNotes: e.target.value })}
                  />
                </div>
              )}

              {reviewDecision === 'REJECTED' && (
                <div className="space-y-2 pt-4 border-t">
                  <Label htmlFor="rejectionReason">Rejection Reason *</Label>
                  <Textarea
                    id="rejectionReason"
                    placeholder="Enter reason for rejection"
                    rows={4}
                    value={formData.rejectionReason}
                    onChange={(e) => setFormData({ ...formData, rejectionReason: e.target.value })}
                  />
                </div>
              )}

              <Button
                className="w-full"
                size="lg"
                onClick={handleSubmit}
                disabled={submitting || !reviewDecision}
              >
                {submitting ? 'Submitting...' : 'Submit Final Decision'}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
