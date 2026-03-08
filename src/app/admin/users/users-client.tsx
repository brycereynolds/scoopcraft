'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateUserRole } from '@/actions/admin';
import type { AdminUser } from '@/actions/admin';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Search, Shield, User } from 'lucide-react';

type Props = {
  users: AdminUser[];
};

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function UsersClient({ users }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [roleTarget, setRoleTarget] = useState<AdminUser | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = search.trim()
    ? users.filter((u) => {
        const term = search.toLowerCase();
        return (
          u.email.toLowerCase().includes(term) ||
          (u.firstName ?? '').toLowerCase().includes(term) ||
          (u.lastName ?? '').toLowerCase().includes(term)
        );
      })
    : users;

  const adminCount = users.filter((u) => u.role === 'admin').length;
  const customerCount = users.filter((u) => u.role === 'customer').length;

  function handleRoleChange() {
    if (!roleTarget) return;
    const newRole = roleTarget.role === 'admin' ? 'customer' : 'admin';
    startTransition(async () => {
      try {
        await updateUserRole(roleTarget.id, newRole);
        toast.success(
          `${roleTarget.email} is now a${newRole === 'admin' ? 'n admin' : ' customer'}`
        );
        setRoleTarget(null);
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to update role');
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="flex flex-wrap gap-4">
        {[
          { label: 'Total Users', value: users.length, color: 'var(--foreground)' },
          { label: 'Customers', value: customerCount, color: '#1E40AF' },
          { label: 'Admins', value: adminCount, color: '#9B1D4A' },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl border px-4 py-3 min-w-[100px]"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
              {s.label}
            </p>
            <p className="text-2xl font-bold mt-0.5" style={{ color: s.color }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
          style={{ color: 'var(--foreground-muted)' }}
        />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="pl-9"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)',
            color: 'var(--foreground)',
          }}
        />
      </div>

      {/* Table */}
      <Card
        className="border overflow-hidden"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        {filtered.length === 0 ? (
          <div className="py-16 text-center" style={{ color: 'var(--foreground-muted)' }}>
            {search ? 'No users match your search.' : 'No users found.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr
                  style={{
                    borderBottom: '1px solid var(--border)',
                    backgroundColor: 'var(--muted)',
                  }}
                >
                  {['User', 'Role', 'Orders', 'Total Spent', 'Joined', 'Actions'].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left font-medium whitespace-nowrap"
                      style={{ color: 'var(--foreground-secondary)' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => {
                  const name = [user.firstName, user.lastName].filter(Boolean).join(' ');
                  const isAdmin = user.role === 'admin';
                  return (
                    <tr
                      key={user.id}
                      className="transition-colors hover:bg-muted/40"
                      style={{ borderBottom: '1px solid var(--border)' }}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold"
                            style={{
                              backgroundColor: isAdmin ? '#FDE8F0' : 'var(--muted)',
                              color: isAdmin ? '#9B1D4A' : 'var(--foreground-secondary)',
                            }}
                          >
                            {(name || user.email)[0].toUpperCase()}
                          </div>
                          <div>
                            {name && (
                              <p className="font-medium" style={{ color: 'var(--foreground)' }}>
                                {name}
                              </p>
                            )}
                            <p
                              className={name ? 'text-xs' : 'font-medium'}
                              style={{ color: name ? 'var(--foreground-muted)' : 'var(--foreground)' }}
                            >
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize"
                          style={{
                            backgroundColor: isAdmin ? '#FDE8F0' : 'var(--muted)',
                            color: isAdmin ? '#9B1D4A' : 'var(--foreground-secondary)',
                          }}
                        >
                          {isAdmin ? (
                            <Shield className="h-3 w-3" />
                          ) : (
                            <User className="h-3 w-3" />
                          )}
                          {user.role}
                        </span>
                      </td>
                      <td
                        className="px-4 py-3 font-medium"
                        style={{ color: 'var(--foreground-secondary)' }}
                      >
                        {user.orderCount}
                      </td>
                      <td className="px-4 py-3 font-medium" style={{ color: 'var(--foreground)' }}>
                        ${parseFloat(user.totalSpent).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--foreground-muted)' }}>
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setRoleTarget(user)}
                          className="text-xs font-medium px-2.5 py-1 rounded-lg transition-colors hover:bg-muted"
                          style={{ color: 'var(--foreground-secondary)' }}
                        >
                          Change Role
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Role change confirmation dialog */}
      <Dialog open={!!roleTarget} onOpenChange={(v) => !v && setRoleTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle style={{ color: 'var(--foreground)' }}>Change User Role</DialogTitle>
          </DialogHeader>
          <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
            Change{' '}
            <strong style={{ color: 'var(--foreground)' }}>{roleTarget?.email}</strong> from{' '}
            <strong style={{ color: 'var(--foreground)' }}>{roleTarget?.role}</strong> to{' '}
            <strong style={{ color: 'var(--foreground)' }}>
              {roleTarget?.role === 'admin' ? 'customer' : 'admin'}
            </strong>
            ?
            {roleTarget?.role === 'customer' && (
              <span className="block mt-2 text-xs" style={{ color: '#9B1D4A' }}>
                Warning: Admins have full access to the management dashboard.
              </span>
            )}
          </p>
          <div className="flex justify-end gap-2 mt-2">
            <Button
              variant="outline"
              onClick={() => setRoleTarget(null)}
              style={{ borderColor: 'var(--border)', color: 'var(--foreground-secondary)' }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRoleChange}
              disabled={isPending}
              style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
            >
              {isPending ? 'Updating...' : 'Confirm'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
