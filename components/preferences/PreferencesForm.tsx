'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import type { User } from '@/lib/types/user';
import { Lock, Bell, Shield, Key, Mail } from 'lucide-react';
import { toast } from 'sonner';

interface PreferencesFormProps {
  user: User;
}

const roleLabels: Record<string, string> = {
  branch_officer: 'Branch Officer',
  operations: 'Operations',
  ops_head: 'Operations Head',
  admin: 'Administrator',
};

const departmentOptions = [
  'Travel Management',
  'Operations',
  'Finance',
  'Human Resources',
  'IT',
  'Administration',
];

export function PreferencesForm({ user }: PreferencesFormProps) {
  const [formData, setFormData] = useState({
    fullName: user.name,
    email: user.email,
    department: 'Travel Management',
    role: roleLabels[user.role] || user.role,
  });

  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false,
  });

  const [notificationData, setNotificationData] = useState({
    emailNotifications: true,
    requestUpdates: true,
    systemAlerts: true,
    weeklyDigest: false,
  });

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

  const router = useRouter();

  const handleSave = async () => {
    if (securityData.newPassword) {
      if (securityData.newPassword !== securityData.confirmPassword) {
        toast.error('New passwords do not match');
        return;
      }
      if (securityData.newPassword.length < 8) {
        toast.error('Password must be at least 8 characters');
        return;
      }
      if (!securityData.currentPassword) {
        toast.error('Please enter your current password');
        return;
      }
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success('Preferences saved successfully');
      router.refresh();
    } catch (error) {
      toast.error('Failed to save preferences');
    }
  };

  const handleCancel = () => {
    setFormData({
      fullName: user.name,
      email: user.email,
      department: 'Travel Management',
      role: roleLabels[user.role] || user.role,
    });
    setSecurityData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      twoFactorEnabled: false,
    });
    toast.info('Changes discarded');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end gap-3">
        <Button
          variant="outline"
          onClick={handleCancel}
          className="border-slate-200 text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          Save Changes
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start gap-4">
            <div className={`h-20 w-20 rounded-full ${getAvatarColor(user.name)} flex items-center justify-center text-white font-semibold text-2xl`}>
              {getInitials(user.name)}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate-900 text-lg">{user.name}</p>
              <p className="text-sm text-slate-600 mt-1">{roleLabels[user.role] || user.role}</p>
              <div className="flex items-center gap-3 mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                >
                  Change Avatar
                </Button>
                <button className="text-sm text-slate-600 hover:text-slate-900">
                  Remove
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName" className="text-sm font-medium text-slate-900">
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="department" className="text-sm font-medium text-slate-900">
                  Department
                </Label>
                <select
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="mt-1.5 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  {departmentOptions.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-slate-900">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="role" className="text-sm font-medium text-slate-900">
                  Role
                </Label>
                <Input
                  id="role"
                  value={formData.role}
                  disabled
                  className="mt-1.5 bg-slate-50 text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-slate-600" />
            <CardTitle className="text-lg font-semibold">Security Settings</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Key className="h-4 w-4" />
              Change Password
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="currentPassword" className="text-sm font-medium text-slate-700">
                  Current Password
                </Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={securityData.currentPassword}
                  onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="newPassword" className="text-sm font-medium text-slate-700">
                  New Password
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={securityData.newPassword}
                  onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                  className="mt-1.5"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">
                Confirm New Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={securityData.confirmPassword}
                onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                className="mt-1.5 max-w-md"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Two-Factor Authentication
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Add an extra layer of security to your account
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={securityData.twoFactorEnabled}
                  onChange={(e) => setSecurityData({ ...securityData, twoFactorEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-slate-600" />
            <CardTitle className="text-lg font-semibold">Notification Preferences</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-slate-900 flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-500" />
                Email Notifications
              </p>
              <p className="text-xs text-slate-600 mt-1">
                Receive email notifications for important updates
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notificationData.emailNotifications}
                onChange={(e) => setNotificationData({ ...notificationData, emailNotifications: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-2 border-t border-slate-100">
            <div>
              <p className="text-sm font-medium text-slate-900">Request Updates</p>
              <p className="text-xs text-slate-600 mt-1">
                Get notified when requests are updated or require action
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notificationData.requestUpdates}
                onChange={(e) => setNotificationData({ ...notificationData, requestUpdates: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-2 border-t border-slate-100">
            <div>
              <p className="text-sm font-medium text-slate-900">System Alerts</p>
              <p className="text-xs text-slate-600 mt-1">
                Receive alerts for system maintenance and important announcements
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notificationData.systemAlerts}
                onChange={(e) => setNotificationData({ ...notificationData, systemAlerts: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-2 border-t border-slate-100">
            <div>
              <p className="text-sm font-medium text-slate-900">Weekly Digest</p>
              <p className="text-xs text-slate-600 mt-1">
                Receive a weekly summary of your activity
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notificationData.weeklyDigest}
                onChange={(e) => setNotificationData({ ...notificationData, weeklyDigest: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}







