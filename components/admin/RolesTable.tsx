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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { Role } from '@/lib/types/user';
import { getAllRoles, createRole } from '@/lib/services/admin-service';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

function formatDate(iso?: string) {
  if (!iso) return '–';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function formatRoleDisplay(name: string, description?: string) {
  if (description?.trim()) return description;
  return name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function RolesTable() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formRoleName, setFormRoleName] = useState('');
  const [formDescription, setFormDescription] = useState('');

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const data = await getAllRoles();
      setRoles(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load roles');
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = formRoleName.trim();
    if (!name) return;
    setSubmitting(true);
    try {
      await createRole({
        roleName: name,
        description: formDescription.trim() || undefined,
      });
      toast.success(`Role "${name}" created`);
      setCreateOpen(false);
      setFormRoleName('');
      setFormDescription('');
      loadRoles();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create role');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenCreate = () => {
    setFormRoleName('');
    setFormDescription('');
    setCreateOpen(true);
  };

  if (loading) {
    return (
      <Card className="p-8">
        <LoadingSpinner />
      </Card>
    );
  }

  return (
    <>
      <Card>
        <div className="p-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {roles.length} role(s). Create missing roles before registering staff.
            </p>
            <Button onClick={handleOpenCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Add Role
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Registered</TableHead>
                <TableHead>Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <EmptyState
                      title="No roles yet"
                      description="Create roles so you can assign them when registering bank staff."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                roles.map((r) => (
                  <TableRow key={r.roleId}>
                    <TableCell className="font-medium">
                      {formatRoleDisplay(r.roleName, r.description)}
                    </TableCell>
                    <TableCell>{r.description || '–'}</TableCell>
                    <TableCell className="text-slate-600 text-sm">
                      {formatDate(r.registeredAt)}
                    </TableCell>
                    <TableCell className="text-slate-600 text-sm">
                      {formatDate(r.updatedAt)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create role</DialogTitle>
            <DialogDescription>
              Create a role via POST /api/v1/roles. Enter the role name (e.g. OPERATIONS, BRANCH_USER). Created roles can then be assigned when registering bank staff.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="roleName">Role name *</Label>
              <Input
                id="roleName"
                placeholder="e.g. OPERATIONS, BRANCH_USER"
                value={formRoleName}
                onChange={(e) => setFormRoleName(e.target.value)}
                disabled={submitting}
                className="w-full"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                placeholder="e.g. Branch staff user"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                disabled={submitting}
                className="w-full"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting || !formRoleName.trim()}>
                {submitting ? 'Creating...' : 'Create role'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
