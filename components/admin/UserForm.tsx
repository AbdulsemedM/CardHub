'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { BankStaff, StaffRole } from '@/lib/types/user';
import type { BranchListItem } from '@/lib/types/branch';
import { registerBankStaff, updateBankStaff, getAllRoles } from '@/lib/services/admin-service';
import { getBranchList } from '@/lib/services/branch-list-service';
import { toast } from 'sonner';

interface UserFormProps {
  staff?: BankStaff;
  onSuccess: () => void;
  onCancel: () => void;
}

export function UserForm({ staff, onSuccess, onCancel }: UserFormProps) {
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<{ roleId: number; roleName: string; description?: string }[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [branches, setBranches] = useState<BranchListItem[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(true);
  const [formData, setFormData] = useState({
    email: staff?.email || '',
    username: staff?.username || '',
    fullName: staff?.fullName || '',
    roleName: staff?.role.roleName || '',
    branchName: staff?.branchName || '',
    branchCode: staff?.branchCode || '',
    isActive: staff?.isActive ?? true,
  });

  useEffect(() => {
    getAllRoles()
      .then((data) => setRoles(Array.isArray(data) ? data : []))
      .catch(() => toast.error('Failed to load roles'))
      .finally(() => setRolesLoading(false));
  }, []);

  useEffect(() => {
    if (staff) {
      setFormData((prev) => ({ ...prev, roleName: staff.role.roleName }));
    } else if (roles.length > 0) {
      setFormData((prev) => ({ ...prev, roleName: prev.roleName || roles[0].roleName }));
    }
  }, [staff, roles]);

  useEffect(() => {
    if (!staff) {
      getBranchList()
        .then(setBranches)
        .catch(() => toast.error('Failed to load branches'))
        .finally(() => setBranchesLoading(false));
    } else {
      setBranchesLoading(false);
    }
  }, [staff]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (staff) {
        // Update existing staff
        await updateBankStaff(staff.staffId, {
          roleName: formData.roleName as StaffRole,
          fullName: formData.fullName,
          isActive: formData.isActive,
        });
        toast.success('Staff updated successfully');
      } else {
        // Register new staff
        await registerBankStaff({
          email: formData.email,
          username: formData.username,
          roleName: formData.roleName as StaffRole,
          fullName: formData.fullName || undefined,
          branchName: formData.branchName || undefined,
          branchCode: formData.branchCode || undefined,
        });
        toast.success('Staff registered successfully. They can now login with AD credentials.');
      }
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save staff');
    } finally {
      setLoading(false);
    }
  };

  const isEditing = !!staff;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">
            Email *
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="john.doe@coopbank.local"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            disabled={isEditing || loading}
          />
          {!isEditing && (
            <p className="text-xs text-slate-500">
              Staff will use this email to login via Active Directory
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="username">
            Username *
          </Label>
          <Input
            id="username"
            type="text"
            placeholder="jdoe"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
            disabled={isEditing || loading}
          />
          {!isEditing && (
            <p className="text-xs text-slate-500">
              Active Directory username
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          placeholder="John Doe"
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role *</Label>
        <select
          id="role"
          value={formData.roleName}
          onChange={(e) => setFormData({ ...formData, roleName: e.target.value })}
          className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950"
          required
          disabled={loading || rolesLoading}
        >
          <option value="">{rolesLoading ? 'Loading roles...' : 'Select a role'}</option>
          {roles.map((r) => (
            <option key={r.roleId} value={r.roleName}>
              {r.roleName}
            </option>
          ))}
        </select>
        {!rolesLoading && roles.length === 0 && (
          <p className="text-xs text-amber-600">
            No roles yet. Create roles in Admin → Roles first.
          </p>
        )}
      </div>

      {!isEditing && (
        <div className="space-y-2">
          <Label htmlFor="branch">Branch</Label>
          <select
            id="branch"
            value={formData.branchCode || ''}
            onChange={(e) => {
              const branch = branches.find((b) => b.branchCode === e.target.value);
              setFormData({
                ...formData,
                branchCode: branch?.branchCode || '',
                branchName: branch?.branchName || '',
              });
            }}
            className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950"
            disabled={loading || branchesLoading}
          >
            <option value="">Select a branch (optional)</option>
            {branches.map((b) => (
              <option key={b.branchListId} value={b.branchCode}>
                {b.branchName} ({b.branchCode})
              </option>
            ))}
          </select>
          {branchesLoading && (
            <p className="text-xs text-slate-500">Loading branches...</p>
          )}
        </div>
      )}

      {isEditing && (
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="rounded border-slate-300"
            disabled={loading}
          />
          <Label htmlFor="isActive">Active</Label>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : (isEditing ? 'Update Staff' : 'Register Staff')}
        </Button>
      </div>
    </form>
  );
}










