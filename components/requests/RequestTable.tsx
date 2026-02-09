'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/ui/EmptyState';
import type { TravelCardRequest, ApiTravelCardRequest } from '@/lib/types/request';
import { Search, ChevronDown, Filter, Settings } from 'lucide-react';

interface RequestTableProps {
  requests: TravelCardRequest[] | ApiTravelCardRequest[];
  onRefresh?: () => void;
}

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  under_review: 'Under Review',
  approved: 'Approved',
  rejected: 'Rejected',
  escalated: 'Escalated',
  PENDING_BRANCH_REVIEW: 'Pending Branch Review',
  PENDING_OPERATIONS_REVIEW: 'Pending Operations',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  CARD_REQUESTED: 'Card Requested',
  PRINTING: 'Printing',
  READY: 'Ready',
  CARD_COLLECTED: 'Collected',
  COMPLETED: 'Completed',
};

const getStatusBadgeStyle = (status: string) => {
  switch (status) {
    case 'pending':
    case 'escalated':
      return 'bg-secondary/20 text-secondary border-0';
    case 'approved':
      return 'bg-green-100 text-green-700 border-0';
    case 'rejected':
      return 'bg-red-100 text-red-700 border-0';
    default:
      return 'bg-slate-100 text-slate-700 border-0';
  }
};

const getStatusDotColor = (status: string) => {
  switch (status) {
    case 'pending':
    case 'escalated':
      return 'bg-secondary';
    case 'approved':
      return 'bg-green-500';
    case 'rejected':
      return 'bg-red-500';
    default:
      return 'bg-slate-500';
  }
};

const getInitials = (name: string) => {
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const getAvatarColor = (name: string) => {
  const colors = [
    'bg-primary',
    'bg-secondary',
    'bg-purple-600',
    'bg-pink-600',
    'bg-indigo-600',
    'bg-teal-600',
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};

const calculateBudget = (request: any): number => {
  // Estimate budget based on account info or use a default calculation
  if ('requestedAmount' in request) {
    return request.requestedAmount;
  }
  if (request.accountInfo?.sixMonthAverage) {
    // Use 34% of six month average as estimated budget (example calculation)
    return request.accountInfo.sixMonthAverage * 0.34;
  }
  // Default estimate based on destination or travel dates
  return 2400.0;
};

const getRequestId = (request: any): string => {
  return ('travelCardId' in request) ? String(request.travelCardId) : request.id;
};

export function RequestTable({ requests, onRefresh }: RequestTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.applicantEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.destination.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRequests = filteredRequests.slice(startIndex, endIndex);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(paginatedRequests.map((r) => getRequestId(r))));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedRows(newSelected);
  };

  if (requests.length === 0) {
    return <EmptyState title="No requests found" description="There are no requests to display." />;
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200">
      {/* Filter and Search Bar */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search by name, email, or destination..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-lg border-slate-200 bg-white"
            />
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-white border border-slate-200 rounded-lg px-4 py-2 pr-8 text-sm text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary cursor-pointer min-w-[140px]"
            >
              <option value="all">Filter Status</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="escalated">Escalated</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-600">
              <Filter className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-600">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-slate-200 hover:bg-transparent">
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  className="rounded border-slate-300"
                  checked={paginatedRequests.length > 0 && paginatedRequests.every((r) => selectedRows.has(getRequestId(r)))}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </TableHead>
              <TableHead className="uppercase text-xs font-semibold text-slate-600 tracking-wider">Applicant</TableHead>
              <TableHead className="uppercase text-xs font-semibold text-slate-600 tracking-wider">Destination</TableHead>
              <TableHead className="uppercase text-xs font-semibold text-slate-600 tracking-wider">Travel Date</TableHead>
              <TableHead className="uppercase text-xs font-semibold text-slate-600 tracking-wider">Est. Budget</TableHead>
              <TableHead className="uppercase text-xs font-semibold text-slate-600 tracking-wider">Status</TableHead>
              <TableHead className="uppercase text-xs font-semibold text-slate-600 tracking-wider">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <EmptyState
                    title="No matching requests"
                    description="Try adjusting your search or filter criteria."
                  />
                </TableCell>
              </TableRow>
            ) : (
              paginatedRequests.map((request) => {
                const requestId = getRequestId(request);
                return (
                  <TableRow key={requestId} className="border-b border-slate-100 hover:bg-slate-50">
                    <TableCell>
                      <input
                        type="checkbox"
                        className="rounded border-slate-300"
                        checked={selectedRows.has(requestId)}
                        onChange={(e) => handleSelectRow(requestId, e.target.checked)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-full ${getAvatarColor(request.applicantName)} flex items-center justify-center text-white font-semibold text-sm`}>
                          {getInitials(request.applicantName)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{request.applicantName}</div>
                          <div className="text-sm text-slate-600">{request.applicantEmail}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-900">{request.destination}</TableCell>
                    <TableCell className="text-slate-900">{formatDate(request.travelDate)}</TableCell>
                    <TableCell className="text-slate-900 font-medium">
                      ${calculateBudget(request).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getStatusBadgeStyle(request.status)} flex items-center gap-1.5 w-fit`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${getStatusDotColor(request.status)}`}></span>
                        {statusLabels[request.status] || request.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link href={`/requests/${requestId}`}>
                        <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 hover:bg-primary/10">
                          View
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="p-4 border-t border-slate-200 flex items-center justify-between">
        <div className="text-sm text-slate-600">
          Showing {startIndex + 1} to {Math.min(endIndex, filteredRequests.length)} of {filteredRequests.length} results
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-slate-200"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            &lt;
          </Button>
          {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
            const pageNum = i + 1;
            if (totalPages > 10) {
              if (pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? 'default' : 'outline'}
                    size="sm"
                    className={
                      currentPage === pageNum
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-slate-200 text-slate-700'
                    }
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                return <span key={pageNum} className="text-slate-600">...</span>;
              }
              return null;
            }
            return (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? 'default' : 'outline'}
                size="sm"
                className={
                  currentPage === pageNum
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-slate-200 text-slate-700'
                }
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </Button>
            );
          })}
          <Button
            variant="outline"
            size="sm"
            className="border-slate-200"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            &gt;
          </Button>
        </div>
      </div>
    </div>
  );
}










