export const dynamic = 'force-dynamic';

import { SettingsClient } from './settings-client';

export default async function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
          Settings
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--foreground-muted)' }}>
          Configure your store, notifications, orders, and security settings.
        </p>
      </div>

      <SettingsClient />
    </div>
  );
}
