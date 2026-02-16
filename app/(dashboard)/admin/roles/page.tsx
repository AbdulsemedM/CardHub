import { requireRole } from '@/lib/auth';
import { RolesTable } from '@/components/admin/RolesTable';

export default async function RolesPage() {
  await requireRole(['admin']);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Roles</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Create and manage roles. Create roles here before registering bank staff (e.g. BRANCH_USER, BRANCH, OPERATIONS, OPERATIONS_HEAD, CARD_ISSUANCE, PRINTING).
        </p>
      </div>

      <RolesTable />
    </div>
  );
}
