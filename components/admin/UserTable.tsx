'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { UserForm } from '@/components/admin/UserForm';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { BankStaff } from '@/lib/types/user';
import { getAllBankStaff, deactivateBankStaff } from '@/lib/services/admin-service';
import { Plus, Search, Edit, Trash2, UserCheck, UserX } from 'lucide-react';
import { toast } from 'sonner';

export function UserTable() {
  const [staff, setStaff] = useState<BankStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editStaff, setEditStaff] = useState<BankStaff | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    try {
      setLoading(true);
      const data = await getAllBankStaff();
      setStaff(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load bank staff');
    } finally {
      setLoading(false);
    }
  };

  const filteredStaff = (Array.isArray(staff) ? staff : []).filter(
    (s) =>
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.role.roleName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeactivate = async (staffId: number, isActive: boolean) => {
    const action = isActive ? 'deactivate' : 'reactivate';
    if (!confirm(`Are you sure you want to ${action} this staff member?`)) return;

    try {
      await deactivateBankStaff(staffId);
      toast.success(`Staff ${action}d successfully`);
      loadStaff(); // Reload data
    } catch (error: any) {
      toast.error(error.message || `Failed to ${action} staff`);
    }
  };

  const handleSaveSuccess = () => {
    setCreateOpen(false);
    setEditStaff(null);
    loadStaff(); // Reload data
  };

  const roleLabels: Record<string, string> = {
    BRANCH_USER: 'Branch User',
    OPERATIONS: 'Operations',
    OPERATIONS_HEAD: 'Operations Head',
    CARD_ISSUANCE: 'Card Issuance',
    PRINTING: 'Printing',
    ADMIN: 'Admin',
  };

  if (loading) {
    return (
      <Card className="p-8">
        <LoadingSpinner />
      </Card>
    );
  }

  return (
    <Card>
      <div className="p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search staff..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Register Staff
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Full Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Branch</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStaff.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <EmptyState
                    title="No staff found"
                    description="Try adjusting your search criteria or register new staff."
                  />
                </TableCell>
              </TableRow>
            ) : (
              filteredStaff.map((s) => (
                <TableRow key={s.staffId}>
                  <TableCell className="font-medium">{s.fullName}</TableCell>
                  <TableCell>{s.email}</TableCell>
                  <TableCell className="font-mono text-sm">{s.username}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {roleLabels[s.role.roleName] || s.role.roleName}
                    </Badge>
                  </TableCell>
                  <TableCell>{s.branchName || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={s.isActive ? 'default' : 'secondary'}>
                      {s.isActive ? (
                        <span className="flex items-center gap-1">
                          <UserCheck className="h-3 w-3" />
                          Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <UserX className="h-3 w-3" />
                          Inactive
                        </span>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditStaff(s)}
                        title="Edit staff"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeactivate(s.staffId, s.isActive)}
                        title={s.isActive ? 'Deactivate' : 'Reactivate'}
                      >
                        {s.isActive ? (
                          <UserX className="h-4 w-4 text-red-600" />
                        ) : (
                          <UserCheck className="h-4 w-4 text-green-600" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Register New Bank Staff</DialogTitle>
            <DialogDescription>
              Register a new staff member who can login with Active Directory credentials
            </DialogDescription>
          </DialogHeader>
          <UserForm onSuccess={handleSaveSuccess} onCancel={() => setCreateOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editStaff} onOpenChange={() => setEditStaff(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Bank Staff</DialogTitle>
            <DialogDescription>Update staff member information</DialogDescription>
          </DialogHeader>
          {editStaff && (
            <UserForm
              staff={editStaff}
              onSuccess={handleSaveSuccess}
              onCancel={() => setEditStaff(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}










