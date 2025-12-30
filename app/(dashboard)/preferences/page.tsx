import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { PreferencesForm } from '@/components/preferences/PreferencesForm';

export default async function PreferencesPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">User Preferences</h1>
          <p className="text-slate-600 mt-1">
            Manage your personal information, security settings, and notification preferences.
          </p>
        </div>
      </div>

      <PreferencesForm user={user} />
    </div>
  );
}







