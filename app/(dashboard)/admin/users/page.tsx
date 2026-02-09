import { getCurrentUser, requireRole } from '@/lib/auth';
import { UserTable } from '@/components/admin/UserTable';

export default async function UsersPage() {
  const user = await requireRole(['admin']);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Bank Staff Management</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Register and manage bank staff members across all roles and branches
        </p>
      </div>

      <UserTable />
    </div>
  );
}










