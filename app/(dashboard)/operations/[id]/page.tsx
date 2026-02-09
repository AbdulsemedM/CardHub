'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { toast } from 'sonner';
import { ArrowLeft, Check, X, AlertTriangle, User, Mail, Phone, MapPin, Calendar, DollarSign, Shield } from 'lucide-react';
import Link from 'next/link';
import type { ApiRequestDetail } from '@/lib/types/request';
import { getOperationsRequestDetail, submitOperationsReview } from '@/lib/services/operations-service';
import { getAllBankStaff } from '@/lib/services/admin-service';
import type { BankStaff } from '@/lib/types/user';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function OperationsDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [request, setRequest] = useState<ApiRequestDetail | null>(null);
  const [opsHeads, setOpsHeads] = useState<BankStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reviewDecision, setReviewDecision] = useState<'APPROVED' | 'REJECTED' | 'ESCALATED' | null>(null);
  const [formData, setFormData] = useState({
    amlCheck: false,
    sanctionsCheck: false,
    travelPolicyCompliance: false,
    complianceNotes: '',
    rejectionReason: '',
    escalationReason: '',
    escalatedToUserId: '',
  });

  useEffect(() => {
    loadData();
  }, [resolvedParams.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const travelCardId = parseInt(resolvedParams.id);
      const [requestData, staffData] = await Promise.all([
        getOperationsRequestDetail(travelCardId),
        getAllBankStaff(),
      ]);
      setRequest(requestData);
      // Filter for operations heads
      const heads = staffData.filter(s => s.role.roleName === 'OPERATIONS_HEAD' && s.isActive);
      setOpsHeads(heads);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load request details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!reviewDecision) {
      toast.error('Please select approve, reject, or escalate');
      return;
    }

    if (reviewDecision === 'REJECTED' && !formData.rejectionReason) {
      toast.error('Please enter rejection reason');
      return;
    }

    if (reviewDecision === 'ESCALATED') {
      if (!formData.escalationReason) {
        toast.error('Please enter escalation reason');
        return;
      }
      if (!formData.escalatedToUserId) {
        toast.error('Please select operations head to escalate to');
        return;
      }
    }

    setSubmitting(true);

    try {
      await submitOperationsReview({
        travelCardId: parseInt(resolvedParams.id),
        reviewStatus: reviewDecision,
        amlCheck: reviewDecision === 'APPROVED' ? formData.amlCheck : undefined,
        sanctionsCheck: reviewDecision === 'APPROVED' ? formData.sanctionsCheck : undefined,
        travelPolicyCompliance: reviewDecision === 'APPROVED' ? formData.travelPolicyCompliance : undefined,
        complianceNotes: reviewDecision === 'APPROVED' ? formData.complianceNotes : undefined,
        rejectionReason: reviewDecision === 'REJECTED' ? formData.rejectionReason : undefined,
        escalationReason: reviewDecision === 'ESCALATED' ? formData.escalationReason : undefined,
        escalatedToUserId: reviewDecision === 'ESCALATED' ? parseInt(formData.escalatedToUserId) : undefined,
      });

      toast.success(`Request ${reviewDecision.toLowerCase()} successfully`);
      router.push('/operations');
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit review');
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
        <Link href="/operations">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Operations
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/operations">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Operations Review</h1>
            <p className="text-slate-600 mt-1">Travel Card Request #{request.travelCardId}</p>
          </div>
        </div>
        <Badge className="text-sm py-2 px-4">
          {request.status.replace(/_/g, ' ')}
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
              <div className="col-span-2">
                <p className="text-sm text-slate-600 mb-2">Travel Reason</p>
                <p className="font-medium">{request.travelReason}</p>
              </div>
            </div>
          </Card>

          {/* Branch Review */}
          {request.branchReview && (
            <Card className="p-6 bg-green-50 border-green-200">
              <div className="flex items-center gap-2 mb-4">
                <Check className="h-5 w-5 text-green-600" />
                <h2 className="text-xl font-semibold text-green-900">Branch Approval</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-green-700">Reviewed By</p>
                  <p className="font-medium text-green-900">{request.branchReview.reviewedBy}</p>
                </div>
                <div>
                  <p className="text-sm text-green-700">Reviewed At</p>
                  <p className="font-medium text-green-900">
                    {new Date(request.branchReview.reviewedAt).toLocaleString()}
                  </p>
                </div>
                {request.branchReview.recommendedAmount && (
                  <div>
                    <p className="text-sm text-green-700">Recommended Amount</p>
                    <p className="font-medium text-green-900 text-lg">
                      ${request.branchReview.recommendedAmount.toLocaleString()}
                    </p>
                  </div>
                )}
                {request.branchReview.recommendationNote && (
                  <div className="col-span-2">
                    <p className="text-sm text-green-700 mb-1">Notes</p>
                    <p className="font-medium text-green-900">{request.branchReview.recommendationNote}</p>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Review Panel */}
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Compliance Review</h2>
            </div>
            
            <div className="space-y-4">
              {/* Decision Buttons */}
              <div className="grid grid-cols-1 gap-2">
                <Button
                  variant={reviewDecision === 'APPROVED' ? 'default' : 'outline'}
                  className={`${reviewDecision === 'APPROVED' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                  onClick={() => setReviewDecision('APPROVED')}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button
                  variant={reviewDecision === 'REJECTED' ? 'default' : 'outline'}
                  className={`${reviewDecision === 'REJECTED' ? 'bg-red-600 hover:bg-red-700' : ''}`}
                  onClick={() => setReviewDecision('REJECTED')}
                >
                  <X className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  variant={reviewDecision === 'ESCALATED' ? 'default' : 'outline'}
                  className={`${reviewDecision === 'ESCALATED' ? 'bg-orange-600 hover:bg-orange-700' : ''}`}
                  onClick={() => setReviewDecision('ESCALATED')}
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Escalate
                </Button>
              </div>

              {reviewDecision === 'APPROVED' && (
                <>
                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="amlCheck"
                        checked={formData.amlCheck}
                        onChange={(e) => setFormData({ ...formData, amlCheck: e.target.checked })}
                        className="rounded border-slate-300"
                      />
                      <Label htmlFor="amlCheck" className="font-normal">AML Check Passed</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="sanctionsCheck"
                        checked={formData.sanctionsCheck}
                        onChange={(e) => setFormData({ ...formData, sanctionsCheck: e.target.checked })}
                        className="rounded border-slate-300"
                      />
                      <Label htmlFor="sanctionsCheck" className="font-normal">Sanctions Check Passed</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="travelPolicy"
                        checked={formData.travelPolicyCompliance}
                        onChange={(e) => setFormData({ ...formData, travelPolicyCompliance: e.target.checked })}
                        className="rounded border-slate-300"
                      />
                      <Label htmlFor="travelPolicy" className="font-normal">Travel Policy Compliant</Label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="complianceNotes">Compliance Notes</Label>
                    <Textarea
                      id="complianceNotes"
                      placeholder="Add compliance notes"
                      rows={4}
                      value={formData.complianceNotes}
                      onChange={(e) => setFormData({ ...formData, complianceNotes: e.target.value })}
                    />
                  </div>
                </>
              )}

              {reviewDecision === 'REJECTED' && (
                <div className="space-y-2">
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

              {reviewDecision === 'ESCALATED' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="escalatedTo">Escalate To *</Label>
                    <select
                      id="escalatedTo"
                      value={formData.escalatedToUserId}
                      onChange={(e) => setFormData({ ...formData, escalatedToUserId: e.target.value })}
                      className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                    >
                      <option value="">Select Operations Head</option>
                      {opsHeads.map((head) => (
                        <option key={head.staffId} value={head.staffId}>
                          {head.fullName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="escalationReason">Escalation Reason *</Label>
                    <Textarea
                      id="escalationReason"
                      placeholder="Enter reason for escalation"
                      rows={4}
                      value={formData.escalationReason}
                      onChange={(e) => setFormData({ ...formData, escalationReason: e.target.value })}
                    />
                  </div>
                </>
              )}

              <Button
                className="w-full"
                onClick={handleSubmit}
                disabled={submitting || !reviewDecision}
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
