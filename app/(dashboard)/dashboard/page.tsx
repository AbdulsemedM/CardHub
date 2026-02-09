import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import requestsData from '@/lib/mock-data/requests.json';
import type { TravelCardRequest } from '@/lib/types/request';
import {
  Clock,
  Search,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Plus,
  CheckSquare,
  Download,
  TrendingDown,
  FileText,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  FilePlus,
} from 'lucide-react';
import Link from 'next/link';

async function getDashboardStats(userRole: string) {
  const requests = requestsData as TravelCardRequest[];
  
  let filteredRequests = requests;
  if (userRole === 'branch_officer') {
    filteredRequests = requests.filter((req) => 
      req.history.some((h) => h.role === 'branch_officer')
    );
  }

  const pending = filteredRequests.filter((r) => r.status === 'pending').length;
  const underReview = filteredRequests.filter((r) => r.status === 'under_review').length;
  const approved = filteredRequests.filter((r) => r.status === 'approved').length;
  const rejected = filteredRequests.filter((r) => r.status === 'rejected').length;
  const escalated = filteredRequests.filter((r) => r.status === 'escalated').length;

  // Calculate monthly approved count (for "Approved (Mtd)" - Month to Date)
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const approvedThisMonth = filteredRequests.filter((r) => {
    if (r.status !== 'approved' || !r.approvedAt) return false;
    const approvedDate = new Date(r.approvedAt);
    return approvedDate.getMonth() === currentMonth && approvedDate.getFullYear() === currentYear;
  }).length;

  // Calculate percentage change (mock data - 12% increase)
  const previousMonthApproved = Math.round(approvedThisMonth / 1.12);

  return {
    pending,
    underReview,
    approved,
    approvedThisMonth,
    rejected,
    escalated,
    total: filteredRequests.length,
  };
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins} mins ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays} days ago`;
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  const userRole = typeof user.role === 'object' ? user.role.roleName : user.role;
  const roleForStats = userRole === 'BRANCH_USER' ? 'branch_officer' : userRole === 'OPERATIONS' ? 'operations' : userRole === 'OPERATIONS_HEAD' ? 'ops_head' : userRole;
  const stats = await getDashboardStats(roleForStats);
  const requests = requestsData as TravelCardRequest[];

  // Get recent activity (last 4 activities)
  const recentActivities = [
    {
      id: '1',
      type: 'approved',
      title: 'Application #TRV-2024-889 approved',
      description: 'Approved by Sarah Jenkins (Finance Lead)',
      time: '2 mins ago',
      icon: CheckCircle,
      iconColor: 'text-green-600',
    },
    {
      id: '2',
      type: 'escalated',
      title: 'Application #TRV-2024-912 escalated',
      description: 'Limit exceeds branch manager threshold. Sent to HQ.',
      time: '1 hour ago',
      icon: AlertCircle,
      iconColor: 'text-secondary',
    },
    {
      id: '3',
      type: 'submitted',
      title: 'New application submitted',
      description: 'Submitted by Mike Ross for \'Q4 Sales Conference\'',
      time: '3 hours ago',
      icon: FilePlus,
      iconColor: 'text-primary',
    },
    {
      id: '4',
      type: 'policy',
      title: 'Policy Update: International Travel',
      description: 'System updated with new per diem rates for EU region.',
      time: 'Yesterday',
      icon: FileText,
      iconColor: 'text-primary',
    },
  ];

  // Get needs attention items (escalated and pending)
  const needsAttention = requests
    .filter((r) => r.status === 'escalated' || (r.status === 'pending' && r.applicantName))
    .slice(0, 2)
    .map((r) => ({
      id: r.id,
      applicant: r.applicantName,
      destination: r.destination,
      amount: r.accountInfo?.sixMonthAverage ? `$${(r.accountInfo.sixMonthAverage * 0.34).toFixed(2)}` : '$0.00',
      status: r.status,
    }));

  return (
    <div className="space-y-6 pt-2">
      {/* Application Status Cards */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-slate-900">Application Status</h3>
        <div className="grid grid-cols-5 gap-4">
          {/* Pending Review */}
          <Card className="relative overflow-hidden">
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-3xl font-bold text-slate-900">{stats.pending}</p>
                  <p className="text-xs text-green-600 font-medium mt-1">+2 today</p>
                </div>
                <Clock className="h-6 w-6 text-slate-400" />
              </div>
              <p className="text-sm text-slate-600">Pending Review</p>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary"></div>
            </CardContent>
          </Card>

          {/* Under Review */}
          <Card className="relative overflow-hidden">
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-3xl font-bold text-slate-900">{stats.underReview}</p>
                </div>
                <Search className="h-6 w-6 text-slate-400" />
              </div>
              <p className="text-sm text-slate-600">Under Review</p>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-300"></div>
            </CardContent>
          </Card>

          {/* Escalated */}
          <Card className="relative overflow-hidden">
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-3xl font-bold text-slate-900">{stats.escalated}</p>
                  <p className="text-xs text-secondary font-medium mt-1">Action req.</p>
                </div>
                <AlertTriangle className="h-6 w-6 text-slate-400" />
              </div>
              <p className="text-sm text-slate-600">Escalated</p>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-secondary"></div>
            </CardContent>
          </Card>

          {/* Approved (Mtd) */}
          <Card className="relative overflow-hidden">
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-3xl font-bold text-slate-900">{stats.approvedThisMonth}</p>
                  <p className="text-xs text-green-600 font-medium mt-1">↑ 12%</p>
                </div>
                <CheckCircle2 className="h-6 w-6 text-slate-400" />
              </div>
              <p className="text-sm text-slate-600">Approved (Mtd)</p>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-500"></div>
            </CardContent>
          </Card>

          {/* Rejected */}
          <Card className="relative overflow-hidden">
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-3xl font-bold text-slate-900">{stats.rejected}</p>
                </div>
                <XCircle className="h-6 w-6 text-slate-400" />
              </div>
              <p className="text-sm text-slate-600">Rejected</p>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-300"></div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - 2 sections */}
        <div className="col-span-2 space-y-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
              <Link href="/requests" className="text-sm text-primary hover:underline flex items-center gap-1">
                View all
                <ArrowRight className="h-4 w-4" />
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => {
                  const Icon = activity.icon;
                  return (
                    <div key={activity.id} className="flex gap-3">
                      <div className={`${activity.iconColor} mt-0.5`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">{activity.title}</p>
                        <p className="text-xs text-slate-600 mt-0.5">{activity.description}</p>
                        <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Needs Attention */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Needs Attention</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider pb-3">Applicant</th>
                      <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider pb-3">Destination</th>
                      <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider pb-3">Amount</th>
                      <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider pb-3">Status</th>
                      <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider pb-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {needsAttention.map((item) => (
                      <tr key={item.id} className="border-b border-slate-100 last:border-0">
                        <td className="py-3 text-sm font-medium text-slate-900">{item.applicant}</td>
                        <td className="py-3 text-sm text-slate-600">{item.destination}</td>
                        <td className="py-3 text-sm text-slate-900">{item.amount}</td>
                        <td className="py-3">
                          <Badge
                            className={
                              item.status === 'escalated'
                                ? 'bg-secondary/20 text-secondary border-0'
                                : 'bg-primary/20 text-primary border-0'
                            }
                          >
                            {item.status === 'escalated' ? 'Escalated' : 'Pending'}
                          </Badge>
                        </td>
                        <td className="py-3">
                          <Link href={`/requests/${item.id}`}>
                            <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                              Review
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - 3 sections */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground justify-start" size="lg">
                <Plus className="h-5 w-5 mr-2" />
                Create Application
              </Button>
              <Button variant="outline" className="w-full justify-start" size="lg">
                <CheckSquare className="h-5 w-5 mr-2" />
                Bulk Approval
              </Button>
              <Button variant="outline" className="w-full justify-start" size="lg">
                <Download className="h-5 w-5 mr-2" />
                Export Report
              </Button>
            </CardContent>
          </Card>

          {/* Branch Budget */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg font-semibold">Branch Budget</CardTitle>
              <span className="text-sm text-slate-600">Q3 2024</span>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-600">Utilized</span>
                    <span className="font-semibold text-slate-900">$142,500</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5">
                    <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '72%' }}></div>
                  </div>
                  <p className="text-xs text-slate-600 mt-2">72% of quarterly budget</p>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                  <TrendingDown className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-slate-600">Lower than last month</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Policy Update */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Policy Update</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">
                New travel guidelines for international conferences are now in effect.
              </p>
              <Button variant="outline" className="w-full text-primary border-slate-200 hover:bg-slate-50">
                Read Guidelines
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
