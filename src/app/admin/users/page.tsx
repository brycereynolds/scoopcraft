export const dynamic = 'force-dynamic';

import { getAllUsers } from '@/actions/admin';
import { UsersClient } from './users-client';

export default async function AdminUsersPage() {
  const users = await getAllUsers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
          Users
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--foreground-muted)' }}>
          Manage all user accounts and roles.
        </p>
      </div>

      <UsersClient users={users} />
    </div>
  );
}
